import React, { useEffect, useState } from 'react';
import { 
  X, 
  Loader2, 
  GitPullRequest, 
  GitMerge, 
  AlertCircle, 
  ShieldCheck,
  Github,
  ExternalLink
} from 'lucide-react';

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
    html_url: string;
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

interface Props {
  login: string;
  onClose: () => void;
}

const ContributionDetailModal: React.FC<Props> = ({ login, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ContributionsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
        const res = await fetch(`/api/github?action=contributions&login=${encodeURIComponent(login)}`, {
          headers: {
            'x-admin-password': adminPassword
          }
        });
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to fetch contribution data');
        }

        const json = await res.json();
        setData(json);
      } catch (err: unknown) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to fetch contribution data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [login]);

  const totalContributions = data?.total_contributions ?? (
    (data?.contribution_dates ?
      Object.values(data.contribution_dates).reduce((total, repoDates) => {
        return total + Object.values(repoDates).reduce((repoTotal, dates) => repoTotal + dates.length, 0);
      }, 0) : 0) + (data?.astron?.agent?.workflows || 0) + (data?.astron?.rpa?.tasks || 0)
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">GitHub 贡献详情</h3>
              <p className="text-xs text-gray-500">查看用户在 iflytek-astron 相关项目的贡献记录</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
              <p className="text-gray-500">正在获取 GitHub 贡献数据...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="inline-flex p-3 bg-red-50 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">获取数据失败</h4>
              <p className="text-gray-500 mb-6">{error}</p>
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                关闭窗口
              </button>
            </div>
          ) : data ? (
            <div className="space-y-8">
              {/* User Info Card */}
              <div className="flex items-center justify-between bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-4">
                  <img 
                    src={data.user.avatar_url} 
                    alt={data.user.login} 
                    className="w-16 h-16 rounded-full border-2 border-white shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-900">{data.user.name || data.user.login}</span>
                      <a 
                        href={data.user.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <div className="text-sm text-gray-500">@{data.user.login}</div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                      总计贡献: {totalContributions}
                    </div>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-gray-400">统计周期</div>
                  <div className="text-sm font-medium text-gray-600">
                    {new Date(data.range.from).toLocaleDateString()} - {new Date(data.range.to).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Astron Platform Stats */}
              {data.astron && (data.astron.agent.workflows > 0 || data.astron.rpa.tasks > 0) && (
                <div className="border border-indigo-100 rounded-xl overflow-hidden shadow-sm bg-indigo-50/30">
                  <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-gray-900">Astron 平台贡献</span>
                    </div>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StatBox 
                      label="Agent Workflows" 
                      count={data.astron.agent.workflows} 
                      icon={<ShieldCheck className="w-4 h-4" />}
                      color="purple"
                    />
                    <StatBox 
                      label="RPA Tasks" 
                      count={data.astron.rpa.tasks} 
                      icon={<ShieldCheck className="w-4 h-4" />}
                      color="green"
                    />
                  </div>
                </div>
              )}

              {/* Repo Stats */}
              <div className="space-y-6">
                {Object.entries(data.repos).map(([repoName, stats]) => {
                  const hasStats = stats.pr_created.total_count > 0 || 
                                  stats.pr_merged.total_count > 0 || 
                                  stats.issues_created.total_count > 0;
                  
                  if (!hasStats && !data.contribution_dates?.[repoName]) return null;

                  return (
                    <div key={repoName} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          <span className="font-bold text-gray-900">{repoName}</span>
                        </div>
                        <a 
                          href={`https://github.com/${repoName}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          仓库主页 <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      
                      <div className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                          <StatBox 
                            label="PR Created" 
                            count={stats.pr_created.total_count} 
                            icon={<GitPullRequest className="w-4 h-4" />}
                            color="purple"
                          />
                          <StatBox 
                            label="PR Merged" 
                            count={stats.pr_merged.total_count} 
                            icon={<GitMerge className="w-4 h-4" />}
                            color="green"
                          />
                          <StatBox 
                            label="Issues Created" 
                            count={stats.issues_created.total_count} 
                            icon={<AlertCircle className="w-4 h-4" />}
                            color="amber"
                          />
                        </div>

                        {data.contribution_fields && data.contribution_dates?.[repoName] && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(data.contribution_fields).map(([category, fields]) => {
                              const repoDates = data.contribution_dates?.[repoName] || {};
                              const behaviorRows = fields.map((fieldKey) => ({
                                key: fieldKey,
                                label: BEHAVIOR_LABELS[fieldKey] || fieldKey,
                                count: repoDates[fieldKey]?.length || 0
                              })).filter(row => row.count > 0);

                              if (behaviorRows.length === 0) return null;

                              const total = behaviorRows.reduce((sum, row) => sum + row.count, 0);

                              return (
                                <div key={`${repoName}-${category}`} className="bg-gray-50/50 rounded-lg p-3 border border-gray-100">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-bold text-gray-700">{CATEGORY_LABELS[category] || category}</h4>
                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">{total}</span>
                                  </div>
                                  <ul className="space-y-1">
                                    {behaviorRows.map((row) => (
                                      <li key={row.key} className="flex items-center justify-between text-[11px] text-gray-600">
                                        <span>{row.label}</span>
                                        <span className="font-bold text-gray-900">{row.count}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400 italic">
              暂无贡献数据
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
          >
            关闭详情
          </button>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, count, icon, color }: { label: string, count: number, icon: React.ReactNode, color: 'purple' | 'green' | 'amber' }) => {
  const colors = {
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    green: 'text-green-600 bg-green-50 border-green-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100'
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${colors[color]}`}>
      <div className="p-2 bg-white rounded-lg shadow-sm">
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-medium opacity-70 uppercase tracking-wider">{label}</div>
        <div className="text-lg font-black">{count}</div>
      </div>
    </div>
  );
};

export default ContributionDetailModal;
