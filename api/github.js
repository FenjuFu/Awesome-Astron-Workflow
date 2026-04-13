import cookie from 'cookie';
import crypto from 'crypto';
import clientPromise from './_lib/mongodb.js';

export default async function handler(req, res) {
  const action = req.query.action;

  try {
    switch (action) {
      case 'login':
        return await handleLogin(req, res);
      case 'callback':
        return await handleCallback(req, res);
      case 'token':
        return await handleToken(req, res);
      case 'contributions':
        return await handleContributions(req, res);
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
  const cookies = cookie.parse(request.headers.cookie || '');
  const token = cookies.gh_token;
  if (!token) return response.status(401).json({ error: 'Unauthorized' });

  const CONTRIBUTION_FIELDS = {
    observe: ['fork_date_list', 'star_date_list'],
    issue: ['issue_creation_date_list', 'issue_comments_date_list'],
    code: ['pr_creation_date_list', 'pr_comments_date_list', 'code_author_date_list', 'code_committer_date_list'],
    issue_admin: ['issue_labeled_date_list', 'issue_unlabeled_date_list', 'issue_closed_date_list', 'issue_reopened_date_list', 'issue_assigned_date_list', 'issue_unassigned_date_list', 'issue_milestoned_date_list', 'issue_demilestoned_date_list', 'issue_marked_as_duplicate_date_list', 'issue_transferred_date_list', 'issue_renamed_title_date_list', 'issue_change_description_date_list', 'issue_setting_priority_date_list', 'issue_change_priority_date_list', 'issue_link_pull_request_date_list', 'issue_unlink_pull_request_date_list', 'issue_assign_collaborator_date_list', 'issue_unassign_collaborator_date_list', 'issue_change_issue_state_date_list', 'issue_change_issue_type_date_list', 'issue_setting_branch_date_list', 'issue_change_branch_date_list'],
    code_admin: ['pr_labeled_date_list', 'pr_unlabeled_date_list', 'pr_closed_date_list', 'pr_assigned_date_list', 'pr_unassigned_date_list', 'pr_reopened_date_list', 'pr_milestoned_date_list', 'pr_demilestoned_date_list', 'pr_marked_as_duplicate_date_list', 'pr_transferred_date_list', 'pr_renamed_title_date_list', 'pr_change_description_date_list', 'pr_setting_priority_date_list', 'pr_change_priority_date_list', 'pr_merged_date_list', 'pr_review_date_list', 'pr_set_tester_date_list', 'pr_unset_tester_date_list', 'pr_check_pass_date_list', 'pr_test_pass_date_list', 'pr_reset_assign_result_date_list', 'pr_reset_test_result_date_list', 'pr_link_issue_date_list', 'pr_unlink_issue_date_list']
  };

  const DATE_FIELD_KEYS = Object.values(CONTRIBUTION_FIELDS).flat();
  const createEmptyContributionDates = () => DATE_FIELD_KEYS.reduce((acc, key) => { acc[key] = []; return acc; }, {});
  const pushDate = (target, key, value) => { if (value && target[key]) target[key].push(value); };
  const isDateInRange = (value, fromDate, toDate) => { if (!value) return false; const d = new Date(value); return d >= fromDate && d <= toDate; };

  const userResponse = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
  });
  if (!userResponse.ok) return response.status(userResponse.status).json({ error: 'Failed to fetch user' });
  const userData = await userResponse.json();
  const login = userData.login;

  const now = new Date();
  const oneYearAgo = new Date(); oneYearAgo.setFullYear(now.getFullYear() - 1);
  const fromDate = request.query.from ? new Date(request.query.from) : oneYearAgo;
  const toDate = request.query.to ? new Date(request.query.to) : now;
  const fromStr = fromDate.toISOString().split('T')[0];
  const toStr = toDate.toISOString().split('T')[0];

  const topicRepos = await fetchAllPages(async (page) => {
    const res = await fetch(`https://api.github.com/search/repositories?q=topic:iflytek-astron&per_page=100&page=${page}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
    });
    if (!res.ok) return { items: [], hasNext: false };
    const data = await res.json();
    return { items: data.items.map(r => r.full_name), hasNext: hasNextPage(res.headers.get('link')) };
  });

  const baseTargetRepos = Array.from(new Set([...topicRepos, 'iflytek/astron-agent', 'iflytek/astron-rpa', 'iflytek/skillhub']));
  const targetRepoAliases = { 'iflytek/astron-agent': ['iflytek/astron-agent', 'FenjuFu/astron-agent'], 'iflytek/astron-rpa': ['iflytek/astron-rpa', 'FenjuFu/astron-rpa'], 'iflytek/skillhub': ['iflytek/skillhub'] };
  const targetReposMap = baseTargetRepos.reduce((acc, repo) => { (targetRepoAliases[repo] || [repo]).forEach(alias => { acc[normalizeRepoFullName(alias)] = repo; }); return acc; }, {});
  const targetReposSet = new Set(Object.keys(targetReposMap));

  const repoStats = {};
  const contributionDatesByRepo = {};
  baseTargetRepos.forEach(repo => {
    repoStats[repo] = { pr_created: { total_count: 0, items: [] }, pr_merged: { total_count: 0, items: [] }, issues_created: { total_count: 0, items: [] } };
    contributionDatesByRepo[repo] = createEmptyContributionDates();
  });

  const search = async (q) => {
    const res = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
    });
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  };

  const promises = [];
  baseTargetRepos.forEach(repo => {
    (targetRepoAliases[repo] || [repo]).forEach(alias => {
      promises.push(search(`repo:${alias} type:pr author:${login} created:${fromStr}..${toStr}`).then(d => { repoStats[repo].pr_created.total_count += d.total_count; repoStats[repo].pr_created.items.push(...d.items); d.items.forEach(i => pushDate(contributionDatesByRepo[repo], 'pr_creation_date_list', i.created_at)); }));
      promises.push(search(`repo:${alias} type:pr author:${login} is:merged merged:${fromStr}..${toStr}`).then(d => { repoStats[repo].pr_merged.total_count += d.total_count; repoStats[repo].pr_merged.items.push(...d.items); d.items.forEach(i => pushDate(contributionDatesByRepo[repo], 'pr_merged_date_list', i.closed_at)); }));
      promises.push(search(`repo:${alias} type:issue author:${login} created:${fromStr}..${toStr}`).then(d => { repoStats[repo].issues_created.total_count += d.total_count; repoStats[repo].issues_created.items.push(...d.items); d.items.forEach(i => pushDate(contributionDatesByRepo[repo], 'issue_creation_date_list', i.created_at)); }));
      promises.push(search(`repo:${alias} type:issue commenter:${login} updated:${fromStr}..${toStr}`).then(d => d.items.forEach(i => pushDate(contributionDatesByRepo[repo], 'issue_comments_date_list', i.updated_at))));
      promises.push(search(`repo:${alias} type:pr commenter:${login} updated:${fromStr}..${toStr}`).then(d => d.items.forEach(i => pushDate(contributionDatesByRepo[repo], 'pr_comments_date_list', i.updated_at))));
    });
  });

  promises.push((async () => {
    const starred = await fetchAllPages(async (p) => {
      const r = await fetch(`https://api.github.com/user/starred?sort=created&direction=desc&per_page=100&page=${p}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3.star+json' } });
      return { items: await r.json(), hasNext: hasNextPage(r.headers.get('link')) };
    });
    starred.forEach(s => {
      const norm = normalizeRepoFullName(s.repo?.full_name);
      if (targetReposSet.has(norm) && isDateInRange(s.starred_at, fromDate, toDate)) pushDate(contributionDatesByRepo[targetReposMap[norm]], 'star_date_list', s.starred_at);
    });
  })());

  promises.push((async () => {
    const userRepos = await fetchAllPages(async (p) => {
      const r = await fetch(`https://api.github.com/user/repos?affiliation=owner&sort=created&direction=desc&per_page=100&page=${p}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } });
      return { items: await r.json(), hasNext: hasNextPage(r.headers.get('link')) };
    });
    const forks = userRepos.filter(r => r.fork);
    await Promise.all(forks.map(async (r) => {
      const res = await fetch(r.url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } });
      if (res.ok) {
        const full = await res.json();
        const up = normalizeRepoFullName(full.source?.full_name || full.parent?.full_name);
        if (targetReposSet.has(up) && isDateInRange(full.created_at, fromDate, toDate)) pushDate(contributionDatesByRepo[targetReposMap[up]], 'fork_date_list', full.created_at);
      }
    }));
  })());

  promises.push(...baseTargetRepos.map(repo => (async () => {
    await Promise.all((targetRepoAliases[repo] || [repo]).map(async alias => {
      const [o, n] = alias.split('/');
      const r = await fetch(`https://api.github.com/repos/${o}/${n}/commits?author=${login}&since=${fromDate.toISOString()}&until=${toDate.toISOString()}&per_page=100`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } });
      if (r.ok) (await r.json()).forEach(c => { pushDate(contributionDatesByRepo[repo], 'code_author_date_list', c.commit?.author?.date); pushDate(contributionDatesByRepo[repo], 'code_committer_date_list', c.commit?.committer?.date); });
    }));
  })()));

  await Promise.all(promises);
  Object.values(contributionDatesByRepo).forEach(repo => Object.keys(repo).forEach(k => repo[k] = [...new Set(repo[k])].sort()));

  let astronStats = { agent: { workflows: 0, runs: 0 }, rpa: { tasks: 0, hoursSaved: 0 } };
  try {
    const client = await clientPromise;
    const db = client.db('astron_workflow');
    const u = await db.collection('users').findOne({ github_username: login });
    if (u?.contributions) astronStats = u.contributions;
  } catch (e) { console.error('DB Error', e); }

  response.status(200).json({ user: { login: userData.login, name: userData.name, avatar_url: userData.avatar_url, html_url: userData.html_url }, range: { from: fromDate, to: toDate }, repos: repoStats, contribution_fields: CONTRIBUTION_FIELDS, contribution_dates: contributionDatesByRepo, astron: astronStats });
}
