import test from 'node:test';
import assert from 'node:assert/strict';

import githubHandler from './github.js';

const createResponse = () => {
  const result = {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
    redirect(url) {
      this.statusCode = 307;
      this.headers.Location = url;
      return this;
    },
  };

  return result;
};

test('session handler returns authenticated user when gh_token is valid', async () => {
  const originalFetch = global.fetch;
  const originalConsoleError = console.error;

  global.fetch = async (url) => {
    const normalizedUrl = String(url);

    if (normalizedUrl === 'https://api.github.com/user') {
      return {
        ok: true,
        json: async () => ({
          login: 'FenjuFu',
          name: 'FenjuFu',
          avatar_url: 'https://example.com/fenjufu.png',
          html_url: 'https://github.com/FenjuFu',
        }),
      };
    }

    if (normalizedUrl.includes('/search/repositories')) {
      return {
        ok: true,
        json: async () => ({ items: [] }),
        headers: { get: () => null },
      };
    }

    if (
      normalizedUrl.includes('/search/issues')
      || normalizedUrl.includes('/starred?')
      || normalizedUrl.includes('/repos?type=owner')
      || normalizedUrl.includes('/commits?author=')
    ) {
      return {
        ok: true,
        json: async () => [],
        headers: { get: () => null },
      };
    }

    assert.fail(`Unexpected fetch url: ${normalizedUrl}`);
  };

  console.error = () => {};

  try {
    const req = {
      query: { action: 'session' },
      headers: {
        cookie: 'gh_token=test-token',
      },
    };
    const res = createResponse();

    await githubHandler(req, res);
    await new Promise((resolve) => setTimeout(resolve, 10));

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, {
      authenticated: true,
      user: {
        login: 'FenjuFu',
        name: 'FenjuFu',
        avatar_url: 'https://example.com/fenjufu.png',
        html_url: 'https://github.com/FenjuFu',
      },
    });
  } finally {
    global.fetch = originalFetch;
    console.error = originalConsoleError;
  }
});

test('login handler falls back to request callback when redirect uri config is unsafe', async () => {
  const originalClientId = process.env.GITHUB_CLIENT_ID;
  const originalRedirectUri = process.env.VITE_GITHUB_REDIRECT_URI;
  const originalConsoleWarn = console.warn;

  process.env.GITHUB_CLIENT_ID = 'test-client-id';
  process.env.VITE_GITHUB_REDIRECT_URI = 'https://awesome-astron-workflow.dev/';
  console.warn = () => {};

  try {
    const req = {
      query: { action: 'login', from: '/stats' },
      headers: {
        host: 'www.awesome-astron-workflow.dev',
        'x-forwarded-proto': 'https',
      },
    };
    const res = createResponse();

    await githubHandler(req, res);

    assert.equal(res.statusCode, 307);
    const location = new URL(res.headers.Location);
    assert.equal(location.origin, 'https://github.com');
    assert.equal(location.pathname, '/login/oauth/authorize');
    assert.equal(
      location.searchParams.get('redirect_uri'),
      'https://www.awesome-astron-workflow.dev/api/github/callback',
    );
  } finally {
    if (originalClientId === undefined) {
      delete process.env.GITHUB_CLIENT_ID;
    } else {
      process.env.GITHUB_CLIENT_ID = originalClientId;
    }

    if (originalRedirectUri === undefined) {
      delete process.env.VITE_GITHUB_REDIRECT_URI;
    } else {
      process.env.VITE_GITHUB_REDIRECT_URI = originalRedirectUri;
    }

    console.warn = originalConsoleWarn;
  }
});

test('callback handler reuses fallback redirect uri during token exchange', async () => {
  const originalFetch = global.fetch;
  const originalClientId = process.env.GITHUB_CLIENT_ID;
  const originalClientSecret = process.env.GITHUB_CLIENT_SECRET;
  const originalRedirectUri = process.env.VITE_GITHUB_REDIRECT_URI;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  const fetchCalls = [];

  process.env.GITHUB_CLIENT_ID = 'test-client-id';
  process.env.GITHUB_CLIENT_SECRET = 'test-client-secret';
  process.env.VITE_GITHUB_REDIRECT_URI = 'https://awesome-astron-workflow.dev/';
  console.warn = () => {};
  console.error = () => {};

  global.fetch = async (url, init = {}) => {
    const normalizedUrl = String(url);
    fetchCalls.push({ url: normalizedUrl, init });

    if (normalizedUrl === 'https://github.com/login/oauth/access_token') {
      return {
        json: async () => ({ access_token: 'token-123' }),
      };
    }

    if (normalizedUrl === 'https://api.github.com/user') {
      return {
        ok: true,
        json: async () => ({
          login: 'FenjuFu',
          name: 'FenjuFu',
          avatar_url: 'https://example.com/fenjufu.png',
          html_url: 'https://github.com/FenjuFu',
        }),
      };
    }

    if (normalizedUrl.includes('/search/repositories')) {
      return {
        ok: true,
        json: async () => ({ items: [] }),
        headers: { get: () => null },
      };
    }

    if (
      normalizedUrl.includes('/search/issues')
      || normalizedUrl.includes('/starred?')
      || normalizedUrl.includes('/repos?type=owner')
      || normalizedUrl.includes('/commits?author=')
    ) {
      return {
        ok: true,
        json: async () => [],
        headers: { get: () => null },
      };
    }

    assert.fail(`Unexpected fetch url: ${normalizedUrl}`);
  };

  try {
    const req = {
      query: { action: 'callback', code: 'oauth-code', state: 'state-123' },
      headers: {
        host: 'www.awesome-astron-workflow.dev',
        'x-forwarded-proto': 'https',
        cookie: 'github_auth_state=state-123; github_auth_return_to=/stats',
      },
    };
    const res = createResponse();

    await githubHandler(req, res);

    assert.equal(res.statusCode, 307);
    assert.equal(res.headers.Location, '/stats');

    const tokenExchange = fetchCalls.find((call) => call.url === 'https://github.com/login/oauth/access_token');
    assert.ok(tokenExchange, 'expected OAuth token exchange call');
    const tokenBody = JSON.parse(tokenExchange.init.body);
    assert.equal(
      tokenBody.redirect_uri,
      'https://www.awesome-astron-workflow.dev/api/github/callback',
    );
  } finally {
    global.fetch = originalFetch;

    if (originalClientId === undefined) {
      delete process.env.GITHUB_CLIENT_ID;
    } else {
      process.env.GITHUB_CLIENT_ID = originalClientId;
    }

    if (originalClientSecret === undefined) {
      delete process.env.GITHUB_CLIENT_SECRET;
    } else {
      process.env.GITHUB_CLIENT_SECRET = originalClientSecret;
    }

    if (originalRedirectUri === undefined) {
      delete process.env.VITE_GITHUB_REDIRECT_URI;
    } else {
      process.env.VITE_GITHUB_REDIRECT_URI = originalRedirectUri;
    }

    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  }
});
