import React, { useEffect, useState } from 'react';
import { Github, Loader2, ShieldCheck, LogOut, Bot, Zap, GitPullRequest, GitMerge, AlertCircle } from 'lucide-react';
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
  astron?: AstronStats;
}

const GitHubConnect: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ContributionsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
    window.location.href = '/api/github/login';
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
        {data.astron && (
          <>
            {/* Astron Agent Card */}
            <div className="bg-white rounded-xl shadow-lg border border-indigo-50 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-blue-50 to-white p-4 border-b border-blue-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Astron Agent</span>
                </div>
                <span className="text-xs font-medium text-blue-600">Platform Activity</span>
              </div>
              <div className="grid grid-cols-2 gap-4 p-6">
                <StatItem label="Workflows" value={data.astron.agent.workflows} color="bg-blue-50 text-blue-700" />
                <StatItem label="Total Runs" value={data.astron.agent.runs} color="bg-indigo-50 text-indigo-700" />
              </div>
            </div>

            {/* Astron RPA Card */}
            <div className="bg-white rounded-xl shadow-lg border border-indigo-50 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-green-50 to-white p-4 border-b border-green-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-gray-900">Astron RPA</span>
                </div>
                <span className="text-xs font-medium text-green-600">Automation Stats</span>
              </div>
              <div className="grid grid-cols-2 gap-4 p-6">
                <StatItem label="Tasks Done" value={data.astron.rpa.tasks} color="bg-green-50 text-green-700" />
                <StatItem label="Hours Saved" value={data.astron.rpa.hoursSaved} color="bg-emerald-50 text-emerald-700" />
              </div>
            </div>
          </>
        )}

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
          </div>
        ))}
      </div>
    </div>
  );
};

const StatItem = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className={`rounded-lg p-3 ${color} flex flex-col items-center justify-center text-center`}>
    <span className="text-2xl font-bold mb-1">{value}</span>
    <span className="text-xs font-medium opacity-80 uppercase tracking-wide">{label}</span>
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