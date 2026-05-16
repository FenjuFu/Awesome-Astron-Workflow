import React, { useCallback, useEffect, useState } from 'react';
import { Github, Loader2, ShieldCheck, LogOut, GitPullRequest, GitMerge, AlertCircle, Coins, Trophy, Medal } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import RedemptionSystem from './RedemptionSystem';

interface GitHubItem {
  html_url: string;
  title: string;
  created_at: string;
  number: number;
}

interface StatCategory {
  total_count: number;
  items: GitHubItem[];
}

interface RepoStats {
  pr_created: StatCategory;
  pr_merged: StatCategory;
  issues_created: StatCategory;
}

interface AstronStats {
  agent: {
    workflows: number;
    runs: number;
  };
  rpa: {
    tasks: number;
    hoursSaved: number;
  };
}

interface ContributionsData {
  user: {
    login: string;
    name: string;
    avatar_url: string;
  };
  range: {
    from: string;
    to: string;
  };
  repos: Record<string, RepoStats>;
  contribution_fields?: Record<string, string[]>;
  contribution_dates?: Record<string, Record<string, string[]>>;
  astron?: AstronStats;
  total_contributions?: number;
}

interface LeaderboardEntry {
  rank: number;
  login: string;
  name: string;
  avatar_url: string;
  total_contributions: number;
  repo_summary: Record<string, { pr_created: number; pr_merged: number; issues_created: number }>;
  updated_at: string;
}

const BEHAVIOR_LABELS: Record<string, string> = {
  fork_date_list: 'Fork 仓库',
  star_date_list: 'Star 仓库',
  issue_creation_date_list: '创建 Issue',
  issue_comments_date_list: '评论 Issue',
  pr_creation_date_list: '创建 PR',
  pr_comments_date_list: '评论 PR',
  code_author_date_list: '提交代码（作者）',
  code_committer_date_list: '提交代码（合并人）',
  issue_labeled_date_list: 'Issue 添加标签',
  issue_unlabeled_date_list: 'Issue 移除标签',
  issue_closed_date_list: 'Issue 关闭',
  issue_reopened_date_list: 'Issue 重开',
  issue_assigned_date_list: 'Issue 指派负责人',
  issue_unassigned_date_list: 'Issue 取消指派',
  issue_milestoned_date_list: 'Issue 添加里程碑',
  issue_demilestoned_date_list: 'Issue 移除里程碑',
  issue_marked_as_duplicate_date_list: 'Issue 标记重复',
  issue_transferred_date_list: 'Issue 转移',
  issue_renamed_title_date_list: 'Issue 修改标题',
  issue_change_description_date_list: 'Issue 修改描述',
  issue_setting_priority_date_list: 'Issue 设置优先级',
  issue_change_priority_date_list: 'Issue 修改优先级',
  issue_link_pull_request_date_list: 'Issue 关联 PR',
  issue_unlink_pull_request_date_list: 'Issue 取消关联 PR',
  issue_assign_collaborator_date_list: 'Issue 分配协作者',
  issue_unassign_collaborator_date_list: 'Issue 取消分配协作者',
  issue_change_issue_state_date_list: 'Issue 修改状态',
  issue_change_issue_type_date_list: 'Issue 修改类型',
  issue_setting_branch_date_list: 'Issue 设置分支',
  issue_change_branch_date_list: 'Issue 修改分支',
  pr_labeled_date_list: 'PR 添加标签',
  pr_unlabeled_date_list: 'PR 移除标签',
  pr_closed_date_list: 'PR 关闭',
  pr_assigned_date_list: 'PR 指派',
  pr_unassigned_date_list: 'PR 取消指派',
  pr_reopened_date_list: 'PR 重开',
  pr_milestoned_date_list: 'PR 添加里程碑',
  pr_demilestoned_date_list: 'PR 移除里程碑',
  pr_marked_as_duplicate_date_list: 'PR 标记重复',
  pr_transferred_date_list: 'PR 转移',
  pr_renamed_title_date_list: 'PR 修改标题',
  pr_change_description_date_list: 'PR 修改描述',
  pr_setting_priority_date_list: 'PR 设置优先级',
  pr_change_priority_date_list: 'PR 修改优先级',
  pr_merged_date_list: 'PR 合并',
  pr_review_date_list: 'PR Review',
  pr_set_tester_date_list: 'PR 设置测试人',
  pr_unset_tester_date_list: 'PR 取消测试人',
  pr_check_pass_date_list: 'PR CI 检查通过',
  pr_test_pass_date_list: 'PR 测试通过',
  pr_reset_assign_result_date_list: 'PR 重置指派结果',
  pr_reset_test_result_date_list: 'PR 重置测试结果',
  pr_link_issue_date_list: 'PR 关联 Issue',
  pr_unlink_issue_date_list: 'PR 取消关联 Issue'
};

const CATEGORY_LABELS: Record<string, string> = {
  observe: 'Observe（关注行为）',
  issue: 'Issue（问题协作）',
  code: 'Code（代码贡献）',
  issue_admin: 'Issue Admin（维护型）',
  code_admin: 'Code Admin（PR 管理）'
};

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 15000): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
};

const RANK_STYLES = [
  { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-400 text-white', icon: '🥇' },
  { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-400 text-white', icon: '🥈' },
  { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-400 text-white', icon: '🥉' },
];

const buildRepoSummaryFromStats = (repos: ContributionsData['repos'] = {}) =>
  Object.fromEntries(
    Object.entries(repos).map(([repoName, stats]) => [
      repoName,
      {
        pr_created: stats.pr_created.total_count,
        pr_merged: stats.pr_merged.total_count,
        issues_created: stats.issues_created.total_count,
      }
    ])
  );

const mergeCurrentUserIntoLeaderboard = (
  leaderboard: LeaderboardEntry[],
  currentUser: Omit<LeaderboardEntry, 'rank'> | null
): LeaderboardEntry[] => {
  const entries = currentUser
    ? [
        ...leaderboard.filter((entry) => entry.login !== currentUser.login),
        { rank: 0, ...currentUser }
      ]
    : leaderboard;

  return [...entries]
    .sort((a, b) => {
      if (b.total_contributions !== a.total_contributions) {
        return b.total_contributions - a.total_contributions;
      }
      return a.login.localeCompare(b.login);
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
};
const GitHubConnect: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ContributionsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'stats' | 'redeem'>('leaderboard');

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetchWithTimeout('/api/github/leaderboard', {}, 10000);
      if (res.ok) {
        setLeaderboard(await res.json());
      }
    } catch {
      // Leaderboard fetch failed silently - page still works
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetchWithTimeout('/api/github/contributions', {}, 45000);

      if (res.status === 401) {
        setAuthenticated(false);
        setData(null);
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setData(null);
        return;
      }

      const json = await res.json();
      setData(json);
      if (json) {
        setActiveTab('stats');
        fetchLeaderboard();
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('加载贡献数据超时，请稍后重试');
      } else {
        setError('加载贡献数据失败');
      }
    }
  }, [fetchLeaderboard]);

  const initializePersonalData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const sessionRes = await fetchWithTimeout('/api/github/session', {}, 12000);
      if (sessionRes.status === 401) {
        setAuthenticated(false);
        setData(null);
        return;
      }

      if (!sessionRes.ok) {
        throw new Error('Failed to check session');
      }

      const session = await sessionRes.json();
      if (!session?.authenticated) {
        setAuthenticated(false);
        setData(null);
        return;
      }

      setAuthenticated(true);
      await fetchData();
    } catch (err: unknown) {
      setAuthenticated(false);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('检查登录状态超时，请稍后重试');
      } else {
        setError('检查登录状态失败');
      }
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      window.location.replace(`/api/github/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`);
      return;
    }

    fetchLeaderboard();
    initializePersonalData();
  }, [fetchLeaderboard, initializePersonalData]);

  const handleLogin = () => {
    const currentPath = window.location.pathname + window.location.search;
    window.location.href = `/api/github/login?from=${encodeURIComponent(currentPath)}`;
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/github/logout', {
        method: 'POST',
      });
    } catch {
      // Reset local UI even if the network request fails.
    }
    setAuthenticated(false);
    setData(null);
    setError(null);
    setActiveTab('leaderboard');
  };

  const totalContributions = data?.total_contributions ?? 0;

  const isLoggedIn = authenticated;
  const hasContributionData = !!data;
  const currentUserEntry = data ? {
    login: data.user.login,
    name: data.user.name || data.user.login,
    avatar_url: data.user.avatar_url,
    total_contributions: totalContributions,
    repo_summary: buildRepoSummaryFromStats(data.repos),
    updated_at: new Date().toISOString(),
  } : null;
  const displayLeaderboard = mergeCurrentUserIntoLeaderboard(leaderboard, currentUserEntry);

  return (
    <div className="space-y-6">
      {/* User bar - show when logged in */}
      {hasContributionData && (
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <img
              src={data.user.avatar_url}
              alt={data.user.login}
              className="w-10 h-10 rounded-full border border-gray-200"
            />
            <div>
              <div className="font-bold text-gray-900">{data.user.name || data.user.login}</div>
              <div className="text-xs text-gray-500">
                Stats from {new Date(data.range.from).toLocaleDateString()} to {new Date(data.range.to).toLocaleDateString()}
              </div>
              {data.contribution_fields && data.contribution_dates && (
                <div className="text-xs font-medium text-indigo-600 mt-0.5">
                  {t('contribute.github.totalContributions')}: {totalContributions}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'leaderboard' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            {t('contribute.github.leaderboard') || '积分榜'}
          </div>
          {activeTab === 'leaderboard' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
        {hasContributionData && (
          <>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'stats' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                {t('contribute.github.myStats') || '我的贡献'}
              </div>
              {activeTab === 'stats' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('redeem')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'redeem' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                {t('redeem.title')}
              </div>
              {activeTab === 'redeem' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Tab content */}
      {activeTab === 'leaderboard' && (
        <LeaderboardView
          leaderboard={displayLeaderboard}
          loading={leaderboardLoading}
          isLoggedIn={isLoggedIn}
          personalLoading={loading}
          personalError={error}
          onLogin={handleLogin}
          onRetry={initializePersonalData}
          t={t}
        />
      )}

      {activeTab === 'stats' && data && (
        <PersonalStatsView data={data} />
      )}

      {activeTab === 'redeem' && data && (
        <RedemptionSystem totalContributions={totalContributions} />
      )}
    </div>
  );
};

/* ---------- Leaderboard View ---------- */

const LeaderboardView: React.FC<{
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  isLoggedIn: boolean;
  personalLoading: boolean;
  personalError: string | null;
  onLogin: () => void;
  onRetry: () => void;
  t: (key: string) => string;
}> = ({ leaderboard, loading, isLoggedIn, personalLoading, personalError, onLogin, onRetry, t }) => {
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isLoggedIn && !personalLoading && personalError && (
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {t('contribute.github.myStats') || '我的贡献'}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">{personalError}</p>
            </div>
          </div>
          <button
            onClick={onRetry}
            className="inline-flex items-center px-3 py-1.5 text-sm border border-amber-300 text-amber-800 rounded-lg hover:bg-white transition-colors"
          >
            {t('contribute.github.retry') || '重试'}
          </button>
        </div>
      )}

      {/* Login prompt for non-logged-in users */}
      {!isLoggedIn && !personalLoading && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Github className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {t('contribute.github.loginPrompt') || '登录 GitHub 查看你的详细贡献并参与积分兑换'}
              </p>
              {personalError && (
                <p className="text-xs text-red-500 mt-0.5">{personalError}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {personalError && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
              >
                {t('contribute.github.retry') || '重试'}
              </button>
            )}
            <button
              onClick={onLogin}
              className="inline-flex items-center px-4 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-black transition-colors"
            >
              <Github className="h-4 w-4 mr-1.5" />
              {t('contribute.github.login') || 'Connect GitHub'}
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard table */}
      {leaderboard.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <div className="flex items-center gap-2 text-white">
              <Trophy className="h-5 w-5" />
              <h3 className="font-bold text-lg">{t('contribute.github.leaderboardTitle') || 'Astron 社区贡献排行榜'}</h3>
            </div>
            <p className="text-indigo-100 text-xs mt-1">
              {t('contribute.github.leaderboardDesc') || '已授权登录用户基于 PR、Issue、代码提交等 GitHub 贡献行为的综合积分排名'}
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {leaderboard.map((entry) => {
              const rankStyle = entry.rank <= 3 ? RANK_STYLES[entry.rank - 1] : null;
              const totalPR = Object.values(entry.repo_summary || {}).reduce((s, r) => s + (r.pr_created || 0), 0);
              const totalMerged = Object.values(entry.repo_summary || {}).reduce((s, r) => s + (r.pr_merged || 0), 0);
              const totalIssues = Object.values(entry.repo_summary || {}).reduce((s, r) => s + (r.issues_created || 0), 0);

              return (
                <div
                  key={entry.login}
                  className={`flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors ${rankStyle ? rankStyle.bg : ''}`}
                >
                  {/* Rank */}
                  <div className="w-8 text-center flex-shrink-0">
                    {rankStyle ? (
                      <span className="text-xl">{rankStyle.icon}</span>
                    ) : (
                      <span className="text-sm font-bold text-gray-400">{entry.rank}</span>
                    )}
                  </div>

                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                      src={entry.avatar_url}
                      alt={entry.login}
                      className="w-8 h-8 rounded-full border border-gray-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-gray-900 truncate">
                        {entry.name || entry.login}
                      </div>
                      <div className="text-xs text-gray-400 truncate">@{entry.login}</div>
                    </div>
                  </div>

                  {/* Breakdown - hide on mobile */}
                  <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1" title="PR Created">
                      <GitPullRequest className="h-3.5 w-3.5 text-purple-500" />
                      {totalPR}
                    </span>
                    <span className="flex items-center gap-1" title="PR Merged">
                      <GitMerge className="h-3.5 w-3.5 text-green-500" />
                      {totalMerged}
                    </span>
                    <span className="flex items-center gap-1" title="Issues">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      {totalIssues}
                    </span>
                  </div>

                  {/* Total score */}
                  <div className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                    rankStyle ? rankStyle.badge : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {entry.total_contributions}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-100 text-center">
          <Medal className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {t('contribute.github.noLeaderboard') || '暂无排行数据'}
          </h3>
          <p className="text-sm text-gray-400">
            {t('contribute.github.noLeaderboardDesc') || '登录 GitHub 后查看贡献数据即可自动加入排行榜'}
          </p>
        </div>
      )}
    </div>
  );
};

/* ---------- Personal Stats View ---------- */

const PersonalStatsView: React.FC<{
  data: ContributionsData;
}> = ({ data }) => (
  <div className="grid md:grid-cols-2 gap-6">
    {Object.entries(data.repos).map(([repoName, stats]) => (
      <div key={repoName} className="bg-white rounded-xl shadow-lg border border-indigo-50 overflow-hidden hover:shadow-xl transition-shadow duration-300 col-span-1 md:col-span-2">
        <div className="bg-gradient-to-r from-indigo-50 to-white p-4 border-b border-indigo-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            <span className="font-semibold text-gray-900">{repoName}</span>
          </div>
          <a
            href={`https://github.com/${repoName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            View Repo →
          </a>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <ContributionColumn
            title="PR Created"
            count={stats.pr_created.total_count}
            items={stats.pr_created.items}
            icon={<GitPullRequest className="h-4 w-4" />}
            colorClass="text-purple-600 bg-purple-50"
          />
          <ContributionColumn
            title="PR Merged"
            count={stats.pr_merged.total_count}
            items={stats.pr_merged.items}
            icon={<GitMerge className="h-4 w-4" />}
            colorClass="text-green-600 bg-green-50"
          />
          <ContributionColumn
            title="Issues Created"
            count={stats.issues_created.total_count}
            items={stats.issues_created.items}
            icon={<AlertCircle className="h-4 w-4" />}
            colorClass="text-amber-600 bg-amber-50"
          />
        </div>

        {data.contribution_fields && data.contribution_dates?.[repoName] && (
          <div className="px-6 pb-6">
            <div className="text-sm font-semibold text-gray-900 mb-3">详细贡献行为统计</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Object.entries(data.contribution_fields).map(([category, fields]) => {
                const repoDates = data.contribution_dates?.[repoName] || {};
                const behaviorRows = fields.map((fieldKey) => ({
                  key: fieldKey,
                  label: BEHAVIOR_LABELS[fieldKey] || fieldKey,
                  count: repoDates[fieldKey]?.length || 0
                }));
                const total = behaviorRows.reduce((sum, row) => sum + row.count, 0);

                return (
                  <div key={`${repoName}-${category}`} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">{CATEGORY_LABELS[category] || category}</h4>
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">{total}</span>
                    </div>
                    <div className="max-h-52 overflow-y-auto pr-1">
                      <ul className="space-y-1.5">
                        {behaviorRows.map((row) => (
                          <li key={row.key} className="flex items-center justify-between text-xs text-gray-700">
                            <span className="pr-2">{row.label}</span>
                            <span className="font-semibold text-gray-900">{row.count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
);

const ContributionColumn = ({ title, count, items, icon, colorClass }: { title: string, count: number, items: GitHubItem[], icon: React.ReactNode, colorClass: string }) => {
  const [showAll, setShowAll] = useState(false);
  const displayItems = showAll ? items : items.slice(0, 5);

  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-2 mb-3 ${colorClass} p-2 rounded-lg w-fit`}>
        {icon}
        <span className="font-bold text-sm">{title}</span>
        <span className="ml-2 bg-white bg-opacity-50 px-2 py-0.5 rounded-full text-xs font-bold">
          {count}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="flex-1 bg-gray-50 rounded-lg p-3 text-xs">
          <ul className="space-y-2">
            {displayItems.map(item => (
              <li key={item.html_url} className="border-b border-gray-100 last:border-0 pb-1 last:pb-0">
                <a
                  href={item.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-indigo-600 block truncate"
                  title={item.title}
                >
                  <span className="font-mono text-gray-400 mr-1">#{item.number}</span>
                  {item.title}
                </a>
                <div className="text-gray-400 text-[10px] mt-0.5">
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
          {items.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium w-full text-center py-1"
            >
              {showAll ? 'Show Less' : `Show ${items.length - 5} More`}
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg p-4 text-gray-400 text-xs italic">
          No contributions found
        </div>
      )}
    </div>
  );
};

export default GitHubConnect;
