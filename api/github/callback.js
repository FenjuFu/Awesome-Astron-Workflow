import cookie from 'cookie';

export default async function handler(request, response) {
  const { code, state } = request.query;
  const cookies = cookie.parse(request.headers.cookie || '');
  const storedState = cookies.github_auth_state;
  const returnTo = cookies.github_auth_return_to || '/';

  if (!code || !state || state !== storedState) {
    return response.status(400).json({ error: 'Invalid state or code' });
  }

  const clientId = process.env.GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  const protocol = request.headers['x-forwarded-proto'] || 'http';
  const host = request.headers.host;
  const redirectUri = process.env.VITE_GITHUB_REDIRECT_URI || `${protocol}://${host}/api/github/callback`;

  if (!clientId || !clientSecret) {
    return response.status(500).json({ error: 'Missing GitHub credentials' });
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return response.status(400).json(tokenData);
    }

    // Set HttpOnly cookie with access token
    const cookieOptions = [
      `gh_token=${tokenData.access_token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=2592000' // 30 days
    ];

    if (process.env.NODE_ENV === 'production') {
      cookieOptions.push('Secure');
    }

    // Clear state cookie and set token cookie
    response.setHeader('Set-Cookie', [
      cookieOptions.join('; '),
      'github_auth_state=; Path=/; Max-Age=0',
      'github_auth_return_to=; Path=/; Max-Age=0'
    ]);

    // Redirect back to return URL
    response.redirect(returnTo);
  } catch (error) {
    console.error('Token exchange error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
}
