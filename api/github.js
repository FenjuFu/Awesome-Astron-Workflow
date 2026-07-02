import cookie from 'cookie';
import crypto from 'crypto';

export default async function handler(req, res) {
  const action = req.query.action;

  try {
    switch (action) {
      case 'login':
        return await handleLogin(req, res);
      case 'callback':
        return await handleCallback(req, res);
      case 'logout':
        return await handleLogout(req, res);
      case 'session':
        return await handleSession(req, res);
      case 'token':
        return await handleToken(req, res);
      case 'contributions':
        return await handleContributions(req, res);
      case 'warm-redemption-contributions':
        return await handleWarmRedemptionContributions(req, res);
      case 'warm-snapshots':
        return await handleWarmSnapshots(req, res);
      case 'diagnose-snapshot':
        return await handleDiagnoseSnapshot(req, res);
      case 'leaderboard':
        return await handleLeaderboard(req, res);
      default:
        return res.status(404).json({ error: 'Not Found' });
    }
  } catch (error) {
    console.error(`Error in github handler (${action}):`, error);
    return res.status(500).json({ error: error.message });
  }
}

// --- Helper Functions ---
const hasNextPage = (linkHeader) => {
  if (!linkHeader) return false;
  return linkHeader.split(',').some((part) => part.includes('rel="next"'));
};

const normalizeRepoFullName = (repoFullName) => repoFullName?.toLowerCase();
export const normalizeGitHubLogin = (login) => {
  const rawLogin = typeof login === 'string' ? login.trim() : '';
  if (!rawLogin) return null;

  const withoutAt = rawLogin.replace(/^@/, '');
  const urlMatch = withoutAt.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#]+)(?:[/?#].*)?$/i);
  const normalizedCandidate = (urlMatch?.[1] || withoutAt)
    .replace(/^@/, '')
    .replace(/^\/+|\/+$/g, '')
    .trim()
    .toLowerCase();

  return normalizedCandidate || null;
};

const fetchAllPages = async (fetchPage) => {
  const results = [];
  let page = 1;
  while (true) {
    const { items, hasNext } = await fetchPage(page);
    if (!Array.isArray(items) || items.length === 0) break;
    results.push(...items);
    if (!hasNext) break;
    page += 1;
  }
  return results;
};

const buildRepoSummary = (repoStats) => {
  const repoSummary = {};
  for (const [repo, stats] of Object.entries(repoStats)) {
    repoSummary[repo] = {
      pr_created: stats.pr_created.total_count,
      pr_merged: stats.pr_merged.total_count,
      issues_created: stats.issues_created.total_count,
    };
  }
  return repoSummary;
};

const buildDefaultAvatarUrl = (login) => `https://github.com/${encodeURIComponent(login)}.png?size=80`;
const hasOAuthAccess = (user) => !!(user?.oauth_token || user?.last_login_at);
const isAdminRequest = (request) => {
  const adminPassword = process.env.VITE_ADMIN_PASSWORD;
  const authHeader = request.headers['x-admin-password'];
  return !!(adminPassword && authHeader === adminPassword);
};
const getNumericContributionCount = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const getEntryTotalContributions = (entry) => {
  if (!entry) return null;

  const explicitTotal = getNumericContributionCount(entry.total_contributions);
  if (explicitTotal !== null) {
    return explicitTotal;
  }

  const hasRepoStats = !!(entry.repos && Object.keys(entry.repos).length > 0);
  const hasRepoSummary = !!(entry.repo_summary && Object.keys(entry.repo_summary).length > 0);
  const hasContributionDates = !!(entry.contribution_dates && Object.keys(entry.contribution_dates).length > 0);

  if (!hasRepoStats && !hasRepoSummary && !hasContributionDates) {
    return null;
  }

  const repoStats = hasRepoStats
    ? entry.repos
    : buildRepoStatsFromSummary(entry.repo_summary);

  return calculateTotalContributions({
    repoStats,
    contributionDatesByRepo: entry.contribution_dates || {},
    astronStats: entry.astron || { agent: { workflows: 0, runs: 0 }, rpa: { tasks: 0, hoursSaved: 0 } },
  });
};

const createLeaderboardCandidateLogins = ({ cached = [], users = [], redemptions = [] } = {}) => {
  const candidateLogins = new Set();

  redemptions.forEach((redemption) => {
    const normalizedLogin = normalizeGitHubLogin(redemption.github_login);
    if (normalizedLogin) candidateLogins.add(normalizedLogin);
  });

  cached.forEach((entry) => {
    const normalizedLogin = normalizeGitHubLogin(entry.github_username);
    if (normalizedLogin && hasLeaderboardActivity(entry)) {
      candidateLogins.add(normalizedLogin);
    }
  });

  users.forEach((user) => {
    const normalizedLogin = normalizeGitHubLogin(user.github_username);
    if (normalizedLogin && hasOAuthAccess(user)) {
      candidateLogins.add(normalizedLogin);
    }
  });

  return Array.from(candidateLogins);
};

const upsertLeaderboardEntry = (entriesByLogin, entry) => {
  const normalizedLogin = normalizeGitHubLogin(entry?.login);
  if (!normalizedLogin) return;

  const existing = entriesByLogin.get(normalizedLogin) || {};
  const existingUpdatedAt = existing.updated_at ? new Date(existing.updated_at).getTime() : 0;
  const incomingUpdatedAt = entry.updated_at ? new Date(entry.updated_at).getTime() : 0;
  const hasIncomingRepoSummary = !!(entry.repo_summary && Object.keys(entry.repo_summary).length > 0);
  const incomingTotalContributions = getEntryTotalContributions(entry);
  const existingTotalContributions = getEntryTotalContributions(existing);
  const shouldUseIncomingTotal = typeof incomingTotalContributions === 'number' && (
    typeof existingTotalContributions !== 'number'
    || !existing.updated_at
    || incomingUpdatedAt >= existingUpdatedAt
  );
  const shouldUseIncomingRepoSummary = hasIncomingRepoSummary && (
    !existing.repo_summary
    || Object.keys(existing.repo_summary).length === 0
    || !existing.updated_at
    || incomingUpdatedAt >= existingUpdatedAt
  );

  entriesByLogin.set(normalizedLogin, {
    login: entry.login || existing.login || normalizedLogin,
    name: entry.name || existing.name || entry.login || existing.login || normalizedLogin,
    avatar_url: entry.avatar_url || existing.avatar_url || buildDefaultAvatarUrl(entry.login || existing.login || normalizedLogin),
    total_contributions: shouldUseIncomingTotal
      ? incomingTotalContributions
      : typeof existingTotalContributions === 'number'
        ? existingTotalContributions
        : null,
    repo_summary: shouldUseIncomingRepoSummary
      ? entry.repo_summary
      : existing.repo_summary || {},
    updated_at:
      incomingUpdatedAt >= existingUpdatedAt
        ? entry.updated_at || existing.updated_at || null
        : existing.updated_at || entry.updated_at || null,
  });
};

const hasLeaderboardActivity = (entry) => {
  if (!entry) return false;

  const totalContributions = getEntryTotalContributions(entry);
  if (typeof totalContributions === 'number' && totalContributions > 0) return true;

  const repoStatsActivity = Object.values(entry.repos || {}).some((repo) => {
    return (repo?.pr_created?.total_count || 0) > 0
      || (repo?.pr_merged?.total_count || 0) > 0
      || (repo?.issues_created?.total_count || 0) > 0;
  });
  if (repoStatsActivity) return true;

  return Object.values(entry.repo_summary || {}).some((repo) => {
    return (repo?.pr_created || 0) > 0 || (repo?.pr_merged || 0) > 0 || (repo?.issues_created || 0) > 0;
  });
};

// Picks the single most-stale user with an oauth token for the warm-snapshots
// cron. Users with no cache entry get priority (updated_at = 0), then by oldest
// `updated_at`. Returns null when no eligible candidate exists. Exported for
// unit testing.
export const pickStaleestSnapshotCandidate = ({ users = [], cached = [] } = {}) => {
  const cachedByLogin = new Map();
  for (const entry of cached) {
    const normalizedLogin = normalizeGitHubLogin(entry.github_username);
    if (normalizedLogin) {
      cachedByLogin.set(normalizedLogin, entry);
    }
  }

  const candidates = [];
  for (const user of users) {
    if (!user?.oauth_token) continue;
    const normalizedLogin = normalizeGitHubLogin(user.github_username);
    if (!normalizedLogin) continue;
    const cachedEntry = cachedByLogin.get(normalizedLogin);
    const updatedAtMs = cachedEntry?.updated_at
      ? new Date(cachedEntry.updated_at).getTime()
      : 0;
    candidates.push({
      login: user.github_username,
      normalizedLogin,
      token: user.oauth_token,
      updatedAtMs: Number.isFinite(updatedAtMs) ? updatedAtMs : 0,
    });
  }

  if (candidates.length === 0) return null;

  // Oldest first; tie-break alphabetically for determinism.
  candidates.sort((a, b) => {
    if (a.updatedAtMs !== b.updatedAtMs) return a.updatedAtMs - b.updatedAtMs;
    return a.normalizedLogin.localeCompare(b.normalizedLogin);
  });

  return candidates[0];
};

export const buildLeaderboard = async ({
  cached = [],
  users = [],
  redemptions = [],
} = {}) => {
  const leaderboardLogins = createLeaderboardCandidateLogins({ cached, users, redemptions });
  const authorizedLogins = new Set(
    users
      .filter(hasOAuthAccess)
      .map((user) => normalizeGitHubLogin(user.github_username))
      .filter(Boolean)
  );

  if (leaderboardLogins.length === 0) {
    return [];
  }

  const cachedByLogin = new Map();
  for (const entry of cached) {
    const normalizedLogin = normalizeGitHubLogin(entry.github_username);
    if (normalizedLogin) {
      cachedByLogin.set(normalizedLogin, entry);
    }
  }

  const usersByLogin = new Map();
  for (const user of users) {
    const normalizedLogin = normalizeGitHubLogin(user.github_username);
    if (normalizedLogin) {
      usersByLogin.set(normalizedLogin, user);
    }
  }

  const entriesByLogin = new Map();
  for (const login of leaderboardLogins) {
    upsertLeaderboardEntry(entriesByLogin, { login });
  }

  for (const login of leaderboardLogins) {
    const user = usersByLogin.get(login);
    if (!user) continue;
    upsertLeaderboardEntry(entriesByLogin, {
      login: user.github_username,
      name: user.name,
      avatar_url: user.avatar_url,
      updated_at: user.updated_at || user.last_login_at,
    });
  }

  for (const login of leaderboardLogins) {
    const entry = cachedByLogin.get(login);
    if (!entry) continue;
    upsertLeaderboardEntry(entriesByLogin, {
      login: entry.github_username,
      name: entry.name,
      avatar_url: entry.avatar_url,
      repos: entry.repos,
      contribution_dates: entry.contribution_dates,
      astron: entry.astron,
      total_contributions: entry.total_contributions,
      repo_summary: entry.repo_summary,
      updated_at: entry.updated_at,
    });
  }

  return Array.from(entriesByLogin.values())
    .filter((entry) => {
      const normalizedLogin = normalizeGitHubLogin(entry.login);
      return (normalizedLogin && authorizedLogins.has(normalizedLogin)) || hasLeaderboardActivity(entry);
    })
    .map((entry) => ({
      ...entry,
      total_contributions: typeof entry.total_contributions === 'number' ? entry.total_contributions : 0,
      repo_summary: entry.repo_summary || {},
    }))
    .sort((a, b) => {
      if (b.total_contributions !== a.total_contributions) {
        return b.total_contributions - a.total_contributions;
      }
      return a.login.localeCompare(b.login);
    })
    .slice(0, 100)
    .map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));
};

export const warmRedemptionContributionSnapshots = async ({
  cached = [],
  users = [],
  redemptions = [],
  fetchSnapshot = fetchContributionSnapshot,
  now = new Date(),
} = {}) => {
  const cachedByLogin = new Map();
  cached.forEach((entry) => {
    const normalizedLogin = normalizeGitHubLogin(entry.github_username);
    if (normalizedLogin) {
      cachedByLogin.set(normalizedLogin, entry);
    }
  });

  const usersByLogin = new Map();
  users.forEach((user) => {
    const normalizedLogin = normalizeGitHubLogin(user.github_username);
    if (normalizedLogin) {
      usersByLogin.set(normalizedLogin, user);
    }
  });

  const uniqueLogins = Array.from(new Set(
    redemptions
      .map((entry) => normalizeGitHubLogin(entry.github_login))
      .filter(Boolean)
  ));

  const summary = {
    total_redemption_logins: uniqueLogins.length,
    refreshed: [],
    skipped_cached: [],
    skipped_missing_token: [],
    failed: [],
  };

  if (uniqueLogins.length === 0) {
    return summary;
  }

  const { fromDate, toDate } = getDefaultContributionWindow(now);

  const refreshResults = await Promise.allSettled(uniqueLogins.map(async (login) => {
    const user = usersByLogin.get(login);

    if (user?.oauth_token) {
      await fetchSnapshot({
        token: user.oauth_token,
        login: user.github_username || login,
        fromDate,
        toDate,
      });
      return { login, status: 'refreshed' };
    }

    if (cachedByLogin.has(login)) {
      return { login, status: 'skipped_cached' };
    }

    return { login, status: 'skipped_missing_token' };
  }));

  refreshResults.forEach((result, index) => {
    const login = uniqueLogins[index];

    if (result.status === 'rejected') {
      summary.failed.push({
        login,
        error: result.reason?.message || 'Failed to warm contribution snapshot',
      });
      return;
    }

    if (result.value.status === 'refreshed') {
      summary.refreshed.push(result.value.login);
      return;
    }

    if (result.value.status === 'skipped_cached') {
      summary.skipped_cached.push(result.value.login);
      return;
    }

    summary.skipped_missing_token.push(result.value.login);
  });

  return summary;
};

const mergeSearchResults = (...results) => {
  const items = [];
  const seenKeys = new Set();
  let totalCount = 0;

  for (const result of results) {
    if (!result) continue;

    totalCount += result.total_count || 0;

    for (const item of result.items || []) {
      const key = item.id || item.node_id || item.html_url || JSON.stringify(item);
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
      items.push(item);
    }
  }

  return {
    total_count: totalCount,
    items,
  };
};

export const searchOpenAndClosedIssues = async (searchFn, baseQuery) => {
  const [openResults, closedResults] = await Promise.all([
    searchFn(`${baseQuery} is:open`),
    searchFn(`${baseQuery} is:closed`),
  ]);

  return mergeSearchResults(openResults, closedResults);
};

// GraphQL batch search support.
//
// The REST search subsystem fans out 5 logical queries × 7 base repos × ~2
// aliases ≈ 70 calls per snapshot, and `searchOpenAndClosedIssues` doubles
// 4 of those into open/closed pairs for ~126 calls total. Under GitHub's
// authenticated search rate-limit (~30/min/token) that takes ~4 minutes of
// wall time even with our token-bucket pacer. A single GraphQL request can
// alias all 126 searches into one network round-trip and lives under a
// completely separate rate-limit budget (5000 points/hour), so we use it as
// the primary path and fall back to REST only on errors.

// Logical search "kinds" we issue per (repo, alias). `splitOpenClosed` mirrors
// the existing searchOpenAndClosedIssues behavior: GitHub's search returns
// items in either is:open or is:closed depending on current state, and we
// issue both legs so that PRs/issues closed mid-window still count in
// total_count when they were created in-window.
const CONTRIBUTION_SEARCH_KINDS = [
  {
    kind: 'pr_created',
    splitOpenClosed: true,
    buildQuery: ({ alias, targetLogin, fromStr, toStr }) =>
      `repo:${alias} type:pr author:${targetLogin} created:${fromStr}..${toStr}`,
  },
  {
    kind: 'pr_merged',
    splitOpenClosed: false,
    buildQuery: ({ alias, targetLogin, fromStr, toStr }) =>
      `repo:${alias} type:pr author:${targetLogin} is:merged merged:${fromStr}..${toStr}`,
  },
  {
    kind: 'issues_created',
    splitOpenClosed: true,
    buildQuery: ({ alias, targetLogin, fromStr, toStr }) =>
      `repo:${alias} type:issue author:${targetLogin} created:${fromStr}..${toStr}`,
  },
  {
    kind: 'issue_commenter',
    splitOpenClosed: true,
    buildQuery: ({ alias, targetLogin, fromStr, toStr }) =>
      `repo:${alias} type:issue commenter:${targetLogin} updated:${fromStr}..${toStr}`,
  },
  {
    kind: 'pr_commenter',
    splitOpenClosed: true,
    buildQuery: ({ alias, targetLogin, fromStr, toStr }) =>
      `repo:${alias} type:pr commenter:${targetLogin} updated:${fromStr}..${toStr}`,
  },
];

// Build the flat list of (repo, alias, kind, query) specs that fetchContributionSnapshot
// would otherwise issue one-by-one through search(). Exported for testing.
export const buildContributionSearchSpecs = ({
  baseTargetRepos = [],
  targetRepoAliases = {},
  targetLogin,
  fromStr,
  toStr,
} = {}) => {
  const specs = [];
  for (const repo of baseTargetRepos) {
    const aliases = targetRepoAliases[repo] || [repo];
    for (const alias of aliases) {
      for (const kindSpec of CONTRIBUTION_SEARCH_KINDS) {
        const baseQuery = kindSpec.buildQuery({ alias, targetLogin, fromStr, toStr });
        if (kindSpec.splitOpenClosed) {
          specs.push({ kind: kindSpec.kind, repo, alias, query: `${baseQuery} is:open` });
          specs.push({ kind: kindSpec.kind, repo, alias, query: `${baseQuery} is:closed` });
        } else {
          specs.push({ kind: kindSpec.kind, repo, alias, query: baseQuery });
        }
      }
    }
  }
  return specs;
};

// Batch size cap for one GraphQL request. GitHub's GraphQL endpoint has a
// node-count and complexity ceiling; aliasing ~50 search subfields per request
// stays comfortably under both. With ~126 specs this means ~3 parallel
// requests, vs ~126 sequential REST searches before.
const GRAPHQL_SEARCH_BATCH_SIZE = 50;

const chunkSpecsForGraphQL = (specs, size = GRAPHQL_SEARCH_BATCH_SIZE) => {
  const chunks = [];
  for (let i = 0; i < specs.length; i += size) {
    chunks.push(specs.slice(i, i + size));
  }
  return chunks;
};

const buildGraphQLSearchBatchQuery = (specs) => {
  const subQueries = specs.map((spec, i) => (
    `  q${i}: search(query: ${JSON.stringify(spec.query)}, type: ISSUE, first: 100) {\n` +
    `    issueCount\n` +
    `    nodes {\n` +
    `      __typename\n` +
    `      ... on Issue { databaseId createdAt updatedAt closedAt url }\n` +
    `      ... on PullRequest { databaseId createdAt updatedAt closedAt mergedAt url }\n` +
    `    }\n` +
    `  }`
  ));
  return `query {\n${subQueries.join('\n')}\n}`;
};

// Maps a GraphQL response object back onto the per-spec result shape that
// the rest of fetchContributionSnapshot expects (mirrors REST search payload).
// Exported for testing.
export const parseGraphQLSearchBatchResponse = (specs, data) => {
  if (!data) return specs.map((spec) => ({ ...spec, total_count: 0, items: [] }));
  return specs.map((spec, i) => {
    const result = data[`q${i}`];
    if (!result) return { ...spec, total_count: 0, items: [] };
    return {
      ...spec,
      total_count: result.issueCount || 0,
      items: (result.nodes || []).map((node) => ({
        id: node.databaseId,
        created_at: node.createdAt,
        updated_at: node.updatedAt,
        closed_at: node.closedAt,
        merged_at: node.mergedAt,
        html_url: node.url,
      })),
    };
  });
};

// Single GraphQL POST. `runGraphQL` is injectable for tests.
const defaultRunGraphQL = async ({ token, query }) => {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const error = new Error(`GraphQL batch HTTP ${res.status}: ${text.slice(0, 200)}`);
    error.statusCode = res.status;
    throw error;
  }
  const body = await res.json();
  if (body.errors && body.errors.length > 0) {
    const error = new Error(
      `GraphQL batch returned errors: ${body.errors.map((e) => e.message).join('; ')}`,
    );
    error.graphqlErrors = body.errors;
    throw error;
  }
  return body.data;
};

// Run the full batch (chunked under GRAPHQL_SEARCH_BATCH_SIZE per request).
// Returns the flat per-spec result array in the same order as `specs`.
// Exported for testing.
export const fetchSearchResultsViaGraphQL = async ({
  token,
  specs,
  runGraphQL = defaultRunGraphQL,
} = {}) => {
  if (!Array.isArray(specs) || specs.length === 0) return [];
  const chunks = chunkSpecsForGraphQL(specs);
  const chunkResults = await Promise.all(
    chunks.map(async (chunk) => {
      const query = buildGraphQLSearchBatchQuery(chunk);
      const data = await runGraphQL({ token, query });
      return parseGraphQLSearchBatchResponse(chunk, data);
    }),
  );
  return chunkResults.flat();
};

const CONTRIBUTION_FIELDS = {
  observe: ['fork_date_list', 'star_date_list'],
  issue: ['issue_creation_date_list', 'issue_comments_date_list'],
  code: ['pr_creation_date_list', 'pr_comments_date_list', 'code_author_date_list', 'code_committer_date_list'],
  issue_admin: ['issue_labeled_date_list', 'issue_unlabeled_date_list', 'issue_closed_date_list', 'issue_reopened_date_list', 'issue_assigned_date_list', 'issue_unassigned_date_list', 'issue_milestoned_date_list', 'issue_demilestoned_date_list', 'issue_marked_as_duplicate_date_list', 'issue_transferred_date_list', 'issue_renamed_title_date_list', 'issue_change_description_date_list', 'issue_setting_priority_date_list', 'issue_change_priority_date_list', 'issue_link_pull_request_date_list', 'issue_unlink_pull_request_date_list', 'issue_assign_collaborator_date_list', 'issue_unassign_collaborator_date_list', 'issue_change_issue_state_date_list', 'issue_change_issue_type_date_list', 'issue_setting_branch_date_list', 'issue_change_branch_date_list'],
  code_admin: ['pr_labeled_date_list', 'pr_unlabeled_date_list', 'pr_closed_date_list', 'pr_assigned_date_list', 'pr_unassigned_date_list', 'pr_reopened_date_list', 'pr_milestoned_date_list', 'pr_demilestoned_date_list', 'pr_marked_as_duplicate_date_list', 'pr_transferred_date_list', 'pr_renamed_title_date_list', 'pr_change_description_date_list', 'pr_setting_priority_date_list', 'pr_change_priority_date_list', 'pr_merged_date_list', 'pr_review_date_list', 'pr_set_tester_date_list', 'pr_unset_tester_date_list', 'pr_check_pass_date_list', 'pr_test_pass_date_list', 'pr_reset_assign_result_date_list', 'pr_reset_test_result_date_list', 'pr_link_issue_date_list', 'pr_unlink_issue_date_list']
};

const DATE_FIELD_KEYS = Object.values(CONTRIBUTION_FIELDS).flat();
const CACHE_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;

// /repos/:owner/:name/issues/events returns 100 events/page sorted newest-first.
// 5 pages = 500 events per (repo × alias) which is plenty to cover a year of
// admin activity on the tracked repos while keeping the per-snapshot wall time
// bounded under Vercel's serverless-function timeout.
const ISSUE_EVENT_MAX_PAGES = 5;

const ISSUE_EVENT_FIELD_MAP = {
  issue: {
    labeled: 'issue_labeled_date_list',
    unlabeled: 'issue_unlabeled_date_list',
    closed: 'issue_closed_date_list',
    reopened: 'issue_reopened_date_list',
    assigned: 'issue_assigned_date_list',
    unassigned: 'issue_unassigned_date_list',
    milestoned: 'issue_milestoned_date_list',
    demilestoned: 'issue_demilestoned_date_list',
    marked_as_duplicate: 'issue_marked_as_duplicate_date_list',
    transferred: 'issue_transferred_date_list',
    renamed: 'issue_renamed_title_date_list',
  },
  pr: {
    labeled: 'pr_labeled_date_list',
    unlabeled: 'pr_unlabeled_date_list',
    closed: 'pr_closed_date_list',
    reopened: 'pr_reopened_date_list',
    assigned: 'pr_assigned_date_list',
    unassigned: 'pr_unassigned_date_list',
    milestoned: 'pr_milestoned_date_list',
    demilestoned: 'pr_demilestoned_date_list',
    marked_as_duplicate: 'pr_marked_as_duplicate_date_list',
    transferred: 'pr_transferred_date_list',
    renamed: 'pr_renamed_title_date_list',
  },
};

const createEmptyContributionDates = () => DATE_FIELD_KEYS.reduce((acc, key) => {
  acc[key] = [];
  return acc;
}, {});

const createEmptyStatCategory = (totalCount = 0) => ({
  total_count: totalCount,
  items: [],
});

const buildRepoStatsFromSummary = (repoSummary = {}) =>
  Object.fromEntries(
    Object.entries(repoSummary).map(([repoName, stats]) => [
      repoName,
      {
        pr_created: createEmptyStatCategory(stats?.pr_created || 0),
        pr_merged: createEmptyStatCategory(stats?.pr_merged || 0),
        issues_created: createEmptyStatCategory(stats?.issues_created || 0),
      }
    ])
  );

const pushDate = (target, key, value) => {
  if (value && target[key]) target[key].push(value);
};

const createTargetRepoAliases = (baseTargetRepos, targetLogin) => {
  const normalizedLogin = normalizeGitHubLogin(targetLogin);

  return baseTargetRepos.reduce((acc, repo) => {
    const [owner, repoName] = repo.split('/');
    const aliases = new Set([repo]);

    if (repo === 'iflytek/astron-agent') {
      aliases.add('FenjuFu/astron-agent');
    }

    if (repo === 'iflytek/astron-rpa') {
      aliases.add('FenjuFu/astron-rpa');
    }

    if (repo === 'iflytek/skillhub') {
      aliases.add('FenjuFu/skillhub');
    }

    if (normalizedLogin && normalizeGitHubLogin(owner) !== normalizedLogin) {
      aliases.add(`${normalizedLogin}/${repoName}`);
    }

    acc[repo] = Array.from(aliases);
    return acc;
  }, {});
};

export const calculateTotalContributions = ({
  repoStats = {},
  contributionDatesByRepo = {},
  astronStats = {},
} = {}) => {
  const searchBasedTotal = Object.values(repoStats).reduce((sum, stats) => {
    return sum + stats.pr_created.total_count + stats.pr_merged.total_count + stats.issues_created.total_count;
  }, 0);

  const searchTrackedKeys = new Set(['pr_creation_date_list', 'pr_merged_date_list', 'issue_creation_date_list']);
  const otherBehaviorsTotal = Object.values(contributionDatesByRepo).reduce((total, repoDates) => {
    return total + Object.entries(repoDates).reduce((repoTotal, [key, dates]) => {
      return searchTrackedKeys.has(key) ? repoTotal : repoTotal + dates.length;
    }, 0);
  }, 0);

  return searchBasedTotal
    + otherBehaviorsTotal
    + (astronStats.agent?.workflows || 0)
    + (astronStats.rpa?.tasks || 0);
};

const isDateInRange = (value, fromDate, toDate) => {
  if (!value) return false;
  const d = new Date(value);
  return d >= fromDate && d <= toDate;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Gates concurrent calls through a queue. Used inside fetchContributionSnapshot
// to keep the per-snapshot fan-out (many GitHub REST + search calls across
// several repos × aliases) below GitHub's secondary rate-limit threshold and
// avoid swamping Node's default agent sockets — both of which can push the
// serverless function past Vercel's request timeout.
const createConcurrencyGate = (limit) => {
  let active = 0;
  const queue = [];
  const runNext = () => {
    if (active >= limit || queue.length === 0) return;
    active += 1;
    const job = queue.shift();
    Promise.resolve()
      .then(job.task)
      .then(job.resolve, job.reject)
      .finally(() => {
        active -= 1;
        runNext();
      });
  };
  return (task) => new Promise((resolve, reject) => {
    queue.push({ task, resolve, reject });
    runNext();
  });
};

// Concurrency cap for outbound GitHub API calls per fetchContributionSnapshot.
// Empirically GitHub's secondary rate-limit kicks in around ~10 in-flight
// requests from a single token; 8 leaves headroom for retries.
const GITHUB_FETCH_CONCURRENCY = 8;

// GitHub's authenticated search API allows ~30 requests per minute per token.
// Pace at 28/min to leave headroom for any concurrent background refresh fired
// from this warm instance and to avoid bumping into secondary rate-limits.
const SEARCH_RATE_LIMIT_PER_MINUTE = 28;
const SEARCH_RATE_LIMIT_REFILL_MS = 60_000 / SEARCH_RATE_LIMIT_PER_MINUTE;
const SEARCH_RATE_LIMITER_TTL_MS = 10 * 60 * 1000;

// Per-token token buckets. The Map persists across requests within a warm
// serverless instance so two snapshot calls fired in quick succession for the
// same user share a budget. Cold starts reset the buckets, which matches
// GitHub's own behavior (the limit is wall-clock per-token, not in our state).
const searchRateLimiters = new Map();

const pruneStaleSearchRateLimiters = (now = Date.now()) => {
  for (const [key, bucket] of searchRateLimiters) {
    if (now - bucket.lastUsedAt > SEARCH_RATE_LIMITER_TTL_MS) {
      if (bucket.timer) clearTimeout(bucket.timer);
      searchRateLimiters.delete(key);
    }
  }
};

const getSearchRateLimiterBucket = (token) => {
  let bucket = searchRateLimiters.get(token);
  if (!bucket) {
    const now = Date.now();
    bucket = {
      tokens: SEARCH_RATE_LIMIT_PER_MINUTE,
      lastRefillAt: now,
      lastUsedAt: now,
      queue: [],
      timer: null,
    };
    searchRateLimiters.set(token, bucket);
  }
  return bucket;
};

const refillSearchBucket = (bucket, at) => {
  const elapsed = at - bucket.lastRefillAt;
  if (elapsed <= 0) return;
  bucket.tokens = Math.min(
    SEARCH_RATE_LIMIT_PER_MINUTE,
    bucket.tokens + elapsed / SEARCH_RATE_LIMIT_REFILL_MS,
  );
  bucket.lastRefillAt = at;
};

const drainSearchBucket = (bucket) => {
  refillSearchBucket(bucket, Date.now());
  while (bucket.queue.length > 0 && bucket.tokens >= 1) {
    bucket.tokens -= 1;
    bucket.lastUsedAt = Date.now();
    const resolve = bucket.queue.shift();
    resolve();
  }
  if (bucket.queue.length > 0 && !bucket.timer) {
    const tokensNeeded = 1 - bucket.tokens;
    const waitMs = Math.max(50, Math.ceil(tokensNeeded * SEARCH_RATE_LIMIT_REFILL_MS));
    bucket.timer = setTimeout(() => {
      bucket.timer = null;
      drainSearchBucket(bucket);
    }, waitMs);
    if (typeof bucket.timer?.unref === 'function') bucket.timer.unref();
  }
};

// Per-token rate limit gate for search/issues calls. Token-bucket: starts full
// (capacity = SEARCH_RATE_LIMIT_PER_MINUTE) so the first burst of a fresh
// snapshot fires immediately, then paces at SEARCH_RATE_LIMIT_PER_MINUTE.
// Exported for unit testing only.
export const acquireSearchSlot = (token) => new Promise((resolve) => {
  if (!token) {
    resolve();
    return;
  }
  pruneStaleSearchRateLimiters();
  const bucket = getSearchRateLimiterBucket(token);
  refillSearchBucket(bucket, Date.now());
  if (bucket.tokens >= 1 && bucket.queue.length === 0) {
    bucket.tokens -= 1;
    bucket.lastUsedAt = Date.now();
    resolve();
    return;
  }
  bucket.queue.push(resolve);
  drainSearchBucket(bucket);
});

// Exported for unit testing only. Clears all per-token buckets so tests run
// in isolation and a fresh process starts from a known state.
export const __resetSearchRateLimiters = () => {
  for (const bucket of searchRateLimiters.values()) {
    if (bucket.timer) clearTimeout(bucket.timer);
  }
  searchRateLimiters.clear();
};

const buildGitHubHeaders = (token, accept = 'application/vnd.github.v3+json') => {
  const headers = { Accept: accept };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const GITHUB_CALLBACK_PATH = '/api/github/callback';
const resolveGitHubRedirectUri = (request) => {
  const protocol = request.headers['x-forwarded-proto'] || 'http';
  const host = request.headers.host;
  const fallbackRedirectUri = `${protocol}://${host}${GITHUB_CALLBACK_PATH}`;
  const configuredRedirectUri = process.env.GITHUB_REDIRECT_URI || process.env.VITE_GITHUB_REDIRECT_URI;

  if (!configuredRedirectUri) {
    return fallbackRedirectUri;
  }

  try {
    const parsedConfiguredUri = new URL(configuredRedirectUri);
    const parsedFallbackUri = new URL(fallbackRedirectUri);
    const hasValidCallbackPath = parsedConfiguredUri.pathname === GITHUB_CALLBACK_PATH;
    const hasSameOrigin = parsedConfiguredUri.origin === parsedFallbackUri.origin;

    if (hasValidCallbackPath && hasSameOrigin) {
      return parsedConfiguredUri.toString();
    }
  } catch (error) {
    console.warn('Invalid GitHub redirect URI configuration, falling back to request origin', error);
    return fallbackRedirectUri;
  }

  console.warn('Unsafe GitHub redirect URI configuration, falling back to request origin', {
    configuredRedirectUri,
    fallbackRedirectUri,
  });
  return fallbackRedirectUri;
};

const buildExpiredCookie = (name) => `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;

const getDefaultContributionWindow = (referenceDate = new Date()) => {
  const toDate = new Date(referenceDate);
  const fromDate = new Date(toDate);
  fromDate.setFullYear(toDate.getFullYear() - 1);
  return { fromDate, toDate };
};

let mongodbClientPromise;
const getMongoClientPromise = async () => {
  if (!mongodbClientPromise) {
    mongodbClientPromise = import('./_lib/mongodb.js')
      .then((module) => module.default)
      .catch((error) => {
        console.error('Mongo client unavailable', error);
        return null;
      });
  }

  return mongodbClientPromise;
};

const getDatabase = async () => {
  try {
    const clientPromise = await getMongoClientPromise();
    if (!clientPromise) return null;
    const client = await clientPromise;
    return client.db('astron_workflow');
  } catch (error) {
    console.error('GitHub stats database unavailable', error);
    return null;
  }
};

const safeDatabaseRead = async (db, label, readOperation, fallbackValue) => {
  if (!db) return fallbackValue;
  try {
    return await readOperation();
  } catch (error) {
    console.error(`${label} failed`, error);
    return fallbackValue;
  }
};

const safeDatabaseWrite = async (db, label, writeOperation) => {
  if (!db) return;
  try {
    await writeOperation();
  } catch (error) {
    console.error(`${label} failed`, error);
  }
};

let supabaseAdminClientPromise;
const getSupabaseAdminClient = async () => {
  if (!supabaseAdminClientPromise) {
    supabaseAdminClientPromise = import('./_lib/supabase-admin.js')
      .then((module) => module.supabaseAdmin)
      .catch((error) => {
        console.error('Supabase admin client unavailable', error);
        return null;
      });
  }

  return supabaseAdminClientPromise;
};

const getRedemptionEntries = async () => {
  try {
    const supabaseAdmin = await getSupabaseAdminClient();
    if (!supabaseAdmin) {
      return [];
    }

    const redemptionsResult = await supabaseAdmin
      .from('redemptions')
      .select('github_login')
      .not('github_login', 'is', null);

    if (redemptionsResult.error) {
      throw redemptionsResult.error;
    }

    return redemptionsResult.data || [];
  } catch (error) {
    console.error('Supabase redemptions unavailable', error);
    return [];
  }
};

const upsertGitHubUserProfile = async (db, userData, extraFields = {}) => {
  if (!userData?.login) return;

  await db.collection('users').updateOne(
    { github_username: userData.login },
    {
      $set: {
        github_username: userData.login,
        name: userData.name || userData.login,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
        updated_at: new Date(),
        ...extraFields,
      },
    },
    { upsert: true }
  );
};

const buildCachedContributionResponse = (entry) => {
  if (!entry?.github_username) return null;

  const referenceDate = entry.updated_at || new Date();
  const { fromDate, toDate } = getDefaultContributionWindow(referenceDate);

  return {
    user: {
      login: entry.github_username,
      name: entry.name || entry.github_username,
      avatar_url: entry.avatar_url || buildDefaultAvatarUrl(entry.github_username),
      html_url: entry.html_url || `https://github.com/${encodeURIComponent(entry.github_username)}`,
    },
    range: {
      from: entry.range?.from || fromDate,
      to: entry.range?.to || toDate,
    },
    repos: entry.repos && Object.keys(entry.repos).length > 0
      ? entry.repos
      : buildRepoStatsFromSummary(entry.repo_summary),
    contribution_fields: entry.contribution_fields || CONTRIBUTION_FIELDS,
    contribution_dates: entry.contribution_dates || {},
    astron: entry.astron || { agent: { workflows: 0, runs: 0 }, rpa: { tasks: 0, hoursSaved: 0 } },
    total_contributions: getEntryTotalContributions(entry),
    repo_summary: entry.repo_summary || {},
    updated_at: entry.updated_at || new Date().toISOString(),
  };
};

const persistContributionSnapshot = async (db, snapshot) => {
  if (!db || !snapshot?.user?.login) return;

  await db.collection('contribution_cache').updateOne(
    { github_username: snapshot.user.login },
    {
      $set: {
        github_username: snapshot.user.login,
        name: snapshot.user.name || snapshot.user.login,
        avatar_url: snapshot.user.avatar_url,
        html_url: snapshot.user.html_url,
        range: snapshot.range,
        repos: snapshot.repos,
        contribution_fields: snapshot.contribution_fields,
        contribution_dates: snapshot.contribution_dates,
        astron: snapshot.astron,
        total_contributions: snapshot.total_contributions,
        repo_summary: snapshot.repo_summary,
        updated_at: new Date(snapshot.updated_at || new Date()),
      },
    },
    { upsert: true }
  );
};

const queueContributionCacheRefresh = ({ token, login, force = false }) => {
  if (!token || !login) return;

  Promise.resolve()
    .then(async () => {
      const db = await getDatabase();
      const existingCache = await safeDatabaseRead(
        db,
        'Loading contribution cache entry',
        () => db.collection('contribution_cache').findOne({ github_username: login }),
        null
      );

      const hasDetailedSnapshot = existingCache?.repos && existingCache?.contribution_dates;
      const isFresh = existingCache?.updated_at
        ? Date.now() - new Date(existingCache.updated_at).getTime() < CACHE_REFRESH_INTERVAL_MS
        : false;

      if (!force && hasDetailedSnapshot && isFresh) {
        return;
      }

      const { fromDate, toDate } = getDefaultContributionWindow();
      await fetchContributionSnapshot({ token, login, fromDate, toDate });
    })
    .catch((error) => {
      console.error(`Background contribution cache refresh failed for ${login}`, error);
    });
};

async function fetchContributionSnapshot({ token, login, fromDate, toDate }) {
  if (!token) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }

  const db = await getDatabase();
  const authHeaders = buildGitHubHeaders(token);
  const githubGate = createConcurrencyGate(GITHUB_FETCH_CONCURRENCY);
  const gatedFetch = (url, init) => githubGate(() => fetch(url, init));
  const userResponse = await gatedFetch('https://api.github.com/user', {
    headers: authHeaders,
  });

  if (!userResponse.ok) {
    const error = new Error('Failed to fetch user');
    error.statusCode = userResponse.status;
    throw error;
  }

  const requesterUser = await userResponse.json();
  await safeDatabaseWrite(db, 'Upserting requester GitHub profile', () =>
    upsertGitHubUserProfile(db, requesterUser, {
      oauth_token: token,
      last_login_at: new Date(),
    })
  );

  let userData = requesterUser;
  let targetLogin = login || requesterUser.login;

  if (targetLogin !== requesterUser.login) {
    const targetUserRes = await gatedFetch(`https://api.github.com/users/${targetLogin}`, {
      headers: authHeaders,
    });
    if (!targetUserRes.ok) {
      const error = new Error('Failed to fetch target user');
      error.statusCode = targetUserRes.status;
      throw error;
    }
    userData = await targetUserRes.json();
  }

  await safeDatabaseWrite(db, 'Upserting target GitHub profile', () =>
    upsertGitHubUserProfile(db, userData)
  );

  const fromStr = fromDate.toISOString().split('T')[0];
  const toStr = toDate.toISOString().split('T')[0];
  const topicRepos = await fetchAllPages(async (page) => {
    const res = await gatedFetch(`https://api.github.com/search/repositories?q=topic:iflytek-astron&per_page=100&page=${page}`, {
      headers: authHeaders,
    });
    if (!res.ok) return { items: [], hasNext: false };
    const data = await res.json();
    return { items: data.items.map((repo) => repo.full_name), hasNext: hasNextPage(res.headers.get('link')) };
  });

  const baseTargetRepos = Array.from(new Set([
    ...topicRepos,
    'iflytek/astron-agent',
    'iflytek/astron-rpa',
    'iflytek/skillhub',
    'iflytek/iFly-Skills',
    'iflytek/astronclaw-tutorial',
  ]));
  const targetRepoAliases = createTargetRepoAliases(baseTargetRepos, targetLogin);
  const targetReposMap = baseTargetRepos.reduce((acc, repo) => {
    (targetRepoAliases[repo] || [repo]).forEach((alias) => {
      acc[normalizeRepoFullName(alias)] = repo;
    });
    return acc;
  }, {});
  const targetReposSet = new Set(Object.keys(targetReposMap));

  const repoStats = {};
  const contributionDatesByRepo = {};
  baseTargetRepos.forEach((repo) => {
    repoStats[repo] = {
      pr_created: { total_count: 0, items: [] },
      pr_merged: { total_count: 0, items: [] },
      issues_created: { total_count: 0, items: [] }
    };
    contributionDatesByRepo[repo] = createEmptyContributionDates();
  });

  const search = async (q) => {
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100`;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      // Pace search calls per-token against GitHub's ~30/min cap. The retry
      // loop below stays as a safety net for residual 403/429 (secondary
      // rate-limits, shared org limits, etc.) but the limiter should keep us
      // out of those in steady state.
      await acquireSearchSlot(token);
      const res = await gatedFetch(url, { headers: authHeaders });
      if (res.ok) return res.json();

      if (res.status === 403 || res.status === 429) {
        const retryAfterSec = parseInt(res.headers.get('retry-after') || '', 10);
        const resetSec = parseInt(res.headers.get('x-ratelimit-reset') || '', 10);
        let waitMs;
        if (Number.isFinite(retryAfterSec)) {
          waitMs = retryAfterSec * 1000;
        } else if (Number.isFinite(resetSec)) {
          waitMs = Math.max(0, resetSec * 1000 - Date.now());
        } else {
          waitMs = (attempt + 1) * 5000;
        }
        waitMs = Math.min(Math.max(waitMs, 1000), 60000);
        console.warn(`GitHub Search rate-limited (${res.status}) on "${q}", waiting ${waitMs}ms (attempt ${attempt + 1}/4)`);
        await delay(waitMs);
        continue;
      }

      const errText = await res.text();
      console.error(`Search failed for ${q}: ${res.status} ${errText}`);
      const error = new Error(`GitHub search failed: ${res.status}`);
      error.statusCode = res.status;
      throw error;
    }
    const error = new Error(`GitHub search persistently rate-limited: ${q}`);
    error.statusCode = 429;
    throw error;
  };

  // Build the full search spec list (PR created / merged / issues created /
  // issue commenter / PR commenter for each repo × alias, with open/closed
  // split where applicable) and try the GraphQL batch first. If GraphQL fails
  // for any reason — endpoint outage, query complexity, schema drift — fall
  // back to the existing per-call REST search() path, which is slower but
  // independently exercised by tests and proven.
  const searchSpecs = buildContributionSearchSpecs({
    baseTargetRepos,
    targetRepoAliases,
    targetLogin,
    fromStr,
    toStr,
  });

  const applySearchResultsToStats = (specResults) => {
    // Group open/closed legs of the same logical query so we sum total_count
    // (matching mergeSearchResults) and dedup items by id (so date lists
    // don't double-count items present in both legs after a state change).
    const grouped = new Map();
    for (const result of specResults) {
      const key = `${result.repo}::${result.kind}`;
      let bucket = grouped.get(key);
      if (!bucket) {
        bucket = { repo: result.repo, kind: result.kind, total_count: 0, items: [], seenIds: new Set() };
        grouped.set(key, bucket);
      }
      bucket.total_count += result.total_count || 0;
      for (const item of result.items || []) {
        const dedupKey = item.id ?? item.node_id ?? item.html_url ?? JSON.stringify(item);
        if (bucket.seenIds.has(dedupKey)) continue;
        bucket.seenIds.add(dedupKey);
        bucket.items.push(item);
      }
    }

    for (const { repo, kind, total_count, items } of grouped.values()) {
      switch (kind) {
        case 'pr_created':
          repoStats[repo].pr_created.total_count += total_count;
          repoStats[repo].pr_created.items.push(...items);
          items.forEach((item) => pushDate(contributionDatesByRepo[repo], 'pr_creation_date_list', item.created_at));
          break;
        case 'pr_merged':
          repoStats[repo].pr_merged.total_count += total_count;
          repoStats[repo].pr_merged.items.push(...items);
          items.forEach((item) => pushDate(contributionDatesByRepo[repo], 'pr_merged_date_list', item.closed_at));
          break;
        case 'issues_created':
          repoStats[repo].issues_created.total_count += total_count;
          repoStats[repo].issues_created.items.push(...items);
          items.forEach((item) => pushDate(contributionDatesByRepo[repo], 'issue_creation_date_list', item.created_at));
          break;
        case 'issue_commenter':
          items.forEach((item) => pushDate(contributionDatesByRepo[repo], 'issue_comments_date_list', item.updated_at));
          break;
        case 'pr_commenter':
          items.forEach((item) => pushDate(contributionDatesByRepo[repo], 'pr_comments_date_list', item.updated_at));
          break;
        default:
          break;
      }
    }
  };

  const promises = [];
  promises.push((async () => {
    try {
      const specResults = await fetchSearchResultsViaGraphQL({ token, specs: searchSpecs });
      applySearchResultsToStats(specResults);
    } catch (graphqlError) {
      console.warn(
        `GraphQL search batch failed for ${targetLogin}, falling back to REST: ${graphqlError.message}`,
      );
      const restResults = await Promise.all(searchSpecs.map(async (spec) => {
        try {
          const data = await search(spec.query);
          return { ...spec, total_count: data.total_count || 0, items: data.items || [] };
        } catch (restError) {
          console.error(`REST fallback search failed for "${spec.query}":`, restError);
          return { ...spec, total_count: 0, items: [] };
        }
      }));
      applySearchResultsToStats(restResults);
    }
  })());

  promises.push((async () => {
    const starred = await fetchAllPages(async (page) => {
      const res = await gatedFetch(`https://api.github.com/users/${targetLogin}/starred?sort=created&direction=desc&per_page=100&page=${page}`, {
        headers: buildGitHubHeaders(token, 'application/vnd.github.v3.star+json'),
      });
      return { items: await res.json(), hasNext: hasNextPage(res.headers.get('link')) };
    });
    starred.forEach((starredRepo) => {
      const normalizedRepo = normalizeRepoFullName(starredRepo.repo?.full_name);
      if (targetReposSet.has(normalizedRepo) && isDateInRange(starredRepo.starred_at, fromDate, toDate)) {
        pushDate(contributionDatesByRepo[targetReposMap[normalizedRepo]], 'star_date_list', starredRepo.starred_at);
      }
    });
  })());

  promises.push((async () => {
    const userRepos = await fetchAllPages(async (page) => {
      const res = await gatedFetch(`https://api.github.com/users/${targetLogin}/repos?type=owner&sort=created&direction=desc&per_page=100&page=${page}`, {
        headers: authHeaders,
      });
      return { items: await res.json(), hasNext: hasNextPage(res.headers.get('link')) };
    });
    const forks = userRepos.filter((repo) => repo.fork);
    await Promise.all(forks.map(async (repo) => {
      const res = await gatedFetch(repo.url, { headers: authHeaders });
      if (res.ok) {
        const fullRepo = await res.json();
        const normalizedUpstream = normalizeRepoFullName(fullRepo.source?.full_name || fullRepo.parent?.full_name);
        if (targetReposSet.has(normalizedUpstream) && isDateInRange(fullRepo.created_at, fromDate, toDate)) {
          pushDate(contributionDatesByRepo[targetReposMap[normalizedUpstream]], 'fork_date_list', fullRepo.created_at);
        }
      }
    }));
  })());

  promises.push(...baseTargetRepos.map((repo) => (async () => {
    await Promise.all((targetRepoAliases[repo] || [repo]).map(async (alias) => {
      const [owner, name] = alias.split('/');
      const commits = await fetchAllPages(async (page) => {
        const res = await gatedFetch(
          `https://api.github.com/repos/${owner}/${name}/commits?author=${targetLogin}&since=${fromDate.toISOString()}&until=${toDate.toISOString()}&per_page=100&page=${page}`,
          { headers: authHeaders }
        );

        if (!res.ok) {
          return { items: [], hasNext: false };
        }

        const items = await res.json();
        return { items, hasNext: hasNextPage(res.headers.get('link')) };
      });

      commits.forEach((commit) => {
        pushDate(contributionDatesByRepo[repo], 'code_author_date_list', commit.commit?.author?.date);
        pushDate(contributionDatesByRepo[repo], 'code_committer_date_list', commit.commit?.committer?.date);
      });
    }));
  })()));

  promises.push(...baseTargetRepos.map((repo) => (async () => {
    await Promise.all((targetRepoAliases[repo] || [repo]).map(async (alias) => {
      const [owner, name] = alias.split('/');
      let page = 1;
      while (page <= ISSUE_EVENT_MAX_PAGES) {
        const res = await gatedFetch(
          `https://api.github.com/repos/${owner}/${name}/issues/events?per_page=100&page=${page}`,
          { headers: authHeaders }
        );

        if (!res.ok) break;

        const events = await res.json();
        if (!Array.isArray(events) || events.length === 0) break;

        let reachedOlder = false;
        for (const event of events) {
          if (!event.created_at) continue;
          const eventDate = new Date(event.created_at);
          if (eventDate < fromDate) {
            reachedOlder = true;
            break;
          }
          if (eventDate > toDate) continue;
          if (event.actor?.login !== targetLogin) continue;

          const kind = event.issue?.pull_request ? 'pr' : 'issue';
          const field = ISSUE_EVENT_FIELD_MAP[kind]?.[event.event];
          if (field) {
            pushDate(contributionDatesByRepo[repo], field, event.created_at);
          }
        }

        if (reachedOlder) break;
        if (!hasNextPage(res.headers.get('link'))) break;
        page += 1;
      }
    }));
  })()));

  await Promise.all(promises);
  Object.values(contributionDatesByRepo).forEach((repo) => {
    Object.keys(repo).forEach((key) => {
      repo[key] = [...repo[key]].sort();
    });
  });

  const storedUser = await safeDatabaseRead(
    db,
    'Loading stored GitHub user profile',
    () => db.collection('users').findOne({ github_username: targetLogin }),
    null
  );
  const astronStats = storedUser?.contributions || { agent: { workflows: 0, runs: 0 }, rpa: { tasks: 0, hoursSaved: 0 } };
  const totalContributions = calculateTotalContributions({ repoStats, contributionDatesByRepo, astronStats });
  const repoSummary = buildRepoSummary(repoStats);
  const snapshot = {
    user: {
      login: userData.login,
      name: userData.name,
      avatar_url: userData.avatar_url,
      html_url: userData.html_url,
    },
    range: { from: fromDate, to: toDate },
    repos: repoStats,
    contribution_fields: CONTRIBUTION_FIELDS,
    contribution_dates: contributionDatesByRepo,
    astron: astronStats,
    total_contributions: totalContributions,
    repo_summary: repoSummary,
    updated_at: new Date().toISOString(),
  };

  await safeDatabaseWrite(db, 'Updating contribution cache', () =>
    persistContributionSnapshot(db, snapshot)
  );

  return snapshot;
}

// --- Action Handlers ---

async function handleLogin(request, response) {
  const clientId = process.env.GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID;
  const redirectUri = resolveGitHubRedirectUri(request);

  if (!clientId) {
    return response.status(500).json({ error: 'Missing GITHUB_CLIENT_ID' });
  }

  const state = crypto.randomUUID();
  const from = request.query.from || request.headers.referer || '/';

  const cookieAttributes = [
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=600'
  ];
  if (process.env.NODE_ENV === 'production') cookieAttributes.push('Secure');

  const stateCookie = `github_auth_state=${state}; ${cookieAttributes.join('; ')}`;
  const returnCookie = `github_auth_return_to=${from}; ${cookieAttributes.join('; ')}`;

  response.setHeader('Set-Cookie', [stateCookie, returnCookie]);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user',
    state
  });

  response.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}

async function handleCallback(request, response) {
  const { code, state } = request.query;
  const cookies = cookie.parse(request.headers.cookie || '');
  const storedState = cookies.github_auth_state;
  const returnTo = cookies.github_auth_return_to || '/';

  if (!code || !state || state !== storedState) {
    return response.status(400).json({ error: 'Invalid state or code' });
  }

  const clientId = process.env.GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = resolveGitHubRedirectUri(request);

  if (!clientId || !clientSecret) {
    return response.status(500).json({ error: 'Missing GitHub credentials' });
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri }),
  });

  const tokenData = await tokenResponse.json();
  if (tokenData.error) return response.status(400).json(tokenData);

  try {
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      const db = await getDatabase();
      if (db) {
        await upsertGitHubUserProfile(db, userData, {
          oauth_token: tokenData.access_token,
          last_login_at: new Date(),
        });
      }
      queueContributionCacheRefresh({
        token: tokenData.access_token,
        login: userData.login,
        force: true,
      });
    }
  } catch (error) {
    console.error('User sync error', error);
  }

  const cookieOptions = [
    `gh_token=${tokenData.access_token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=2592000'
  ];
  if (process.env.NODE_ENV === 'production') cookieOptions.push('Secure');

  response.setHeader('Set-Cookie', [
    cookieOptions.join('; '),
    'github_auth_state=; Path=/; Max-Age=0',
    'github_auth_return_to=; Path=/; Max-Age=0'
  ]);

  response.redirect(returnTo);
}

async function handleLogout(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  response.setHeader('Set-Cookie', [buildExpiredCookie('gh_token')]);
  response.status(200).json({ ok: true });
}

async function handleSession(request, response) {
  const cookies = cookie.parse(request.headers.cookie || '');
  const token = cookies.gh_token;
  if (!token) {
    return response.status(401).json({ authenticated: false });
  }

  try {
    const userResponse = await fetch('https://api.github.com/user', {
      headers: buildGitHubHeaders(token),
    });

    if (!userResponse.ok) {
      if (userResponse.status === 401 || userResponse.status === 403) {
        response.setHeader('Set-Cookie', [buildExpiredCookie('gh_token')]);
        return response.status(401).json({ authenticated: false });
      }

      return response.status(userResponse.status).json({ error: 'Failed to validate session' });
    }

    const userData = await userResponse.json();

    // DB upsert is fire-and-forget to keep the session check fast.
    // The callback handler already persists the token on first login.
    getDatabase()
      .then((db) => {
        if (!db) return;
        return upsertGitHubUserProfile(db, userData, {
          oauth_token: token,
          last_login_at: new Date(),
        });
      })
      .catch((e) => console.error('Session: background profile upsert failed', e));

    queueContributionCacheRefresh({
      token,
      login: userData.login,
    });

    return response.status(200).json({
      authenticated: true,
      user: {
        login: userData.login,
        name: userData.name,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
      },
    });
  } catch (error) {
    return response.status(502).json({ error: error.message || 'Failed to validate session' });
  }
}

async function handleToken(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method Not Allowed' });

  const clientId = process.env.GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const code = request.body?.code;

  if (!clientId || !clientSecret) return response.status(500).json({ error: 'Missing configuration' });
  if (!code) return response.status(400).json({ error: 'Missing code' });

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
  });

  const payload = await tokenResponse.json();
  if (!tokenResponse.ok || payload.error) return response.status(400).json({ error: payload.error_description || 'OAuth failed' });

  response.status(200).json({ access_token: payload.access_token });
}

async function handleContributions(request, response) {
  const db = await getDatabase();
  const cookies = cookie.parse(request.headers.cookie || '');
  const token = cookies.gh_token;
  let login = normalizeGitHubLogin(request.query.login);
  const isAdmin = isAdminRequest(request);
  const forceRefresh = request.query.force === '1' || request.query.force === 'true';

  if (login && !isAdmin) {
    return response.status(403).json({ error: 'Forbidden: Only admin can fetch other user contributions' });
  }

  let effectiveToken = token;
  if (login && isAdmin && !effectiveToken) {
    effectiveToken = await safeDatabaseRead(
      db,
      'Loading stored GitHub token',
      async () => {
        const storedUser = await db.collection('users').findOne(
          { github_username: login },
          { projection: { oauth_token: 1 } }
        );
        return storedUser?.oauth_token || null;
      },
      null
    );
  }

  // Resolve the requester's login from the stored token when an admin override
  // wasn't supplied, so the cache lookup below works on self-requests too.
  let cacheLookupLogin = login;
  if (!cacheLookupLogin && effectiveToken) {
    cacheLookupLogin = await safeDatabaseRead(
      db,
      'Loading github_username for token',
      async () => {
        const storedUser = await db.collection('users').findOne(
          { oauth_token: effectiveToken },
          { projection: { github_username: 1 } }
        );
        return storedUser?.github_username || null;
      },
      null
    );
  }

  const loadCachedEntry = async () => {
    if (!cacheLookupLogin) return null;
    return safeDatabaseRead(
      db,
      'Loading cached contribution snapshot',
      () => db.collection('contribution_cache').findOne({ github_username: cacheLookupLogin }),
      null
    );
  };

  if (!effectiveToken) {
    if (login && isAdmin) {
      const cachedSnapshot = buildCachedContributionResponse(await loadCachedEntry());

      if (cachedSnapshot) {
        response.setHeader('Cache-Control', 'no-store');
        return response.status(200).json(cachedSnapshot);
      }

      return response.status(404).json({ error: 'No saved contribution data for this user' });
    }

    return response.status(401).json({ error: 'Unauthorized' });
  }

  // Cache-first: if a fresh (< 6h) detailed snapshot exists, return it
  // immediately and queue a background refresh. This keeps /stats responsive
  // and protects us from running fetchContributionSnapshot (which fans out to
  // dozens of GitHub search/REST calls and is very prone to rate-limit) on
  // every page load. ?force=1 bypasses the cache for the explicit refresh
  // button on the page.
  const existingCacheEntry = forceRefresh ? null : await loadCachedEntry();
  const cacheIsFresh = existingCacheEntry?.updated_at
    && existingCacheEntry?.repos
    && existingCacheEntry?.contribution_dates
    && Date.now() - new Date(existingCacheEntry.updated_at).getTime() < CACHE_REFRESH_INTERVAL_MS;

  if (cacheIsFresh) {
    const cachedSnapshot = buildCachedContributionResponse(existingCacheEntry);
    if (cachedSnapshot) {
      // Fire-and-forget background refresh so the cache stays warm even when
      // /stats is the only thing the user opens.
      queueContributionCacheRefresh({
        token: effectiveToken,
        login: cacheLookupLogin,
      });
      response.setHeader('Cache-Control', 'no-store');
      return response.status(200).json(cachedSnapshot);
    }
  }

  const defaultWindow = getDefaultContributionWindow();
  const fromDate = request.query.from ? new Date(request.query.from) : defaultWindow.fromDate;
  const toDate = request.query.to ? new Date(request.query.to) : defaultWindow.toDate;
  try {
    const contributionData = await fetchContributionSnapshot({
      token: effectiveToken,
      login,
      fromDate,
      toDate,
    });
    response.status(200).json(contributionData);
  } catch (error) {
    console.error(`Contribution snapshot failed for ${cacheLookupLogin || '<self>'}`, error);

    // Fall back to whatever cached snapshot we have (stale or otherwise) so
    // the page can still render something instead of bubbling a 5xx.
    const cachedSnapshot = buildCachedContributionResponse(
      existingCacheEntry || await loadCachedEntry()
    );

    if (cachedSnapshot) {
      response.setHeader('Cache-Control', 'no-store');
      return response.status(200).json(cachedSnapshot);
    }

    response.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch contributions' });
  }
}

async function handleWarmRedemptionContributions(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!isAdminRequest(request)) {
    return response.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  try {
    const db = await getDatabase();
    const [cached, users, redemptions] = await Promise.all([
      safeDatabaseRead(
        db,
        'Loading contribution cache',
        () => db.collection('contribution_cache').find({ github_username: { $exists: true, $ne: null } }).toArray(),
        []
      ),
      safeDatabaseRead(
        db,
        'Loading GitHub users',
        () => db.collection('users').find(
          {},
          { projection: { github_username: 1, oauth_token: 1 } }
        ).toArray(),
        []
      ),
      getRedemptionEntries(),
    ]);

    const summary = await warmRedemptionContributionSnapshots({ cached, users, redemptions });
    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json(summary);
  } catch (error) {
    console.error('Warm redemption contributions error', error);
    return response.status(500).json({ error: 'Failed to warm redemption contributions' });
  }
}

const isAuthorizedWarmSnapshotRequest = (request) => {
  // When CRON_SECRET is configured, Vercel's cron sender includes it in the
  // Authorization header. We accept that, OR an explicit admin override via
  // the existing x-admin-password header.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.authorization || '';
    if (authHeader === `Bearer ${cronSecret}`) return true;
  }
  if (isAdminRequest(request)) return true;
  // If no CRON_SECRET is configured, fall back to the project's existing
  // "cron path is implicitly trusted" pattern (matches /api/lucky-draw/process-due).
  return !cronSecret;
};

// Time budget for one batch-refresh invocation. vercel.json sets maxDuration
// to 60s for this function; leave 10s margin to write the final response.
const BATCH_REFRESH_TIME_BUDGET_MS = 50_000;

const isBatchRefreshRequest = (request) => {
  const value = request.query.refresh_all;
  return value === '1' || value === 'true';
};

async function handleWarmSnapshots(request, response) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!isAuthorizedWarmSnapshotRequest(request)) {
    return response.status(403).json({ error: 'Forbidden' });
  }

  if (isBatchRefreshRequest(request)) {
    return await handleWarmSnapshotsBatch(request, response);
  }

  try {
    const db = await getDatabase();
    const overrideLogin = normalizeGitHubLogin(request.query.login);

    let candidate = null;
    if (overrideLogin) {
      // Targeted refresh for a single user (debugging / manual catch-up).
      const user = await safeDatabaseRead(
        db,
        'Loading override user',
        () => db.collection('users').findOne(
          { github_username: { $regex: `^${overrideLogin}$`, $options: 'i' } },
          { projection: { github_username: 1, oauth_token: 1 } }
        ),
        null
      );
      if (!user?.oauth_token) {
        response.setHeader('Cache-Control', 'no-store');
        return response.status(404).json({
          refreshed: null,
          attempted: overrideLogin,
          error: 'user_not_found_or_missing_oauth_token',
        });
      }
      const cachedEntry = await safeDatabaseRead(
        db,
        'Loading override user cache',
        () => db.collection('contribution_cache').findOne(
          { github_username: { $regex: `^${user.github_username}$`, $options: 'i' } },
          { projection: { github_username: 1, updated_at: 1 } }
        ),
        null
      );
      candidate = {
        login: user.github_username,
        normalizedLogin: overrideLogin,
        token: user.oauth_token,
        updatedAtMs: cachedEntry?.updated_at ? new Date(cachedEntry.updated_at).getTime() : 0,
      };
    } else {
      const [users, cached] = await Promise.all([
        safeDatabaseRead(
          db,
          'Loading users with oauth tokens',
          () => db.collection('users').find(
            { oauth_token: { $exists: true, $ne: null } },
            { projection: { github_username: 1, oauth_token: 1 } }
          ).toArray(),
          []
        ),
        safeDatabaseRead(
          db,
          'Loading contribution cache for warm pick',
          () => db.collection('contribution_cache').find(
            { github_username: { $exists: true, $ne: null } },
            { projection: { github_username: 1, updated_at: 1 } }
          ).toArray(),
          []
        ),
      ]);
      candidate = pickStaleestSnapshotCandidate({ users, cached });
    }

    if (!candidate) {
      response.setHeader('Cache-Control', 'no-store');
      return response.status(200).json({
        refreshed: null,
        reason: 'no_eligible_candidates',
      });
    }

    const startedAt = Date.now();
    const { fromDate, toDate } = getDefaultContributionWindow();
    try {
      await fetchContributionSnapshot({
        token: candidate.token,
        login: candidate.login,
        fromDate,
        toDate,
      });
      response.setHeader('Cache-Control', 'no-store');
      return response.status(200).json({
        refreshed: candidate.login,
        previous_updated_at: candidate.updatedAtMs
          ? new Date(candidate.updatedAtMs).toISOString()
          : null,
        took_ms: Date.now() - startedAt,
      });
    } catch (error) {
      console.error(`Warm snapshot failed for ${candidate.login}`, error);
      response.setHeader('Cache-Control', 'no-store');
      return response.status(200).json({
        refreshed: null,
        attempted: candidate.login,
        error: error.message || 'snapshot_failed',
        took_ms: Date.now() - startedAt,
      });
    }
  } catch (error) {
    console.error('Warm snapshots error', error);
    return response.status(500).json({ error: 'Failed to warm snapshots' });
  }
}

// Refresh as many stale users as we can fit in BATCH_REFRESH_TIME_BUDGET_MS.
// Iterates sequentially (so each completed snapshot is persisted before the
// next starts and the response payload accurately reflects what landed in
// the cache), oldest-first by current cache updated_at. If we hit the time
// budget mid-loop, remaining users are reported back so the caller can
// re-invoke until the queue drains. Designed for one-off admin sweeps after
// a deploy that invalidates cached data — the periodic cron at 10-min
// intervals continues to handle steady-state drift.
async function handleWarmSnapshotsBatch(request, response) {
  const startedAt = Date.now();
  try {
    const db = await getDatabase();
    const [users, cached] = await Promise.all([
      safeDatabaseRead(
        db,
        'Loading users with oauth tokens (batch)',
        () => db.collection('users').find(
          { oauth_token: { $exists: true, $ne: null } },
          { projection: { github_username: 1, oauth_token: 1 } }
        ).toArray(),
        []
      ),
      safeDatabaseRead(
        db,
        'Loading contribution cache for batch warm',
        () => db.collection('contribution_cache').find(
          { github_username: { $exists: true, $ne: null } },
          { projection: { github_username: 1, updated_at: 1 } }
        ).toArray(),
        []
      ),
    ]);

    const cachedByLogin = new Map();
    for (const entry of cached) {
      const normalizedLogin = normalizeGitHubLogin(entry.github_username);
      if (normalizedLogin) cachedByLogin.set(normalizedLogin, entry);
    }

    // Sort users by cache staleness (oldest updated_at first, uncached at the
    // very front). Skips users without oauth_token defensively even though
    // the DB query already filters them.
    const sortedUsers = users
      .filter((user) => !!user?.oauth_token)
      .map((user) => {
        const normalizedLogin = normalizeGitHubLogin(user.github_username);
        if (!normalizedLogin) return null;
        const cachedEntry = cachedByLogin.get(normalizedLogin);
        const updatedAtMs = cachedEntry?.updated_at
          ? new Date(cachedEntry.updated_at).getTime()
          : 0;
        return {
          login: user.github_username,
          normalizedLogin,
          token: user.oauth_token,
          updatedAtMs: Number.isFinite(updatedAtMs) ? updatedAtMs : 0,
        };
      })
      .filter(Boolean);

    sortedUsers.sort((a, b) => {
      if (a.updatedAtMs !== b.updatedAtMs) return a.updatedAtMs - b.updatedAtMs;
      return a.normalizedLogin.localeCompare(b.normalizedLogin);
    });

    const processed = [];
    const failed = [];
    const remaining = [];
    const { fromDate, toDate } = getDefaultContributionWindow();

    for (const candidate of sortedUsers) {
      if (Date.now() - startedAt > BATCH_REFRESH_TIME_BUDGET_MS) {
        remaining.push(candidate.login);
        continue;
      }
      const userStartedAt = Date.now();
      try {
        await fetchContributionSnapshot({
          token: candidate.token,
          login: candidate.login,
          fromDate,
          toDate,
        });
        processed.push({
          login: candidate.login,
          previous_updated_at: candidate.updatedAtMs
            ? new Date(candidate.updatedAtMs).toISOString()
            : null,
          took_ms: Date.now() - userStartedAt,
        });
      } catch (error) {
        console.error(`Batch warm failed for ${candidate.login}`, error);
        failed.push({
          login: candidate.login,
          error: error.message || 'snapshot_failed',
          took_ms: Date.now() - userStartedAt,
        });
      }
    }

    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json({
      mode: 'batch',
      processed,
      failed,
      remaining,
      elapsed_ms: Date.now() - startedAt,
      hit_time_limit: remaining.length > 0,
      total_eligible: sortedUsers.length,
    });
  } catch (error) {
    console.error('Batch warm snapshots error', error);
    return response.status(500).json({
      error: 'Failed to batch warm snapshots',
      elapsed_ms: Date.now() - startedAt,
    });
  }
}

// Returns per-repo per-field counts of contribution_dates for a given login.
// Returns ONLY aggregate counts, never raw timestamps, so it's safe to expose
// without auth. Useful for debugging why a snapshot total looks off without
// asking the user to share their full snapshot.
async function handleDiagnoseSnapshot(request, response) {
  const login = normalizeGitHubLogin(request.query.login);
  if (!login) {
    return response.status(400).json({ error: 'Missing ?login=' });
  }

  try {
    const db = await getDatabase();
    const cachedEntry = await safeDatabaseRead(
      db,
      'Loading contribution cache for diagnostic',
      () => db.collection('contribution_cache').findOne({
        github_username: { $regex: `^${login}$`, $options: 'i' },
      }),
      null
    );

    if (!cachedEntry) {
      return response.status(404).json({ error: 'No cached snapshot for that login' });
    }

    const reposListed = Object.keys(cachedEntry.contribution_dates || {}).sort();
    const datesPerRepo = {};
    let dateGrandTotal = 0;
    const searchTrackedKeys = new Set([
      'pr_creation_date_list', 'pr_merged_date_list', 'issue_creation_date_list',
    ]);
    let otherBehaviorsTotal = 0;
    const aggregatedFieldCounts = {};

    for (const repo of reposListed) {
      const repoDates = cachedEntry.contribution_dates[repo] || {};
      const repoSummary = {};
      for (const [field, dates] of Object.entries(repoDates)) {
        const count = Array.isArray(dates) ? dates.length : 0;
        if (count > 0) {
          repoSummary[field] = count;
          dateGrandTotal += count;
          aggregatedFieldCounts[field] = (aggregatedFieldCounts[field] || 0) + count;
          if (!searchTrackedKeys.has(field)) {
            otherBehaviorsTotal += count;
          }
        }
      }
      datesPerRepo[repo] = repoSummary;
    }

    const repoStatsSummary = {};
    let searchTotal = 0;
    for (const [repo, stats] of Object.entries(cachedEntry.repos || {})) {
      repoStatsSummary[repo] = {
        pr_created: stats?.pr_created?.total_count || 0,
        pr_merged: stats?.pr_merged?.total_count || 0,
        issues_created: stats?.issues_created?.total_count || 0,
      };
      searchTotal += repoStatsSummary[repo].pr_created
        + repoStatsSummary[repo].pr_merged
        + repoStatsSummary[repo].issues_created;
    }

    const astron = cachedEntry.astron || {};
    const astronTotal = (astron.agent?.workflows || 0) + (astron.rpa?.tasks || 0);

    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json({
      login: cachedEntry.github_username,
      updated_at: cachedEntry.updated_at,
      total_contributions: cachedEntry.total_contributions,
      recomputed: {
        search_total: searchTotal,
        other_behaviors_total: otherBehaviorsTotal,
        astron_total: astronTotal,
        grand_total: searchTotal + otherBehaviorsTotal + astronTotal,
      },
      repos_listed: reposListed,
      repo_stats: repoStatsSummary,
      contribution_field_counts_aggregated: aggregatedFieldCounts,
      contribution_field_counts_per_repo: datesPerRepo,
      total_date_entries_across_all_repos: dateGrandTotal,
    });
  } catch (error) {
    console.error('Diagnose snapshot error', error);
    return response.status(500).json({ error: error.message || 'diagnose_failed' });
  }
}

async function handleLeaderboard(request, response) {
  try {
    const db = await getDatabase();
    const [cached, users, redemptions] = await Promise.all([
      safeDatabaseRead(
        db,
        'Loading contribution cache',
        () => db.collection('contribution_cache').find({ github_username: { $exists: true, $ne: null } }).toArray(),
        []
      ),
      safeDatabaseRead(
        db,
        'Loading GitHub users',
        () => db.collection('users').find(
          {},
          { projection: { github_username: 1, name: 1, avatar_url: 1, updated_at: 1, last_login_at: 1, oauth_token: 1 } }
        ).toArray(),
        []
      ),
      getRedemptionEntries(),
    ]);
    const leaderboard = await buildLeaderboard({ cached, users, redemptions });

    // Return redeemed users with the best available contribution totals.
    response.setHeader('Cache-Control', 'no-store');
    response.status(200).json(leaderboard);
  } catch (e) {
    console.error('Leaderboard error', e);
    response.status(500).json({ error: 'Failed to load leaderboard' });
  }
}
