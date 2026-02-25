export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const code = request.body?.code;

  if (!clientId || !clientSecret) {
    response.status(500).json({ error: 'Missing GitHub OAuth configuration' });
    return;
  }

  if (!code) {
    response.status(400).json({ error: 'Missing OAuth code' });
    return;
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code
    })
  });

  const payload = await tokenResponse.json();

  if (!tokenResponse.ok || payload.error) {
    response.status(400).json({ error: payload.error_description ?? 'OAuth exchange failed' });
    return;
  }

  response.status(200).json({ access_token: payload.access_token });
}
