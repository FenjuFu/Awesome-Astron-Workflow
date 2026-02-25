import React, { useEffect, useMemo, useState } from 'react';
import { Github, LogOut, Loader2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const TARGET_REPOSITORIES = ['iflytek/astron-agent', 'iflytek/astron-rpa'] as const;
const OAUTH_STATE_KEY = 'github_oauth_state';
const ACCESS_TOKEN_KEY = 'github_access_token';

type ContributionStats = Record<(typeof TARGET_REPOSITORIES)[number], {
  commits: number;
  pullRequests: number;
  issues: number;
  reviews: number;
}>;

const createEmptyStats = (): ContributionStats => ({
  'iflytek/astron-agent': { commits: 0, pullRequests: 0, issues: 0, reviews: 0 },
  'iflytek/astron-rpa': { commits: 0, pullRequests: 0, issues: 0, reviews: 0 }
});

const GitHubContributionInsights: React.FC = () => {
  const { t } = useLanguage();
  const [token, setToken] = useState<string>(() => localStorage.getItem(ACCESS_TOKEN_KEY) ?? '');
  const [username, setUsername] = useState('');
  const [stats, setStats] = useState<ContributionStats>(createEmptyStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID as string | undefined;

  const authorizeUrl = useMemo(() => {
    if (!clientId) {
      return '';
    }

    const state = crypto.randomUUID();
    sessionStorage.setItem(OAUTH_STATE_KEY, state);

    const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI || `${window.location.origin}${window.location.pathname}`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'read:user',
      state
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }, [clientId]);

  useEffect(() => {
    const exchangeOAuthCode = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY);

      if (!code) {
        return;
      }

      if (!state || !expectedState || expectedState !== state) {
        setError(t('contribute.github.errors.state'));
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/github/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });

        if (!response.ok) {
          throw new Error('Failed to exchange code');
        }

        const data = await response.json();
        if (!data.access_token) {
          throw new Error('Missing access token');
        }

        localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
        setToken(data.access_token);
        setError('');

        params.delete('code');
        params.delete('state');
        const cleanQuery = params.toString();
        const cleanUrl = `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ''}`;
        window.history.replaceState({}, '', cleanUrl);
      } catch {
        setError(t('contribute.github.errors.exchange'));
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
                    }
                  }
                }
                issueContributions(first: 100) {
                  nodes {
                    issue {
                      repository { nameWithOwner }
                    }
                  }
                }
                pullRequestReviewContributions(first: 100) {
                  nodes {
                    pullRequestReview {
                      repository { nameWithOwner }
                    }
                  }
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
        const collection = payload.data.viewer.contributionsCollection;

        collection.commitContributionsByRepository.forEach((item: { repository: { nameWithOwner: string }; contributions: { totalCount: number } }) => {
          const repoName = item.repository.nameWithOwner as (typeof TARGET_REPOSITORIES)[number];
          if (repoName in nextStats) {
            nextStats[repoName].commits = item.contributions.totalCount;
          }
        });

        collection.pullRequestContributions.nodes.forEach((item: { pullRequest: { repository: { nameWithOwner: string } } }) => {
          const repoName = item.pullRequest.repository.nameWithOwner as (typeof TARGET_REPOSITORIES)[number];
          if (repoName in nextStats) {
            nextStats[repoName].pullRequests += 1;
          }
        });

        collection.issueContributions.nodes.forEach((item: { issue: { repository: { nameWithOwner: string } } }) => {
          const repoName = item.issue.repository.nameWithOwner as (typeof TARGET_REPOSITORIES)[number];
          if (repoName in nextStats) {
            nextStats[repoName].issues += 1;
          }
        });

        collection.pullRequestReviewContributions.nodes.forEach((item: { pullRequestReview: { repository: { nameWithOwner: string } } }) => {
          const repoName = item.pullRequestReview.repository.nameWithOwner as (typeof TARGET_REPOSITORIES)[number];
          if (repoName in nextStats) {
            nextStats[repoName].reviews += 1;
          }
        });

        setUsername(payload.data.viewer.login);
        setStats(nextStats);
        setError('');
      } catch {
        setError(t('contribute.github.errors.load'));
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
        <a
          href={authorizeUrl || '#'}
          className="inline-flex items-center px-5 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors duration-200 disabled:pointer-events-none disabled:opacity-60"
        >
          <Github className="h-5 w-5 mr-2" />
          {t('contribute.github.login')}
        </a>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TARGET_REPOSITORIES.map((repo) => (
              <div key={repo} className="rounded-lg border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-900 mb-3">{repo}</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>{t('contribute.github.stats.commits')}: {stats[repo].commits}</li>
                  <li>{t('contribute.github.stats.pullRequests')}: {stats[repo].pullRequests}</li>
                  <li>{t('contribute.github.stats.issues')}: {stats[repo].issues}</li>
                  <li>{t('contribute.github.stats.reviews')}: {stats[repo].reviews}</li>
                </ul>
              </div>
            ))}
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
