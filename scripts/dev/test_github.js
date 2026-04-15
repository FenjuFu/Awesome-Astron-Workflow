const token = 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN';

async function test() {
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!userResponse.ok) {
    console.error('Failed to fetch user info', await userResponse.text());
    return;
  }

  const userData = await userResponse.json();
  const login = userData.login;
  console.log('User login:', login);

  const fromStr = '2023-01-01';
  const toStr = '2024-12-31';

  const repo = 'iflytek/skillhub';
  const query = `repo:${repo} type:pr author:${login} created:${fromStr}..${toStr}`;
  
  console.log('Query:', query);
  const res = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=100`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    }
  });

  const data = await res.json();
  console.log('PRs created in skillhub:', data.total_count);
}

test();
