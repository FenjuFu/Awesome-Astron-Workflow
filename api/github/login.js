import crypto from 'crypto';

export default function handler(request, response) {
  const clientId = process.env.VITE_GITHUB_CLIENT_ID;
  const redirectUri = process.env.VITE_GITHUB_REDIRECT_URI || `https://${request.headers.host}/api/github/callback`;
  
  if (!clientId) {
    return response.status(500).json({ error: 'Missing VITE_GITHUB_CLIENT_ID' });
  }

  // Generate random state for CSRF protection
  const state = crypto.randomUUID();
  
  // Set state in cookie (short-lived)
  const cookieOptions = [
    `github_auth_state=${state}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=600' // 10 minutes
  ];
  
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.push('Secure');
  }

  response.setHeader('Set-Cookie', cookieOptions.join('; '));

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user', // Minimal scope
    state
  });

  response.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}
