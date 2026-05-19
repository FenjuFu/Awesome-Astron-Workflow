import test from 'node:test';
import assert from 'node:assert/strict';

import { buildLeaderboard, normalizeGitHubLogin, searchOpenAndClosedIssues } from './github.js';

test('leaderboard keeps stale cached snapshot when refresh fails', async () => {
  const refreshCalls = [];
  const consoleError = console.error;
  console.error = () => {};

  try {
    const leaderboard = await buildLeaderboard({
      cached: [
        {
          github_username: 'Alice',
          name: 'Alice',
          avatar_url: 'https://example.com/alice.png',
          total_contributions: 12,
          repo_summary: {
            'astron/example': {
              pr_created: 2,
              pr_merged: 1,
              issues_created: 0,
            },
          },
          updated_at: '2026-05-01T00:00:00.000Z',
        },
      ],
      users: [
        {
          github_username: 'alice',
          name: 'Alice From Users',
          avatar_url: 'https://example.com/alice-user.png',
          last_login_at: '2026-05-10T00:00:00.000Z',
          oauth_token: 'token',
        },
      ],
      redemptions: [
        { github_login: 'ALICE' },
      ],
      now: new Date('2026-05-18T00:00:00.000Z'),
      fetchSnapshot: async (params) => {
        refreshCalls.push(params);
        throw new Error('GitHub unavailable');
      },
    });

    assert.equal(refreshCalls.length, 1);
    assert.equal(leaderboard.length, 1);
    assert.equal(leaderboard[0].rank, 1);
    assert.equal(leaderboard[0].login, 'Alice');
    assert.equal(leaderboard[0].name, 'Alice');
    assert.equal(leaderboard[0].avatar_url, 'https://example.com/alice.png');
    assert.equal(leaderboard[0].total_contributions, 12);
    assert.deepEqual(leaderboard[0].repo_summary, {
      'astron/example': {
        pr_created: 2,
        pr_merged: 1,
        issues_created: 0,
      },
    });
  } finally {
    console.error = consoleError;
  }
});

test('leaderboard prefers refreshed snapshot over stale cache when refresh succeeds', async () => {
  const refreshCalls = [];

  const leaderboard = await buildLeaderboard({
    cached: [
      {
        github_username: 'Alice',
        name: 'Alice',
        avatar_url: 'https://example.com/alice-stale.png',
        total_contributions: 12,
        repo_summary: {
          'astron/example': {
            pr_created: 2,
            pr_merged: 1,
            issues_created: 0,
          },
        },
        updated_at: '2026-05-01T00:00:00.000Z',
      },
    ],
    users: [
      {
        github_username: 'alice',
        name: 'Alice From Users',
        avatar_url: 'https://example.com/alice-user.png',
        last_login_at: '2026-05-10T00:00:00.000Z',
        oauth_token: 'token',
      },
    ],
    redemptions: [
      { github_login: 'alice' },
    ],
    now: new Date('2026-05-18T00:00:00.000Z'),
    fetchSnapshot: async (params) => {
      refreshCalls.push(params);
      return {
        user: {
          login: 'alice',
          name: 'Alice Fresh',
          avatar_url: 'https://example.com/alice-fresh.png',
        },
        total_contributions: 34,
        repo_summary: {
          'astron/example': {
            pr_created: 4,
            pr_merged: 3,
            issues_created: 1,
          },
        },
        updated_at: '2026-05-18T00:00:00.000Z',
      };
    },
  });

  assert.equal(refreshCalls.length, 1);
  assert.equal(leaderboard.length, 1);
  assert.equal(leaderboard[0].rank, 1);
  assert.equal(leaderboard[0].login, 'alice');
  assert.equal(leaderboard[0].name, 'Alice Fresh');
  assert.equal(leaderboard[0].avatar_url, 'https://example.com/alice-fresh.png');
  assert.equal(leaderboard[0].total_contributions, 34);
  assert.equal(leaderboard[0].updated_at, '2026-05-18T00:00:00.000Z');
  assert.deepEqual(leaderboard[0].repo_summary, {
    'astron/example': {
      pr_created: 4,
      pr_merged: 3,
      issues_created: 1,
    },
  });
});

test('normalizeGitHubLogin extracts login from profile urls', () => {
  assert.equal(normalizeGitHubLogin('github.com/shawn0915/'), 'shawn0915');
  assert.equal(normalizeGitHubLogin('https://github.com/shawn0915/?tab=overview'), 'shawn0915');
  assert.equal(normalizeGitHubLogin('@Shawn0915'), 'shawn0915');
});

test('leaderboard matches cached users when redemption login is a github profile url', async () => {
  const leaderboard = await buildLeaderboard({
    cached: [
      {
        github_username: 'shawn0915',
        name: 'Shawn',
        avatar_url: 'https://example.com/shawn.png',
        total_contributions: 21,
        repo_summary: {
          'iflytek/astron-agent': {
            pr_created: 3,
            pr_merged: 2,
            issues_created: 1,
          },
        },
        updated_at: '2026-05-18T00:00:00.000Z',
      },
    ],
    users: [],
    redemptions: [
      { github_login: 'github.com/shawn0915/' },
    ],
    fetchSnapshot: async () => {
      throw new Error('Should not refresh without oauth token');
    },
  });

  assert.equal(leaderboard.length, 1);
  assert.equal(leaderboard[0].login, 'shawn0915');
  assert.equal(leaderboard[0].total_contributions, 21);
});

test('searchOpenAndClosedIssues keeps created contributions after item is closed', async () => {
  const queries = [];
  const results = await searchOpenAndClosedIssues(async (query) => {
    queries.push(query);

    if (query.endsWith('is:open')) {
      return {
        total_count: 0,
        items: [],
      };
    }

    return {
      total_count: 2,
      items: [
        { id: 101, created_at: '2026-05-01T00:00:00.000Z' },
        { id: 102, created_at: '2026-05-03T00:00:00.000Z' },
      ],
    };
  }, 'repo:iflytek/skillhub type:issue author:shawn0915 created:2026-05-01..2026-05-31');

  assert.deepEqual(queries, [
    'repo:iflytek/skillhub type:issue author:shawn0915 created:2026-05-01..2026-05-31 is:open',
    'repo:iflytek/skillhub type:issue author:shawn0915 created:2026-05-01..2026-05-31 is:closed',
  ]);
  assert.equal(results.total_count, 2);
  assert.deepEqual(results.items.map((item) => item.id), [101, 102]);
});
