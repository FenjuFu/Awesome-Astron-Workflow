import { useState, useEffect } from 'react';

interface Contribution {
  repository: string;
  contributions: number;
  avatarUrl: string;
  userUrl: string;
}

interface ContributionData {
  user: {
    login: string;
    name: string;
    avatar_url: string;
    bio: string;
  };
  contributions: Contribution[];
}

export function useGitHubContributions(token: string | null) {
  const [data, setData] = useState<ContributionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setData(null);
      return;
    }

    const fetchContributions = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          '/api/github/contributions?repos=iflytek/astron-agent,iflytek/astron-rpa',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch contributions');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [token]);

  return { data, loading, error };
}
