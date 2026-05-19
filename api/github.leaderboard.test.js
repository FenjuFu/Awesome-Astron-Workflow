import test from 'node:test';
import assert from 'node:assert/strict';

import { buildLeaderboard, calculateTotalContributions, normalizeGitHubLogin, searchOpenAndClosedIssues } from './github.js';

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

test('leaderboard includes cached authorized users without redemptions', async () => {
  const leaderboard = await buildLeaderboard({
    cached: [
      {
        github_username: 'FenjuFu',
        name: 'FenjuFu',
        avatar_url: 'https://example.com/fenjufu.png',
        total_contributions: 196,
        repo_summary: {
          'iflytek/skillhub': {
            pr_created: 8,
            pr_merged: 4,
            issues_created: 2,
          },
        },
        updated_at: '2026-05-18T00:00:00.000Z',
      },
    ],
    users: [],
    redemptions: [],
  });

  assert.equal(leaderboard.length, 1);
  assert.equal(leaderboard[0].login, 'FenjuFu');
  assert.equal(leaderboard[0].total_contributions, 196);
});

test('leaderboard keeps legacy cached snapshots without explicit total_contributions', async () => {
  const leaderboard = await buildLeaderboard({
    cached: [
      {
        github_username: 'legacy-user',
        name: 'Legacy User',
        avatar_url: 'https://example.com/legacy-user.png',
        repo_summary: {
          'iflytek/astron-agent': {
            pr_created: 3,
            pr_merged: 2,
            issues_created: 1,
          },
        },
        contribution_dates: {
          'iflytek/astron-agent': {
            pr_creation_date_list: ['2026-05-01T00:00:00.000Z', '2026-05-02T00:00:00.000Z', '2026-05-03T00:00:00.000Z'],
            pr_merged_date_list: ['2026-05-04T00:00:00.000Z', '2026-05-05T00:00:00.000Z'],
            issue_creation_date_list: ['2026-05-06T00:00:00.000Z'],
            code_author_date_list: ['2026-05-07T00:00:00.000Z', '2026-05-07T00:00:00.000Z'],
          },
        },
        astron: {
          agent: { workflows: 1 },
          rpa: { tasks: 2 },
        },
        updated_at: '2026-05-18T00:00:00.000Z',
      },
    ],
    users: [],
    redemptions: [],
  });

  assert.equal(leaderboard.length, 1);
  assert.equal(leaderboard[0].login, 'legacy-user');
  assert.equal(leaderboard[0].total_contributions, 11);
});

test('leaderboard includes authorized users even when contribution snapshot is unavailable', async () => {
  const consoleError = console.error;
  console.error = () => {};

  try {
    const leaderboard = await buildLeaderboard({
      cached: [],
      users: [
        {
          github_username: 'AuthorizedUser',
          name: 'Authorized User',
          avatar_url: 'https://example.com/authorized-user.png',
          last_login_at: '2026-05-18T00:00:00.000Z',
          oauth_token: 'token',
        },
      ],
      redemptions: [],
      now: new Date('2026-05-18T00:00:00.000Z'),
      fetchSnapshot: async () => {
        throw new Error('GitHub unavailable');
      },
    });

    assert.equal(leaderboard.length, 1);
    assert.equal(leaderboard[0].login, 'AuthorizedUser');
    assert.equal(leaderboard[0].name, 'Authorized User');
    assert.equal(leaderboard[0].total_contributions, 0);
  } finally {
    console.error = consoleError;
  }
});

test('leaderboard refreshes authorized users without redemptions when cache is stale', async () => {
  const refreshCalls = [];
  const leaderboard = await buildLeaderboard({
    cached: [
      {
        github_username: 'fenjufu',
        name: 'FenjuFu',
        avatar_url: 'https://example.com/fenjufu-stale.png',
        total_contributions: 120,
        repo_summary: {
          'iflytek/skillhub': {
            pr_created: 3,
            pr_merged: 1,
            issues_created: 1,
          },
        },
        updated_at: '2026-05-01T00:00:00.000Z',
      },
    ],
    users: [
      {
        github_username: 'FenjuFu',
        name: 'FenjuFu',
        avatar_url: 'https://example.com/fenjufu-user.png',
        last_login_at: '2026-05-10T00:00:00.000Z',
        oauth_token: 'token',
      },
    ],
    redemptions: [],
    now: new Date('2026-05-18T00:00:00.000Z'),
    fetchSnapshot: async (params) => {
      refreshCalls.push(params);
      return {
        user: {
          login: 'FenjuFu',
          name: 'FenjuFu Fresh',
          avatar_url: 'https://example.com/fenjufu-fresh.png',
        },
        total_contributions: 196,
        repo_summary: {
          'iflytek/skillhub': {
            pr_created: 8,
            pr_merged: 4,
            issues_created: 2,
          },
        },
        updated_at: '2026-05-18T00:00:00.000Z',
      };
    },
  });

  assert.equal(refreshCalls.length, 1);
  assert.equal(leaderboard.length, 1);
  assert.equal(leaderboard[0].login, 'FenjuFu');
  assert.equal(leaderboard[0].total_contributions, 196);
});

test('calculateTotalContributions keeps duplicate-timestamp behaviors', () => {
  const total = calculateTotalContributions({
    repoStats: {
      'iflytek/skillhub': {
        pr_created: { total_count: 2, items: [] },
        pr_merged: { total_count: 1, items: [] },
        issues_created: { total_count: 3, items: [] },
      },
    },
    contributionDatesByRepo: {
      'iflytek/skillhub': {
        pr_creation_date_list: ['2026-05-01T00:00:00.000Z', '2026-05-02T00:00:00.000Z'],
        pr_merged_date_list: ['2026-05-03T00:00:00.000Z'],
        issue_creation_date_list: ['2026-05-04T00:00:00.000Z', '2026-05-05T00:00:00.000Z', '2026-05-06T00:00:00.000Z'],
        code_author_date_list: ['2026-05-07T10:00:00.000Z', '2026-05-07T10:00:00.000Z'],
        code_committer_date_list: ['2026-05-07T10:00:00.000Z'],
        star_date_list: ['2026-05-08T00:00:00.000Z'],
      },
    },
    astronStats: {
      agent: { workflows: 2 },
      rpa: { tasks: 1 },
    },
  });

  assert.equal(total, 13);
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
