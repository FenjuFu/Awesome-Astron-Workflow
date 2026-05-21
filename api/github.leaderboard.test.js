import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildLeaderboard,
  calculateTotalContributions,
  normalizeGitHubLogin,
  searchOpenAndClosedIssues,
  warmRedemptionContributionSnapshots,
} from './github.js';

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

test('leaderboard includes authorized users with no cached snapshot', async () => {
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
  });

  assert.equal(leaderboard.length, 1);
  assert.equal(leaderboard[0].login, 'AuthorizedUser');
  assert.equal(leaderboard[0].name, 'Authorized User');
  assert.equal(leaderboard[0].total_contributions, 0);
});

test('warmRedemptionContributionSnapshots refreshes redemption users with oauth tokens', async () => {
  const refreshCalls = [];

  const summary = await warmRedemptionContributionSnapshots({
    cached: [
      {
        github_username: 'cached-only',
        total_contributions: 8,
        repo_summary: {},
      },
    ],
    users: [
      {
        github_username: 'FenjuFu',
        oauth_token: 'token-1',
      },
    ],
    redemptions: [
      { github_login: 'FenjuFu' },
      { github_login: 'cached-only' },
      { github_login: 'missing-user' },
    ],
    now: new Date('2026-05-18T00:00:00.000Z'),
    fetchSnapshot: async (params) => {
      refreshCalls.push(params);
      return {
        user: {
          login: params.login,
        },
      };
    },
  });

  assert.equal(refreshCalls.length, 1);
  assert.equal(refreshCalls[0].token, 'token-1');
  assert.equal(refreshCalls[0].login, 'FenjuFu');
  assert.deepEqual(summary, {
    total_redemption_logins: 3,
    refreshed: ['fenjufu'],
    skipped_cached: ['cached-only'],
    skipped_missing_token: ['missing-user'],
    failed: [],
  });
});

test('warmRedemptionContributionSnapshots records refresh failures without aborting the batch', async () => {
  const summary = await warmRedemptionContributionSnapshots({
    cached: [],
    users: [
      {
        github_username: 'Alice',
        oauth_token: 'token-a',
      },
      {
        github_username: 'Bob',
        oauth_token: 'token-b',
      },
    ],
    redemptions: [
      { github_login: 'alice' },
      { github_login: 'bob' },
    ],
    fetchSnapshot: async ({ login }) => {
      if (login.toLowerCase() === 'alice') {
        throw new Error('GitHub unavailable');
      }

      return {
        user: {
          login,
        },
      };
    },
  });

  assert.deepEqual(summary, {
    total_redemption_logins: 2,
    refreshed: ['bob'],
    skipped_cached: [],
    skipped_missing_token: [],
    failed: [
      {
        login: 'alice',
        error: 'GitHub unavailable',
      },
    ],
  });
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
