import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildContributionSearchSpecs,
  parseGraphQLSearchBatchResponse,
  fetchSearchResultsViaGraphQL,
} from './github.js';

test('buildContributionSearchSpecs expands each repo×alias×kind into specs', () => {
  const specs = buildContributionSearchSpecs({
    baseTargetRepos: ['iflytek/skillhub'],
    targetRepoAliases: { 'iflytek/skillhub': ['iflytek/skillhub'] },
    targetLogin: 'FenjuFu',
    fromStr: '2025-05-21',
    toStr: '2026-05-21',
  });

  // 5 kinds total. 4 of them (pr_created, issues_created, issue_commenter,
  // pr_commenter) split into open+closed for 2 specs each = 8. The merged
  // kind stays as 1 spec. Total: 8 + 1 = 9.
  assert.equal(specs.length, 9);

  const kindCounts = specs.reduce((acc, spec) => {
    acc[spec.kind] = (acc[spec.kind] || 0) + 1;
    return acc;
  }, {});
  assert.deepEqual(kindCounts, {
    pr_created: 2,
    pr_merged: 1,
    issues_created: 2,
    issue_commenter: 2,
    pr_commenter: 2,
  });

  // Sanity check on one query string.
  const prCreatedOpen = specs.find(
    (s) => s.kind === 'pr_created' && s.query.endsWith('is:open'),
  );
  assert.ok(prCreatedOpen, 'expected pr_created is:open spec');
  assert.equal(
    prCreatedOpen.query,
    'repo:iflytek/skillhub type:pr author:FenjuFu created:2025-05-21..2026-05-21 is:open',
  );
});

test('buildContributionSearchSpecs walks every alias for a repo', () => {
  const specs = buildContributionSearchSpecs({
    baseTargetRepos: ['iflytek/astron-agent'],
    targetRepoAliases: {
      'iflytek/astron-agent': ['iflytek/astron-agent', 'FenjuFu/astron-agent'],
    },
    targetLogin: 'FenjuFu',
    fromStr: '2025-05-21',
    toStr: '2026-05-21',
  });

  // 9 specs per alias × 2 aliases = 18
  assert.equal(specs.length, 18);
  const aliases = new Set(specs.map((s) => s.alias));
  assert.deepEqual(
    Array.from(aliases).sort(),
    ['FenjuFu/astron-agent', 'iflytek/astron-agent'],
  );
});

test('parseGraphQLSearchBatchResponse maps nodes onto REST-shaped items', () => {
  const specs = [
    { kind: 'pr_created', repo: 'iflytek/skillhub', alias: 'iflytek/skillhub', query: 'x' },
    { kind: 'pr_merged', repo: 'iflytek/skillhub', alias: 'iflytek/skillhub', query: 'y' },
  ];
  const data = {
    q0: {
      issueCount: 3,
      nodes: [
        {
          __typename: 'PullRequest',
          databaseId: 101,
          createdAt: '2026-05-01T00:00:00.000Z',
          updatedAt: '2026-05-02T00:00:00.000Z',
          closedAt: null,
          mergedAt: null,
          url: 'https://example.com/101',
        },
      ],
    },
    q1: {
      issueCount: 0,
      nodes: [],
    },
  };

  const results = parseGraphQLSearchBatchResponse(specs, data);

  assert.equal(results.length, 2);
  assert.equal(results[0].kind, 'pr_created');
  assert.equal(results[0].total_count, 3);
  assert.equal(results[0].items.length, 1);
  assert.equal(results[0].items[0].id, 101);
  assert.equal(results[0].items[0].created_at, '2026-05-01T00:00:00.000Z');
  assert.equal(results[0].items[0].html_url, 'https://example.com/101');

  assert.equal(results[1].kind, 'pr_merged');
  assert.equal(results[1].total_count, 0);
  assert.deepEqual(results[1].items, []);
});

test('parseGraphQLSearchBatchResponse handles missing keys gracefully', () => {
  const specs = [
    { kind: 'pr_created', repo: 'r', alias: 'r', query: 'x' },
    { kind: 'pr_merged', repo: 'r', alias: 'r', query: 'y' },
  ];
  const results = parseGraphQLSearchBatchResponse(specs, { q0: { issueCount: 1, nodes: [] } });

  assert.equal(results[0].total_count, 1);
  // q1 missing → defaults to 0/[]
  assert.equal(results[1].total_count, 0);
  assert.deepEqual(results[1].items, []);
});

test('fetchSearchResultsViaGraphQL chunks large spec lists into multiple requests', async () => {
  const specs = Array.from({ length: 60 }, (_, i) => ({
    kind: 'pr_created',
    repo: `repo${i}`,
    alias: `repo${i}`,
    query: `q-${i}`,
  }));

  const calls = [];
  const fakeRun = async ({ token, query }) => {
    calls.push({ token, queryLength: query.length });
    // Return data for q0..q(chunkLen-1)
    const match = query.match(/q(\d+):/g) || [];
    const data = {};
    match.forEach((_, idx) => {
      data[`q${idx}`] = { issueCount: 0, nodes: [] };
    });
    return data;
  };

  const results = await fetchSearchResultsViaGraphQL({
    token: 'tok',
    specs,
    runGraphQL: fakeRun,
  });

  // 60 specs at batch size 50 → 2 chunks (50 + 10)
  assert.equal(calls.length, 2);
  assert.equal(results.length, 60);
  // All calls used the same token
  assert.ok(calls.every((c) => c.token === 'tok'));
});

test('fetchSearchResultsViaGraphQL bubbles errors so caller can fall back to REST', async () => {
  await assert.rejects(async () => {
    await fetchSearchResultsViaGraphQL({
      token: 'tok',
      specs: [{ kind: 'pr_created', repo: 'r', alias: 'r', query: 'x' }],
      runGraphQL: async () => {
        const err = new Error('GraphQL down');
        err.statusCode = 502;
        throw err;
      },
    });
  }, /GraphQL down/);
});

test('fetchSearchResultsViaGraphQL returns [] when given empty specs', async () => {
  const calls = [];
  const fakeRun = async (input) => {
    calls.push(input);
    return {};
  };
  const results = await fetchSearchResultsViaGraphQL({
    token: 'tok',
    specs: [],
    runGraphQL: fakeRun,
  });

  assert.deepEqual(results, []);
  assert.equal(calls.length, 0);
});
