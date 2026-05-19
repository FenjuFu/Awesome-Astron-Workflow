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
