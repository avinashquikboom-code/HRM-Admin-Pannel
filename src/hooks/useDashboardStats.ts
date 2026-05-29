'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { fetchDashboardStats, type DashboardStats } from '@/services/dashboardService';

export interface DashboardData extends DashboardStats {
  totalCompanies: number;
  platformWorkforce: number;
  manualAudits: number;
  monthlyRevenue: number;
}

export function useDashboardStats() {
  const token = useAppSelector((state) => state.auth.token);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = useCallback(async () => {
    if (!token) {
      setData(null);
      setError('');
      setLoading(false);
      return null;
    }

    setLoading(true);
    setError('');

    try {
      const apiData = await fetchDashboardStats();
      setData({
        ...apiData,
        totalCompanies: apiData.totalEmployees ?? 0,
        platformWorkforce: apiData.totalEmployees ?? 0,
        manualAudits: apiData.onLeave ?? 0,
        monthlyRevenue: (apiData.presentToday ?? 0) * 5000 + 1200000,
      });
      return apiData;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load dashboard stats';
      setError(message);
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    data,
    loading,
    error,
    refetch: loadStats,
  };
}
