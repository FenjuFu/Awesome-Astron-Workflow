import test from 'node:test';
import assert from 'node:assert/strict';

import { buildLeaderboard } from './github.js';

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
