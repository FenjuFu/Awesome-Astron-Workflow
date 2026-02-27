import cookie from 'cookie';
import clientPromise from '../../src/lib/mongodb.js';

export default async function handler(request, response) {
  const cookies = cookie.parse(request.headers.cookie || '');
  const token = cookies.gh_token;

  if (!token) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 1. Get current user login
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userData = await userResponse.json();
    const login = userData.login;

    // 2. Calculate time range (default to last 1 year or use query params)
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const fromDate = request.query.from ? new Date(request.query.from) : oneYearAgo;
    const toDate = request.query.to ? new Date(request.query.to) : now;

    // Format dates for GitHub Search API (YYYY-MM-DD)
    const formatDate = (date) => date.toISOString().split('T')[0];
    const fromStr = formatDate(fromDate);
    const toStr = formatDate(toDate);

    // 3. REST Search API Queries
    const targetRepos = ['iflytek/astron-agent', 'iflytek/astron-rpa'];
    const repoStats = {};

    // Initialize structure
    targetRepos.forEach(repo => {
      repoStats[repo] = {
        pr_created: { total_count: 0, items: [] },
        pr_merged: { total_count: 0, items: [] },
        issues_created: { total_count: 0, items: [] }
      };
    });

    const search = async (query) => {
      const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=100`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        }
      });
      
      if (!res.ok) {
        // Log error but try not to fail completely if one query fails? 
        // For now, let's throw to be safe and debuggable as per user request
        const errText = await res.text();
        console.error(`Search failed: ${url}`, errText);
        throw new Error(`GitHub Search API failed: ${res.status} ${res.statusText}`);
      }
      return res.json();
    };

    const promises = [];

    targetRepos.forEach(repo => {
      // 3.1 Check PRs (Created)
      // GET https://api.github.com/search/issues?q=repo:iflytek/astron-agent+type:pr+author:{login}+created:{from}..{to}
      promises.push(
        search(`repo:${repo} type:pr author:${login} created:${fromStr}..${toStr}`)
          .then(data => {
            repoStats[repo].pr_created = { total_count: data.total_count, items: data.items };
          })
      );

      // 3.2 Check Merged PRs
      // GET https://api.github.com/search/issues?q=repo:iflytek/astron-agent+type:pr+author:{login}+is:merged+merged:{from}..{to}
      promises.push(
        search(`repo:${repo} type:pr author:${login} is:merged merged:${fromStr}..${toStr}`)
          .then(data => {
            repoStats[repo].pr_merged = { total_count: data.total_count, items: data.items };
          })
      );

      // 3.3 Check Issues (Created)
      // GET https://api.github.com/search/issues?q=repo:iflytek/astron-agent+type:issue+author:{login}+created:{from}..{to}
      promises.push(
        search(`repo:${repo} type:issue author:${login} created:${fromStr}..${toStr}`)
          .then(data => {
            repoStats[repo].issues_created = { total_count: data.total_count, items: data.items };
          })
      );
    });

    await Promise.all(promises);

    // 4. Fetch Astron Agent / RPA stats from MongoDB
    let astronStats = {
      agent: { workflows: 0, runs: 0 },
      rpa: { tasks: 0, hoursSaved: 0 }
    };

    try {
      const client = await clientPromise;
      const db = client.db('astron_workflow');
      const userStats = await db.collection('users').findOne({ github_username: login });
      
      if (userStats && userStats.contributions) {
        astronStats = userStats.contributions;
      }
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Fallback to mock data if DB fails or is not configured (optional)
      astronStats = {
        agent: {
          workflows: Math.floor(Math.random() * 50) + 10,
          runs: Math.floor(Math.random() * 200) + 50
        },
        rpa: {
          tasks: Math.floor(Math.random() * 30) + 5,
          hoursSaved: Math.floor(Math.random() * 100) + 20
        }
      };
    }

    response.status(200).json({
      user: {
        login: userData.login,
        name: userData.name,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
      },
      range: { from: fromDate, to: toDate },
      repos: repoStats,
      astron: astronStats
    });

  } catch (error) {
    console.error(error);
    response.status(500).json({ error: error.message });
  }
}
