'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchCompanyStats, type CompanyStats } from '@/services/companyService';

const demoStats: CompanyStats = {
  totalEntities: 12,
  globalSeats: 384,
  pendingVerification: 2,
  systemGrowth: '+18.7%',
  monthlyRevenue: 2450000,
  planMix: [
    { name: 'Enterprise', count: 4, percent: 33, color: 'bg-primary' },
    { name: 'Pro', count: 5, percent: 42, color: 'bg-accent' },
    { name: 'Basic', count: 3, percent: 25, color: 'bg-muted' }
  ],
  recentInvoices: [
    { id: 'INV-2026-001', company: 'Acme Corp', plan: 'Enterprise', amount: '₹1,50,000', status: 'Paid', date: '12 Jun 2026' },
    { id: 'INV-2026-002', company: 'Hooli Inc', plan: 'Pro', amount: '₹45,000', status: 'Pending', date: '10 Jun 2026' },
    { id: 'INV-2026-003', company: 'Initech', plan: 'Basic', amount: '₹12,000', status: 'Paid', date: '08 Jun 2026' },
    { id: 'INV-2026-004', company: 'Veer Industries', plan: 'Pro', amount: '₹35,000', status: 'Overdue', date: '05 Jun 2026' }
  ],
  growthHistory: [
    { name: 'Jan', companies: 8, seats: 240 },
    { name: 'Feb', companies: 9, seats: 280 },
    { name: 'Mar', companies: 10, seats: 310 },
    { name: 'Apr', companies: 11, seats: 340 },
    { name: 'May', companies: 12, seats: 370 },
    { name: 'Jun', companies: 12, seats: 384 }
  ],
  revenueHistory: [
    { name: 'Jan', value: 1800000, churn: 90000 },
    { name: 'Feb', value: 1950000, churn: 97000 },
    { name: 'Mar', value: 2100000, churn: 105000 },
    { name: 'Apr', value: 2250000, churn: 112000 },
    { name: 'May', value: 2400000, churn: 120000 },
    { name: 'Jun', value: 2450000, churn: 122500 }
  ],
  recentActivity: [
    { id: 'demo-act-1', type: 'success', title: 'New company onboarded', description: 'Acme Corp signed up for Enterprise plan.', time: '2h ago' },
    { id: 'demo-act-2', type: 'info', title: 'Seats limit upgraded', description: 'Hooli Inc added 15 new employee seats.', time: '5h ago' },
    { id: 'demo-act-3', type: 'warning', title: 'Invoice overdue reminder', description: 'Automatic warning sent to Veer Industries.', time: '1d ago' }
  ]
};

export function useCompanyStats() {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = useCallback(async () => {
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
      setStats(demoStats);
      return demoStats;
    } finally {
      setIsLoading(false);
    }
  }, []);

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
