import React, { useEffect, useState } from 'react';
import { Github, LogOut, Loader2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const TARGET_REPOSITORIES = ['iflytek/astron-agent', 'iflytek/astron-rpa'] as const;
const OAUTH_STATE_KEY = 'github_oauth_state';
const ACCESS_TOKEN_KEY = 'github_access_token';

interface ContributionCategory {
  id: string;
  label: string;
  color: string;
  count: number;
  items: { label: string; count: number }[];
}

type ContributionStats = Record<(typeof TARGET_REPOSITORIES)[number], {
  total: number;
  categories: {
    observe: ContributionCategory;
    issue: ContributionCategory;
    code: ContributionCategory;
    issueAdmin: ContributionCategory;
    codeAdmin: ContributionCategory;
  };
}>;

const createEmptyCategory = (id: string, label: string, color: string): ContributionCategory => ({
  id,
  label,
  color,
  count: 0,
  items: []
});

const createEmptyStats = (): ContributionStats => {
  const stats: any = {};
  TARGET_REPOSITORIES.forEach(repo => {
    stats[repo] = {
      total: 0,
      categories: {
        observe: createEmptyCategory('observe', 'Observe', '#9ca3af'), // gray-400
        issue: createEmptyCategory('issue', 'Issue', '#eab308'), // yellow-500
        code: createEmptyCategory('code', 'Code', '#3b82f6'), // blue-500
        issueAdmin: createEmptyCategory('issueAdmin', 'Issue Admin', '#facc15'), // yellow-400
        codeAdmin: createEmptyCategory('codeAdmin', 'Code Admin', '#93c5fd'), // blue-300
      }
    };
  });
  return stats as ContributionStats;
};

const StackedBar: React.FC<{ categories: ContributionCategory[]; total: number }> = ({ categories, total }) => {
  if (total === 0) return <div className="h-2 w-full bg-gray-100 rounded-full" />;
  
  return (
    <div className="h-2 w-full flex rounded-full overflow-hidden bg-gray-100">
      {categories.map((cat) => (
        cat.count > 0 && (
          <div
            key={cat.id}
            style={{ 
              width: `${(cat.count / total) * 100}%`,
              backgroundColor: cat.color
            }}
            title={`${cat.label}: ${cat.count}`}
          />
        )
      ))}
    </div>
  );
};

const ContributionDetailsPopup: React.FC<{ 
  username: string; 
  repo: string; 
  categories: ContributionCategory[];
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}> = ({ username, repo, categories, onClose, onMouseEnter, onMouseLeave }) => {
  const [activeTab, setActiveTab] = useState(categories.find(c => c.count > 0)?.id || categories[0].id);
  const activeCategory = categories.find(c => c.id === activeTab);

  return (
    <div 
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute z-50 -top-2 left-0 w-[420px] bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200"
    >
      <div className="p-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
            <img 
              src={`https://github.com/${username}.png`} 
              alt={username}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${username}&background=dbeafe&color=2563eb`;
              }}
            />
          </div>
          <h4 className="font-bold text-gray-900 text-sm">{username} 领域画像详情</h4>
        </div>
      </div>
      
      <div className="flex h-72">
        {/* Sidebar Tabs */}
        <div className="w-[140px] bg-gray-50/50 border-r border-gray-100">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onMouseEnter={() => setActiveTab(cat.id)}
              className={`w-full p-3 text-left flex items-center justify-between transition-colors border-b border-gray-100/50 last:border-0 ${
                activeTab === cat.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: cat.color }} />
                <span className="text-[11px] font-bold uppercase tracking-tight">{cat.label}</span>
              </div>
              <span className="text-[11px] text-gray-400 font-medium">{cat.count}</span>
            </button>
          ))}
        </div>
        
        {/* Content Area */}
        <div className="flex-1 p-5 overflow-y-auto bg-white">
          {activeCategory?.items.length ? (
            <div className="space-y-4">
              {activeCategory.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-[13px]">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="font-semibold text-gray-400">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-xs italic">
              暂无数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GitHubContributionInsights: React.FC = () => {
  const { t } = useLanguage();
  const [token, setToken] = useState<string>(() => localStorage.getItem(ACCESS_TOKEN_KEY) ?? '');
  const [username, setUsername] = useState('');
  const [stats, setStats] = useState<ContributionStats>(createEmptyStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (repo: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActivePopup(repo);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActivePopup(null);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID as string | undefined;

  const handleLogin = () => {
    if (!clientId) return;

    const state = crypto.randomUUID();
    sessionStorage.setItem(OAUTH_STATE_KEY, state);

    const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI || `${window.location.origin}${window.location.pathname}`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'read:user',
      state
    });

    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
  };

  useEffect(() => {
    const exchangeOAuthCode = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY);

      if (!code) {
        return;
      }

      // Always clear the URL parameters immediately to prevent issues with re-runs/refreshes
      const cleanParams = new URLSearchParams(window.location.search);
      cleanParams.delete('code');
      cleanParams.delete('state');
      const cleanQuery = cleanParams.toString();
      const cleanUrl = `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ''}`;
      window.history.replaceState({}, '', cleanUrl);

      // If we already have a token, don't attempt exchange again even if code is present in URL
      if (localStorage.getItem(ACCESS_TOKEN_KEY)) {
        return;
      }

      if (!state || !expectedState || expectedState !== state) {
        // If state is missing but code is present, it might be a refresh after success/error.
        // We only show the error if we don't have a token.
        setError(t('contribute.github.errors.state'));
        sessionStorage.removeItem(OAUTH_STATE_KEY);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/github/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to exchange code');
        }

        if (!data.access_token) {
          throw new Error('Missing access token');
        }

        localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
        setToken(data.access_token);
        setError('');
        sessionStorage.removeItem(OAUTH_STATE_KEY);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('contribute.github.errors.exchange'));
      } finally {
        setLoading(false);
      }
    };

    void exchangeOAuthCode();
  }, [t]);

  useEffect(() => {
    const fetchContributions = async () => {
      if (!token) {
        return;
      }

      try {
        setLoading(true);
        
        // 1. Get viewer info and joined date
        const userResponse = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: '{ viewer { login createdAt } }' })
        });
        const userData = await userResponse.json();
        const viewer = userData.data.viewer;
        const username = viewer.login;
        setUsername(username);

        const nextStats = createEmptyStats();

        // Helper to add item to category
        const addItem = (repoName: string, category: keyof ContributionStats[typeof TARGET_REPOSITORIES[number]]['categories'], label: string, count: number) => {
          if (repoName in nextStats) {
            const repoKey = repoName as keyof typeof nextStats;
            const cat = nextStats[repoKey].categories[category];
            const existing = cat.items.find(i => i.label === label);
            if (existing) {
              existing.count += count;
            } else {
              cat.items.push({ label, count });
            }
            cat.count += count;
            nextStats[repoKey].total += count;
          }
        };

        // 2. Search for all involved issues/PRs in target repos (all time)
        for (const repo of TARGET_REPOSITORIES) {
          const searchQuery = `repo:${repo} involves:${username}`;
          const graphqlQuery = {
            query: `
              query ($query: String!) {
                search(query: $query, type: ISSUE, first: 100) {
                  nodes {
                    __typename
                    ... on Issue {
                      author { login }
                      comments(author: "${username}") { totalCount }
                      timelineItems(first: 50) {
                        nodes {
                          __typename
                          ... on LabeledEvent { actor { login } }
                          ... on UnlabeledEvent { actor { login } }
                          ... on ClosedEvent { actor { login } }
                          ... on ReopenedEvent { actor { login } }
                          ... on AssignedEvent { actor { login } }
                          ... on UnassignedEvent { actor { login } }
                          ... on MilestonedEvent { actor { login } }
                          ... on DemilestonedEvent { actor { login } }
                        }
                      }
                    }
                    ... on PullRequest {
                      author { login }
                      comments(author: "${username}") { totalCount }
                      reviews(author: "${username}") { totalCount }
                      mergedBy { login }
                      timelineItems(first: 50) {
                        nodes {
                          __typename
                          ... on LabeledEvent { actor { login } }
                          ... on UnlabeledEvent { actor { login } }
                          ... on ClosedEvent { actor { login } }
                          ... on ReopenedEvent { actor { login } }
                          ... on MergedEvent { actor { login } }
                          ... on AssignedEvent { actor { login } }
                          ... on UnassignedEvent { actor { login } }
                        }
                      }
                    }
                  }
                }
                repository(owner: "${repo.split('/')[0]}", name: "${repo.split('/')[1]}") {
                  stargazers {
                    nodes { login }
                  }
                  forks(affiliations: OWNER) {
                    totalCount
                    nodes {
                      owner { login }
                    }
                  }
                }
              }
            `,
            variables: { query: searchQuery }
          };

          const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(graphqlQuery)
          });

          const payload = await response.json();
          if (payload.errors) continue;

          const searchNodes = payload.data.search.nodes;
          const repoData = payload.data.repository;

          // Process Stars & Forks (Observe)
          // Note: GitHub API doesn't easily show if *you* starred via search without more params, 
          // but we can check the repo stargazers if needed or just use viewer.starredRepositories
          // For now, let's keep it simple:
          if (repoData.forks.nodes.some((f: any) => f.owner.login === username)) {
            addItem(repo, 'observe', 'Fork 仓库', 1);
          }

          searchNodes.forEach((node: any) => {
            const isPR = node.__typename === 'PullRequest';
            const isAuthor = node.author?.login === username;

            if (isPR) {
              // Code
              if (isAuthor) addItem(repo, 'code', 'PR 创建', 1);
              if (node.comments.totalCount > 0) addItem(repo, 'code', 'PR 评论', node.comments.totalCount);
              
              // Code Admin
              if (node.reviews.totalCount > 0) addItem(repo, 'codeAdmin', 'PR 评审', node.reviews.totalCount);
              if (node.mergedBy?.login === username) addItem(repo, 'codeAdmin', 'PR 合并', 1);

              node.timelineItems.nodes.forEach((event: any) => {
                if (event.actor?.login !== username) return;
                const type = event.__typename;
                if (type === 'LabeledEvent') addItem(repo, 'codeAdmin', 'PR 标签操作', 1);
                if (type === 'UnlabeledEvent') addItem(repo, 'codeAdmin', 'PR 移除标签', 1);
                if (type === 'ClosedEvent') addItem(repo, 'codeAdmin', 'PR 关闭', 1);
                if (type === 'ReopenedEvent') addItem(repo, 'codeAdmin', 'PR 重开', 1);
                if (type === 'AssignedEvent') addItem(repo, 'codeAdmin', 'PR 指派', 1);
              });
            } else {
              // Issue
              if (isAuthor) addItem(repo, 'issue', 'Issue 创建', 1);
              if (node.comments.totalCount > 0) addItem(repo, 'issue', 'Issue 评论', node.comments.totalCount);

              // Issue Admin
              node.timelineItems.nodes.forEach((event: any) => {
                if (event.actor?.login !== username) return;
                const type = event.__typename;
                if (type === 'ClosedEvent') addItem(repo, 'issueAdmin', 'Issue 关闭', 1);
                if (type === 'LabeledEvent') addItem(repo, 'issueAdmin', 'Issue 标签操作', 1);
                if (type === 'AssignedEvent') addItem(repo, 'issueAdmin', 'Issue 指派', 1);
                if (type === 'MilestonedEvent') addItem(repo, 'issueAdmin', '里程碑操作', 1);
              });
            }
          });
        }

        // 3. Get Commits & Stars (Separate query as it's easier to get all-time this way)
        const finalQuery = {
          query: `
            query {
              viewer {
                starredRepositories(first: 100) {
                  nodes { nameWithOwner }
                }
                contributionsCollection {
                  commitContributionsByRepository(maxRepositories: 100) {
                    repository { nameWithOwner }
                    contributions(first: 1) { totalCount }
                  }
                }
              }
            }
          `
        };
        const finalResponse = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(finalQuery)
        });
        const finalData = await finalResponse.json();
        
        // Stars
        finalData.data.viewer.starredRepositories.nodes.forEach((repoNode: any) => {
          if (TARGET_REPOSITORIES.includes(repoNode.nameWithOwner as any)) {
            addItem(repoNode.nameWithOwner, 'observe', 'Star 项目', 1);
          }
        });

        // Commits (Current year - for full history we'd need to loop years, but this is a start)
        finalData.data.viewer.contributionsCollection.commitContributionsByRepository.forEach((item: any) => {
          addItem(item.repository.nameWithOwner, 'code', '代码提交 (Commits)', item.contributions.totalCount);
        });

        setStats(nextStats);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : t('contribute.github.errors.load'));
      } finally {
        setLoading(false);
      }
    };

    void fetchContributions();
  }, [t, token]);

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setToken('');
    setUsername('');
    setStats(createEmptyStats());
    setError('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-indigo-100">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('contribute.github.title')}</h3>
          <p className="text-gray-600">{t('contribute.github.subtitle')}</p>
        </div>
        <ShieldCheck className="h-8 w-8 text-indigo-600 flex-shrink-0" />
      </div>

      {!clientId && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
          {t('contribute.github.errors.missingClientId')}
        </p>
      )}

      {!token ? (
        <button
          onClick={handleLogin}
          disabled={!clientId}
          className="inline-flex items-center px-5 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors duration-200 disabled:pointer-events-none disabled:opacity-60"
        >
          <Github className="h-5 w-5 mr-2" />
          {t('contribute.github.login')}
        </button>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              {t('contribute.github.loggedInAs')} <span className="font-semibold text-gray-900">{username}</span>
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('contribute.github.logout')}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-4 px-2 text-sm font-semibold text-gray-900 w-1/2">{t('contribute.github.table.profile')}</th>
                  <th className="py-4 px-2 text-sm font-semibold text-gray-900">{t('contribute.github.table.org')}</th>
                  <th className="py-4 px-2 text-sm font-semibold text-gray-900 text-right">{t('contribute.github.table.count')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {TARGET_REPOSITORIES.map((repo) => {
                  const repoStats = stats[repo];
                  const categories = Object.values(repoStats.categories);
                  
                  return (
                    <tr key={repo} className="group hover:bg-gray-50/50 transition-colors">
                      <td 
                        className="py-6 px-2 relative"
                        onMouseEnter={() => handleMouseEnter(repo)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="flex flex-col gap-2">
                          <StackedBar categories={categories} total={repoStats.total} />
                        </div>
                        
                        {activePopup === repo && (
                          <ContributionDetailsPopup 
                            username={username}
                            repo={repo}
                            categories={categories}
                            onClose={() => setActivePopup(null)}
                            onMouseEnter={() => handleMouseEnter(repo)}
                            onMouseLeave={handleMouseLeave}
                          />
                        )}
                      </td>
                      <td className="py-6 px-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{repo.split('/')[1]}</span>
                          <div className="p-1 text-indigo-600 opacity-40">
                            <ShieldCheck className="h-4 w-4" />
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-2 text-right">
                        <span className="text-sm font-semibold text-gray-900">{repoStats.total}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center mt-4 text-indigo-600 text-sm">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {t('contribute.github.loading')}
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default GitHubContributionInsights;
