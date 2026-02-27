import React from 'react';
import { useGitHubContributions } from '../hooks/useGitHubContributions';

interface ContributionViewerProps {
  token: string | null;
}

export default function ContributionViewer({ token }: ContributionViewerProps) {
  const { data, loading, error } = useGitHubContributions(token);

  if (!token) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please login with GitHub to view your contributions</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading contributions...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  if (!data) {
    return <div className="text-center py-8">No contribution data found</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem('github_access_token');
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border border-indigo-50">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <img 
            src={data.user.avatar_url} 
            alt={data.user.login}
            className="w-16 h-16 rounded-full border-2 border-indigo-100"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{data.user.name || data.user.login}</h2>
            <p className="text-indigo-600 font-medium">@{data.user.login}</p>
            {data.user.bio && <p className="text-sm text-gray-500 mt-1 max-w-md">{data.user.bio}</p>}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-100"
        >
          Logout
        </button>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Astron Contributions</h3>
        {data.contributions.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg text-center border border-dashed border-gray-300">
            <p className="text-gray-600 italic">No contributions found in the tracked repositories</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.contributions.map((contrib) => (
              <a 
                key={contrib.repository} 
                href={contrib.userUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 border border-indigo-50 rounded-xl bg-white hover:shadow-md transition-all duration-200 group"
              >
                <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{contrib.repository.split('/')[1]}</h4>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-3xl font-black text-indigo-600">
                    {contrib.contributions}
                  </span>
                  <span className="text-sm text-gray-500 mb-1">Contributions</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
