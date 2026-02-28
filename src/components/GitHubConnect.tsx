import React, { useEffect, useState } from 'react';
import { Github, Loader2, ShieldCheck, LogOut, GitPullRequest, GitMerge, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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

const GitHubConnect: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ContributionsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      window.location.replace(`/api/github/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`);
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/github/contributions');
      
      if (res.status === 401) {
        setData(null);
        return;
      }
      
      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError('Failed to load contribution data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    // Force a hard navigation to the API endpoint
    const currentPath = window.location.pathname + window.location.search;
    window.location.href = `/api/github/login?from=${encodeURIComponent(currentPath)}`;
  };

  const handleLogout = () => {
    // Clear cookie by setting it to expire
    document.cookie = 'gh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setData(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-red-100 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-red-50 rounded-full">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Connection Error</h3>
          <p className="text-gray-600 max-w-md">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Refresh Page
            </button>
            <button
              onClick={handleLogin}
              className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors shadow-sm"
            >
              <Github className="h-4 w-4 mr-2" />
              Reconnect
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-indigo-100 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-full">
            <Github className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{t('contribute.github.login')}</h3>
          <p className="text-gray-600 max-w-md">
            {t('contribute.github.subtitle')}
          </p>
          <button
            onClick={handleLogin}
            className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors shadow-sm"
          >
            <Github className="h-5 w-5 mr-2" />
            Connect GitHub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
    </div>
  );
};

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
