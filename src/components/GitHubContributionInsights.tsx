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
}> = ({ username, repo, categories, onClose }) => {
  const [activeTab, setActiveTab] = useState(categories.find(c => c.count > 0)?.id || categories[0].id);
  const activeCategory = categories.find(c => c.id === activeTab);

  return (
    <div className="absolute z-50 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
      <div className="p-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
            {username[0]?.toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{username} 领域画像详情</h4>
            <p className="text-xs text-gray-500">{repo}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <ShieldCheck className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex h-64">
        {/* Sidebar Tabs */}
        <div className="w-1/3 bg-gray-50 border-r border-gray-100">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`w-full p-3 text-left flex items-center justify-between transition-colors ${
                activeTab === cat.id ? 'bg-white text-indigo-600 border-r-2 border-indigo-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: cat.color }} />
                <span className="text-xs font-medium">{cat.label}</span>
              </div>
              <span className="text-xs text-gray-400">{cat.count}</span>
            </button>
          ))}
        </div>
        
        {/* Content Area */}
        <div className="w-2/3 p-4 overflow-y-auto">
          {activeCategory?.items.length ? (
            <div className="space-y-3">
              {activeCategory.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium text-gray-900">{item.count}</span>
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

      const graphqlQuery = {
        query: `
          query ContributionSummary {
            viewer {
              login
              contributionsCollection {
                commitContributionsByRepository(maxRepositories: 100) {
                  repository { nameWithOwner }
                  contributions(first: 1) { totalCount }
                }
                pullRequestContributions(first: 100) {
                  nodes {
                    pullRequest {
                      repository { nameWithOwner }
                      createdAt
                      comments { totalCount }
                      reviews { totalCount }
                      timelineItems(first: 50, itemTypes: [LABELED_EVENT, UNLABELED_EVENT, CLOSED_EVENT, REOPENED_EVENT, MERGED_EVENT, ASSIGNED_EVENT, UNASSIGNED_EVENT]) {
                        totalCount
                        nodes {
                          __typename
                        }
                      }
                    }
                  }
                }
                issueContributions(first: 100) {
                  nodes {
                    issue {
                      repository { nameWithOwner }
                      createdAt
                      comments { totalCount }
                      timelineItems(first: 50, itemTypes: [LABELED_EVENT, UNLABELED_EVENT, CLOSED_EVENT, REOPENED_EVENT, ASSIGNED_EVENT, UNASSIGNED_EVENT, MILESTONED_EVENT, DEMILESTONED_EVENT]) {
                        totalCount
                        nodes {
                          __typename
                        }
                      }
                    }
                  }
                }
                pullRequestReviewContributions(first: 100) {
                  nodes {
                    pullRequestReview {
                      repository { nameWithOwner }
                      state
                    }
                  }
                }
              }
              starredRepositories(first: 100) {
                nodes {
                  nameWithOwner
                }
              }
            }
          }
        `
      };

      try {
        setLoading(true);
        const response = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(graphqlQuery)
        });

        if (!response.ok) {
          throw new Error('Failed to query contributions');
        }

        const payload = await response.json();
        if (payload.errors) {
          throw new Error('GraphQL errors');
        }

        const nextStats = createEmptyStats();
        const viewer = payload.data.viewer;
        const collection = viewer.contributionsCollection;

        // Helper to add item to category
        const addItem = (repoName: string, category: keyof ContributionStats[typeof TARGET_REPOSITORIES[number]]['categories'], label: string, count: number) => {
          if (repoName in nextStats) {
            const cat = nextStats[repoName as keyof typeof nextStats].categories[category];
            const existing = cat.items.find(i => i.label === label);
            if (existing) {
              existing.count += count;
            } else {
              cat.items.push({ label, count });
            }
            cat.count += count;
            nextStats[repoName as keyof typeof nextStats].total += count;
          }
        };

        // Process Commits (Code)
        collection.commitContributionsByRepository.forEach((item: any) => {
          addItem(item.repository.nameWithOwner, 'code', '代码提交 (Commits)', item.contributions.totalCount);
        });

        // Process Pull Requests (Code & Code Admin)
        collection.pullRequestContributions.nodes.forEach((node: any) => {
          const pr = node.pullRequest;
          const repo = pr.repository.nameWithOwner;
          addItem(repo, 'code', 'PR 创建', 1);
          if (pr.comments.totalCount > 0) {
            addItem(repo, 'code', 'PR 评论', pr.comments.totalCount);
          }

          // Admin events
          pr.timelineItems.nodes.forEach((event: any) => {
            const type = event.__typename;
            if (type === 'MergedEvent') addItem(repo, 'codeAdmin', 'PR 合并', 1);
            else if (type === 'ClosedEvent') addItem(repo, 'codeAdmin', 'PR 关闭', 1);
            else if (type === 'LabeledEvent') addItem(repo, 'codeAdmin', 'PR 标签操作', 1);
            else if (type === 'AssignedEvent') addItem(repo, 'codeAdmin', 'PR 指派', 1);
          });
        });

        // Process Issues (Issue & Issue Admin)
        collection.issueContributions.nodes.forEach((node: any) => {
          const issue = node.issue;
          const repo = issue.repository.nameWithOwner;
          addItem(repo, 'issue', 'Issue 创建', 1);
          if (issue.comments.totalCount > 0) {
            addItem(repo, 'issue', 'Issue 评论', issue.comments.totalCount);
          }

          // Admin events
          issue.timelineItems.nodes.forEach((event: any) => {
            const type = event.__typename;
            if (type === 'ClosedEvent') addItem(repo, 'issueAdmin', 'Issue 关闭', 1);
            else if (type === 'LabeledEvent') addItem(repo, 'issueAdmin', 'Issue 标签操作', 1);
            else if (type === 'AssignedEvent') addItem(repo, 'issueAdmin', 'Issue 指派', 1);
            else if (type === 'MilestonedEvent') addItem(repo, 'issueAdmin', '里程碑操作', 1);
          });
        });

        // Process Reviews (Code Admin)
        collection.pullRequestReviewContributions.nodes.forEach((node: any) => {
          const repo = node.pullRequestReview.repository.nameWithOwner;
          addItem(repo, 'codeAdmin', 'PR 评审', 1);
        });

        // Process Stars (Observe) - Simplified
        viewer.starredRepositories.nodes.forEach((repoNode: any) => {
          if (TARGET_REPOSITORIES.includes(repoNode.nameWithOwner)) {
            addItem(repoNode.nameWithOwner, 'observe', 'Star', 1);
          }
        });

        setUsername(viewer.login);
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
                      <td className="py-6 px-2 relative">
                        <div className="flex flex-col gap-2">
                          <StackedBar categories={categories} total={repoStats.total} />
                        </div>
                        
                        {activePopup === repo && (
                          <ContributionDetailsPopup 
                            username={username}
                            repo={repo}
                            categories={categories}
                            onClose={() => setActivePopup(null)}
                          />
                        )}
                      </td>
                      <td className="py-6 px-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{repo.split('/')[1]}</span>
                          <button 
                            onClick={() => setActivePopup(activePopup === repo ? null : repo)}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </button>
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
