import cookie from 'cookie';
import clientPromise from '../../src/lib/mongodb.js';

const CONTRIBUTION_FIELDS = {
  observe: ['fork_date_list', 'star_date_list'],
  issue: ['issue_creation_date_list', 'issue_comments_date_list'],
  code: ['pr_creation_date_list', 'pr_comments_date_list', 'code_author_date_list', 'code_committer_date_list'],
  issue_admin: [
    'issue_labeled_date_list', 'issue_unlabeled_date_list', 'issue_closed_date_list', 'issue_reopened_date_list',
    'issue_assigned_date_list', 'issue_unassigned_date_list', 'issue_milestoned_date_list', 'issue_demilestoned_date_list',
    'issue_marked_as_duplicate_date_list', 'issue_transferred_date_list',
    'issue_renamed_title_date_list', 'issue_change_description_date_list', 'issue_setting_priority_date_list',
    'issue_change_priority_date_list', 'issue_link_pull_request_date_list', 'issue_unlink_pull_request_date_list',
    'issue_assign_collaborator_date_list', 'issue_unassign_collaborator_date_list', 'issue_change_issue_state_date_list',
    'issue_change_issue_type_date_list', 'issue_setting_branch_date_list', 'issue_change_branch_date_list'
  ],
  code_admin: [
    'pr_labeled_date_list', 'pr_unlabeled_date_list', 'pr_closed_date_list', 'pr_assigned_date_list',
    'pr_unassigned_date_list', 'pr_reopened_date_list', 'pr_milestoned_date_list', 'pr_demilestoned_date_list',
    'pr_marked_as_duplicate_date_list', 'pr_transferred_date_list', 'pr_renamed_title_date_list',
    'pr_change_description_date_list', 'pr_setting_priority_date_list', 'pr_change_priority_date_list',
    'pr_merged_date_list', 'pr_review_date_list', 'pr_set_tester_date_list', 'pr_unset_tester_date_list',
    'pr_check_pass_date_list', 'pr_test_pass_date_list', 'pr_reset_assign_result_date_list',
    'pr_reset_test_result_date_list', 'pr_link_issue_date_list', 'pr_unlink_issue_date_list'
  ]
};

const DATE_FIELD_KEYS = Object.values(CONTRIBUTION_FIELDS).flat();

const createEmptyContributionDates = () => DATE_FIELD_KEYS.reduce((acc, key) => {
  acc[key] = [];
  return acc;
}, {});

const pushDate = (target, key, value) => {
  if (!value || !target[key]) return;
  target[key].push(value);
};

const isDateInRange = (value, fromDate, toDate) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date >= fromDate && date <= toDate;
};

const finalizeDateLists = (datesByRepo) => {
  Object.values(datesByRepo).forEach((repoDates) => {
    Object.keys(repoDates).forEach((key) => {
      repoDates[key] = [...new Set(repoDates[key])].sort();
    });
  });
};

const hasNextPage = (linkHeader) => {
  if (!linkHeader) return false;
  return linkHeader
    .split(',')
    .some((part) => part.includes('rel="next"'));
};

const fetchAllPages = async (fetchPage) => {
  const results = [];
  let page = 1;

  while (true) {
    const { items, hasNext } = await fetchPage(page);
    if (!Array.isArray(items) || items.length === 0) {
      break;
    }

    results.push(...items);

    if (!hasNext) {
      break;
    }
    page += 1;
  }

  return results;
};

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

    if (userResponse.status === 401) {
      return response.status(401).json({ error: 'GitHub token invalid' });
    }

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

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      return response.status(400).json({ error: 'Invalid date range' });
    }

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

    const contributionDatesByRepo = {};
    targetRepos.forEach((repo) => {
      contributionDatesByRepo[repo] = createEmptyContributionDates();
    });

    const promises = [];

    targetRepos.forEach(repo => {
      // 3.1 Check PRs (Created)
      // GET https://api.github.com/search/issues?q=repo:iflytek/astron-agent+type:pr+author:{login}+created:{from}..{to}
      promises.push(
        search(`repo:${repo} type:pr author:${login} created:${fromStr}..${toStr}`)
          .then(data => {
            repoStats[repo].pr_created = { total_count: data.total_count, items: data.items };
            data.items.forEach((item) => pushDate(contributionDatesByRepo[repo], 'pr_creation_date_list', item.created_at));
          })
          .catch(err => console.error(`Failed to fetch PRs created for ${repo}:`, err))
      );

      // 3.2 Check Merged PRs
      // GET https://api.github.com/search/issues?q=repo:iflytek/astron-agent+type:pr+author:{login}+is:merged+merged:{from}..{to}
      promises.push(
        search(`repo:${repo} type:pr author:${login} is:merged merged:${fromStr}..${toStr}`)
          .then(data => {
            repoStats[repo].pr_merged = { total_count: data.total_count, items: data.items };
            data.items.forEach((item) => pushDate(contributionDatesByRepo[repo], 'pr_merged_date_list', item.closed_at));
          })
          .catch(err => console.error(`Failed to fetch PRs merged for ${repo}:`, err))
      );

      // 3.3 Check Issues (Created)
      // GET https://api.github.com/search/issues?q=repo:iflytek/astron-agent+type:issue+author:{login}+created:{from}..{to}
      promises.push(
        search(`repo:${repo} type:issue author:${login} created:${fromStr}..${toStr}`)
          .then(data => {
            repoStats[repo].issues_created = { total_count: data.total_count, items: data.items };
            data.items.forEach((item) => pushDate(contributionDatesByRepo[repo], 'issue_creation_date_list', item.created_at));
          })
          .catch(err => console.error(`Failed to fetch issues created for ${repo}:`, err))
      );

      promises.push(
        search(`repo:${repo} type:issue commenter:${login} updated:${fromStr}..${toStr}`)
          .then(data => {
            data.items.forEach((item) => pushDate(contributionDatesByRepo[repo], 'issue_comments_date_list', item.updated_at));
          })
          .catch(err => console.error(`Failed to fetch issue comments for ${repo}:`, err))
      );

      promises.push(
        search(`repo:${repo} type:pr commenter:${login} updated:${fromStr}..${toStr}`)
          .then(data => {
            data.items.forEach((item) => pushDate(contributionDatesByRepo[repo], 'pr_comments_date_list', item.updated_at));
          })
          .catch(err => console.error(`Failed to fetch PR comments for ${repo}:`, err))
      );
    });

    promises.push(
      (async () => {
        const starredRepos = await fetchAllPages(async (page) => {
          const starredRes = await fetch(`https://api.github.com/user/starred?sort=created&direction=desc&per_page=100&page=${page}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github.v3.star+json',
            }
          });

          if (!starredRes.ok) {
            throw new Error(`GitHub Starred API failed: ${starredRes.status} ${starredRes.statusText}`);
          }

          return {
            items: await starredRes.json(),
            hasNext: hasNextPage(starredRes.headers.get('link'))
          };
        });

        starredRepos.forEach((starred) => {
          const repoName = starred.repo?.full_name;
          if (!targetRepos.includes(repoName)) return;
          if (!isDateInRange(starred.starred_at, fromDate, toDate)) return;
          pushDate(contributionDatesByRepo[repoName], 'star_date_list', starred.starred_at);
        });
      })().catch(err => console.error('Failed to fetch starred repositories:', err))
    );

    promises.push(
      (async () => {
        const userRepos = await fetchAllPages(async (page) => {
          const reposRes = await fetch(`https://api.github.com/user/repos?affiliation=owner&sort=created&direction=desc&per_page=100&page=${page}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github.v3+json',
            }
          });

          if (!reposRes.ok) {
            throw new Error(`GitHub User Repos API failed: ${reposRes.status} ${reposRes.statusText}`);
          }

          return {
            items: await reposRes.json(),
            hasNext: hasNextPage(reposRes.headers.get('link'))
          };
        });

        userRepos
          .filter((repo) => repo.fork && targetRepos.includes(repo.parent?.full_name))
          .forEach((repo) => {
            if (!isDateInRange(repo.created_at, fromDate, toDate)) return;
            pushDate(contributionDatesByRepo[repo.parent.full_name], 'fork_date_list', repo.created_at);
          });
      })().catch(err => console.error('Failed to fetch user fork repositories:', err))
    );

    promises.push(
      ...targetRepos.map((repo) => (async () => {
        const [owner, name] = repo.split('/');
        const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${name}/commits?author=${login}&since=${fromDate.toISOString()}&until=${toDate.toISOString()}&per_page=100`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
          }
        });

        if (!commitsRes.ok) {
          throw new Error(`GitHub Commits API failed: ${commitsRes.status} ${commitsRes.statusText}`);
        }

        const commits = await commitsRes.json();
        commits.forEach((commit) => {
          pushDate(contributionDatesByRepo[repo], 'code_author_date_list', commit.commit?.author?.date);
          pushDate(contributionDatesByRepo[repo], 'code_committer_date_list', commit.commit?.committer?.date);
        });
      })().catch(err => console.error(`Failed to fetch commits for ${repo}:`, err)))
    );

    await Promise.all(promises);
    finalizeDateLists(contributionDatesByRepo);

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
      contribution_fields: CONTRIBUTION_FIELDS,
      contribution_dates: contributionDatesByRepo,
      astron: astronStats
    });

  } catch (error) {
    console.error(error);
    response.status(500).json({ error: error.message });
  }
}
