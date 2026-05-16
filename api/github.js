import cookie from 'cookie';
import crypto from 'crypto';
import clientPromise from './_lib/mongodb.js';
import { supabaseAdmin } from './_lib/supabase-admin.js';

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
const normalizeGitHubLogin = (login) => login?.trim().toLowerCase();

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

const upsertLeaderboardEntry = (entriesByLogin, entry) => {
  const normalizedLogin = normalizeGitHubLogin(entry?.login);
  if (!normalizedLogin) return;

  const existing = entriesByLogin.get(normalizedLogin) || {};
  const existingUpdatedAt = existing.updated_at ? new Date(existing.updated_at).getTime() : 0;
  const incomingUpdatedAt = entry.updated_at ? new Date(entry.updated_at).getTime() : 0;
  const hasIncomingRepoSummary = !!(entry.repo_summary && Object.keys(entry.repo_summary).length > 0);
  const shouldUseIncomingTotal = typeof entry.total_contributions === 'number' && (
    typeof existing.total_contributions !== 'number'
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
      ? entry.total_contributions
      : typeof existing.total_contributions === 'number'
        ? existing.total_contributions
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
  if (!entry || typeof entry.total_contributions !== 'number') return false;
  if (entry.total_contributions > 0) return true;

  return Object.values(entry.repo_summary || {}).some((repo) => {
    return (repo?.pr_created || 0) > 0 || (repo?.pr_merged || 0) > 0 || (repo?.issues_created || 0) > 0;
  });
};

const hasFreshLeaderboardCache = (cachedEntry, userEntry) => {
  if (typeof cachedEntry?.total_contributions !== 'number') return false;
  if (cachedEntry.total_contributions === 0 && !hasLeaderboardActivity(cachedEntry)) return false;
  if (!userEntry?.last_login_at) return true;
  if (!cachedEntry?.updated_at) return false;
  return new Date(cachedEntry.updated_at).getTime() >= new Date(userEntry.last_login_at).getTime();
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

const isDateInRange = (value, fromDate, toDate) => {
  if (!value) return false;
  const d = new Date(value);
  return d >= fromDate && d <= toDate;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildGitHubHeaders = (token, accept = 'application/vnd.github.v3+json') => {
  const headers = { Accept: accept };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const buildExpiredCookie = (name) => `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;

const getDefaultContributionWindow = (referenceDate = new Date()) => {
  const toDate = new Date(referenceDate);
  const fromDate = new Date(toDate);
  fromDate.setFullYear(toDate.getFullYear() - 1);
  return { fromDate, toDate };
};

const getDatabase = async () => {
  try {
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

const getRedemptionEntries = async () => {
  try {
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
    total_contributions: entry.total_contributions,
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
  const userResponse = await fetch('https://api.github.com/user', {
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
    const targetUserRes = await fetch(`https://api.github.com/users/${targetLogin}`, {
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
    const res = await fetch(`https://api.github.com/search/repositories?q=topic:iflytek-astron&per_page=100&page=${page}`, {
      headers: authHeaders,
    });
    if (!res.ok) return { items: [], hasNext: false };
    const data = await res.json();
    return { items: data.items.map((repo) => repo.full_name), hasNext: hasNextPage(res.headers.get('link')) };
  });

  const baseTargetRepos = Array.from(new Set([...topicRepos, 'iflytek/astron-agent', 'iflytek/astron-rpa', 'iflytek/skillhub']));
  const targetRepoAliases = {
    'iflytek/astron-agent': ['iflytek/astron-agent', 'FenjuFu/astron-agent'],
    'iflytek/astron-rpa': ['iflytek/astron-rpa', 'FenjuFu/astron-rpa'],
    'iflytek/skillhub': ['iflytek/skillhub']
  };
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
    let res = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100`, {
      headers: authHeaders,
    });
    if (res.status === 403 || res.status === 429) {
      await delay(2000);
      res = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100`, {
        headers: authHeaders,
      });
    }
    if (!res.ok) {
      const errText = await res.text();
      console.error(`Search failed for ${q}: ${res.status} ${errText}`);
      return { total_count: 0, items: [] };
    }
    return res.json();
  };

  const promises = [];
  baseTargetRepos.forEach((repo) => {
    (targetRepoAliases[repo] || [repo]).forEach((alias) => {
      promises.push(search(`repo:${alias} type:pr author:${targetLogin} created:${fromStr}..${toStr}`).then((data) => {
        repoStats[repo].pr_created.total_count += data.total_count;
        repoStats[repo].pr_created.items.push(...data.items);
        data.items.forEach((item) => pushDate(contributionDatesByRepo[repo], 'pr_creation_date_list', item.created_at));
      }));
      promises.push(search(`repo:${alias} type:pr author:${targetLogin} is:merged merged:${fromStr}..${toStr}`).then((data) => {
        repoStats[repo].pr_merged.total_count += data.total_count;
        repoStats[repo].pr_merged.items.push(...data.items);
        data.items.forEach((item) => pushDate(contributionDatesByRepo[repo], 'pr_merged_date_list', item.closed_at));
      }));
      promises.push(search(`repo:${alias} type:issue author:${targetLogin} created:${fromStr}..${toStr}`).then((data) => {
        repoStats[repo].issues_created.total_count += data.total_count;
        repoStats[repo].issues_created.items.push(...data.items);
        data.items.forEach((item) => pushDate(contributionDatesByRepo[repo], 'issue_creation_date_list', item.created_at));
      }));
      promises.push(search(`repo:${alias} type:issue commenter:${targetLogin} updated:${fromStr}..${toStr}`).then((data) => {
        data.items.forEach((item) => pushDate(contributionDatesByRepo[repo], 'issue_comments_date_list', item.updated_at));
      }));
      promises.push(search(`repo:${alias} type:pr commenter:${targetLogin} updated:${fromStr}..${toStr}`).then((data) => {
        data.items.forEach((item) => pushDate(contributionDatesByRepo[repo], 'pr_comments_date_list', item.updated_at));
      }));
    });
  });

  promises.push((async () => {
    const starred = await fetchAllPages(async (page) => {
      const res = await fetch(`https://api.github.com/users/${targetLogin}/starred?sort=created&direction=desc&per_page=100&page=${page}`, {
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
      const res = await fetch(`https://api.github.com/users/${targetLogin}/repos?type=owner&sort=created&direction=desc&per_page=100&page=${page}`, {
        headers: authHeaders,
      });
      return { items: await res.json(), hasNext: hasNextPage(res.headers.get('link')) };
    });
    const forks = userRepos.filter((repo) => repo.fork);
    await Promise.all(forks.map(async (repo) => {
      const res = await fetch(repo.url, { headers: authHeaders });
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
        const res = await fetch(
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

  await Promise.all(promises);
  Object.values(contributionDatesByRepo).forEach((repo) => {
    Object.keys(repo).forEach((key) => {
      repo[key] = [...new Set(repo[key])].sort();
    });
  });

  const storedUser = await safeDatabaseRead(
    db,
    'Loading stored GitHub user profile',
    () => db.collection('users').findOne({ github_username: targetLogin }),
    null
  );
  const astronStats = storedUser?.contributions || { agent: { workflows: 0, runs: 0 }, rpa: { tasks: 0, hoursSaved: 0 } };
  const searchTrackedKeys = new Set(['pr_creation_date_list', 'pr_merged_date_list', 'issue_creation_date_list']);
  const searchBasedTotal = Object.values(repoStats).reduce((sum, stats) => {
    return sum + stats.pr_created.total_count + stats.pr_merged.total_count + stats.issues_created.total_count;
  }, 0);
  const otherBehaviorsTotal = Object.values(contributionDatesByRepo).reduce((total, repoDates) => {
    return total + Object.entries(repoDates).reduce((repoTotal, [key, dates]) => {
      return searchTrackedKeys.has(key) ? repoTotal : repoTotal + dates.length;
    }, 0);
  }, 0);
  const totalContributions = searchBasedTotal + otherBehaviorsTotal + (astronStats.agent?.workflows || 0) + (astronStats.rpa?.tasks || 0);
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
  const protocol = request.headers['x-forwarded-proto'] || 'http';
  const host = request.headers.host;
  const redirectUri = process.env.VITE_GITHUB_REDIRECT_URI || `${protocol}://${host}/api/github/callback`;

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
  const protocol = request.headers['x-forwarded-proto'] || 'http';
  const host = request.headers.host;
  const redirectUri = process.env.VITE_GITHUB_REDIRECT_URI || `${protocol}://${host}/api/github/callback`;

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
      const client = await clientPromise;
      const db = client.db('astron_workflow');
      await upsertGitHubUserProfile(db, userData, {
        oauth_token: tokenData.access_token,
        last_login_at: new Date(),
      });
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
    clientPromise
      .then((c) => c.db('astron_workflow'))
      .then((db) =>
        upsertGitHubUserProfile(db, userData, {
          oauth_token: token,
          last_login_at: new Date(),
        })
      )
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
  let login = request.query.login;
  const adminPassword = process.env.VITE_ADMIN_PASSWORD;
  const authHeader = request.headers['x-admin-password'];
  const isAdmin = adminPassword && authHeader === adminPassword;

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

  if (!effectiveToken) {
    if (login && isAdmin) {
      const cachedSnapshot = buildCachedContributionResponse(await safeDatabaseRead(
        db,
        'Loading cached contribution snapshot',
        () => db.collection('contribution_cache').findOne({ github_username: login }),
        null
      ));

      if (cachedSnapshot) {
        response.setHeader('Cache-Control', 'no-store');
        return response.status(200).json(cachedSnapshot);
      }

      return response.status(404).json({ error: 'No saved contribution data for this user' });
    }

    return response.status(401).json({ error: 'Unauthorized' });
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
    if (login && isAdmin) {
      const cachedSnapshot = buildCachedContributionResponse(await safeDatabaseRead(
        db,
        'Loading cached contribution snapshot',
        () => db.collection('contribution_cache').findOne({ github_username: login }),
        null
      ));

      if (cachedSnapshot) {
        response.setHeader('Cache-Control', 'no-store');
        return response.status(200).json(cachedSnapshot);
      }
    }

    response.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch contributions' });
  }
}

async function handleLeaderboard(request, response) {
  try {
    const db = await getDatabase();
    const [cached, users, redemptions] = await Promise.all([
      safeDatabaseRead(
        db,
        'Loading contribution cache',
        () => db.collection('contribution_cache').find({}).toArray(),
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

    const redeemedLogins = Array.from(
      new Set(
        redemptions
          .map((redemption) => normalizeGitHubLogin(redemption.github_login))
          .filter(Boolean)
      )
    );

    if (redeemedLogins.length === 0) {
      response.setHeader('Cache-Control', 'no-store');
      return response.status(200).json([]);
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

    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    const refreshCandidates = redeemedLogins.filter((login) => {
      const cachedEntry = cachedByLogin.get(login);
      const user = usersByLogin.get(login);
      return !!user?.oauth_token && !hasFreshLeaderboardCache(cachedEntry, user);
    });

    const refreshedEntries = await Promise.allSettled(
      refreshCandidates.map(async (login) => {
        const user = usersByLogin.get(login);
        const snapshot = await fetchContributionSnapshot({
          token: user.oauth_token,
          login: user.github_username,
          fromDate: oneYearAgo,
          toDate: now,
        });

        return {
          login: snapshot.user.login,
          name: snapshot.user.name || snapshot.user.login,
          avatar_url: snapshot.user.avatar_url,
          total_contributions: snapshot.total_contributions,
          repo_summary: snapshot.repo_summary,
          updated_at: snapshot.updated_at,
        };
      })
    );

    const entriesByLogin = new Map();
    for (const login of redeemedLogins) {
      upsertLeaderboardEntry(entriesByLogin, {
        login,
      });
    }

    for (const login of redeemedLogins) {
      const user = usersByLogin.get(login);
      if (!user) continue;
      upsertLeaderboardEntry(entriesByLogin, {
        login: user.github_username,
        name: user.name,
        avatar_url: user.avatar_url,
        updated_at: user.updated_at || user.last_login_at,
      });
    }

    for (const login of redeemedLogins) {
      const entry = cachedByLogin.get(login);
      if (!entry || !hasFreshLeaderboardCache(entry, usersByLogin.get(login))) continue;
      upsertLeaderboardEntry(entriesByLogin, {
        login: entry.github_username,
        name: entry.name,
        avatar_url: entry.avatar_url,
        total_contributions: entry.total_contributions,
        repo_summary: entry.repo_summary,
        updated_at: entry.updated_at,
      });
    }

    for (const result of refreshedEntries) {
      if (result.status !== 'fulfilled') {
        console.error('Leaderboard refresh skipped', result.reason);
        continue;
      }

      upsertLeaderboardEntry(entriesByLogin, result.value);
    }

    const leaderboard = Array.from(entriesByLogin.values())
      .filter(hasLeaderboardActivity)
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

    // Return only redeemed users with verified contribution totals.
    response.setHeader('Cache-Control', 'no-store');
    response.status(200).json(leaderboard);
  } catch (e) {
    console.error('Leaderboard error', e);
    response.status(500).json({ error: 'Failed to load leaderboard' });
  }
}
