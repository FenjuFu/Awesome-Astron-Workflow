import React, { useEffect, useState } from 'react';
import { Github, Loader2, ShieldCheck, LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface RepoStats {
  commits: number;
  prs: number;
  issues: number;
  reviews: number;
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
          <div key={repoName} className="bg-white rounded-xl shadow-lg border border-indigo-50 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-indigo-50 to-white p-4 border-b border-indigo-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                <span className="font-semibold text-gray-900">{repoName.split('/')[1]}</span>
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
            
            <div className="grid grid-cols-2 gap-4 p-6">
              <StatItem label="Commits" value={stats.commits} color="bg-blue-50 text-blue-700" />
              <StatItem label="Pull Requests" value={stats.prs} color="bg-purple-50 text-purple-700" />
              <StatItem label="Issues" value={stats.issues} color="bg-amber-50 text-amber-700" />
              <StatItem label="Code Reviews" value={stats.reviews} color="bg-emerald-50 text-emerald-700" />
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

export default GitHubConnect;
