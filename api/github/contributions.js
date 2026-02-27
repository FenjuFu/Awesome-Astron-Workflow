export default async function handler(request, response) {
  const { username, repos } = request.query;
  const token = request.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    response.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userData = await userResponse.json();

    // Repositories to check
    const repositoriesToCheck = repos ? repos.split(',') : [
      'iflytek/astron-agent',
      'iflytek/astron-rpa'
    ];

    const contributionData = [];

    for (const repo of repositoriesToCheck) {
      try {
        const statsResponse = await fetch(
          `https://api.github.com/repos/${repo}/contributors?per_page=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );

        if (statsResponse.ok) {
          const contributors = await statsResponse.json();
          const userContribution = contributors.find(
            c => c.login === userData.login
          );

          if (userContribution) {
            contributionData.push({
              repository: repo,
              contributions: userContribution.contributions,
              avatarUrl: userContribution.avatar_url,
              userUrl: userContribution.html_url
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching stats for ${repo}:`, error);
      }
    }

    response.status(200).json({
      user: {
        login: userData.login,
        name: userData.name,
        avatar_url: userData.avatar_url,
        bio: userData.bio
      },
      contributions: contributionData
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}
