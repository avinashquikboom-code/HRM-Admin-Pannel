'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { fetchCompanyStats, type CompanyStats } from '@/services/companyService';

export function useCompanyStats() {
  const token = useAppSelector((state) => state.auth.token);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = useCallback(async () => {
    if (!token) {
      setStats(null);
      setError('');
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await fetchCompanyStats();
      setStats(data);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load company stats';
      setError(message);
      setStats(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: loadStats,
  };
}
