import cookie from 'cookie';

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

    // 2. Calculate time range (last 1 year)
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    // 3. GraphQL Query
    const query = `
      query($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          contributionsCollection(from: $from, to: $to) {
            commitContributionsByRepository(maxRepositories: 100) {
              repository { nameWithOwner }
              contributions { totalCount }
            }
            pullRequestContributionsByRepository(maxRepositories: 100) {
              repository { nameWithOwner }
              contributions { totalCount }
            }
            issueContributionsByRepository(maxRepositories: 100) {
              repository { nameWithOwner }
              contributions { totalCount }
            }
            pullRequestReviewContributionsByRepository(maxRepositories: 100) {
              repository { nameWithOwner }
              contributions { totalCount }
            }
          }
        }
      }
    `;

    const graphqlResponse = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          login,
          from: oneYearAgo.toISOString(),
          to: now.toISOString(),
        },
      }),
    });

    const graphqlData = await graphqlResponse.json();
    
    if (graphqlData.errors) {
      throw new Error(graphqlData.errors[0].message);
    }

    const contributions = graphqlData.data.user.contributionsCollection;
    
    // 4. Aggregate data for specific repos
    const targetRepos = ['iflytek/astron-agent', 'iflytek/astron-rpa'];
    const repoStats = {};

    targetRepos.forEach(repo => {
      repoStats[repo] = { commits: 0, prs: 0, issues: 0, reviews: 0 };
    });

    // Helper to aggregate
    const aggregate = (list, key) => {
      list.forEach(item => {
        const name = item.repository.nameWithOwner;
        if (targetRepos.includes(name)) {
          repoStats[name][key] = item.contributions.totalCount;
        }
      });
    };

    aggregate(contributions.commitContributionsByRepository, 'commits');
    aggregate(contributions.pullRequestContributionsByRepository, 'prs');
    aggregate(contributions.issueContributionsByRepository, 'issues');
    aggregate(contributions.pullRequestReviewContributionsByRepository, 'reviews');

    response.status(200).json({
      user: {
        login: userData.login,
        name: userData.name,
        avatar_url: userData.avatar_url,
      },
      range: { from: oneYearAgo, to: now },
      repos: repoStats
    });

  } catch (error) {
    console.error(error);
    response.status(500).json({ error: error.message });
  }
}
