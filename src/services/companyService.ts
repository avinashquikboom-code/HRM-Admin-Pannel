import { api, getApiErrorMessage } from '@/lib/api';
import { getAuthToken } from '@/lib/authStorage';
import { isDevAuthSession } from '@/lib/devAuth';

export interface CompanyStats {
  totalEntities: number;
  globalSeats: number;
  pendingVerification: number;
  systemGrowth: string;
  monthlyRevenue: number;
  planMix?: { name: string; count: number; percent: number; color: string }[];
  recentInvoices?: { id: string; company: string; plan: string; amount: string; status: string; date: string }[];
  growthHistory?: { name: string; companies: number; seats: number }[];
  recentActivity?: { id: string; type: 'success' | 'warning' | 'error' | 'info'; title: string; description: string; time: string }[];
}

interface CompanyStatsResponse {
  totalEntities: number;
  globalSeats: number;
  pendingVerification: number;
  systemGrowth: string;
  monthlyRevenue?: number;
  planMix?: { name: string; count: number; percent: number; color: string }[];
  recentInvoices?: { id: string; company: string; plan: string; amount: string; status: string; date: string }[];
  growthHistory?: { name: string; companies: number; seats: number }[];
  recentActivity?: { id: string; type: 'success' | 'warning' | 'error' | 'info'; title: string; description: string; time: string }[];
}

const DEMO_COMPANY_STATS: CompanyStats = {
  totalEntities: 15,
  globalSeats: 6425,
  pendingVerification: 2,
  systemGrowth: '18.7%',
  monthlyRevenue: 2400000,
  planMix: [
    { name: 'Enterprise', count: 6, percent: 40, color: 'bg-primary' },
    { name: 'Pro', count: 6, percent: 40, color: 'bg-accent' },
    { name: 'Basic', count: 3, percent: 20, color: 'bg-muted' },
  ],
  recentInvoices: [
    { id: 'INV-2026-001', company: 'TechVibe Inc.', plan: 'Enterprise', amount: '₹12,400', status: 'Paid', date: '28 Apr 2026' },
    { id: 'INV-2026-002', company: 'Global Logistics', plan: 'Pro', amount: '₹4,500', status: 'Pending', date: '30 Apr 2026' },
    { id: 'INV-2026-003', company: 'EcoWare Solutions', plan: 'Basic', amount: '₹1,200', status: 'Overdue', date: '01 May 2026' },
    { id: 'INV-2026-004', company: 'Innovate Digital', plan: 'Pro', amount: '₹4,500', status: 'Paid', date: '02 May 2026' },
    { id: 'INV-2026-005', company: 'Blue Sky Media', plan: 'Pro', amount: '₹4,500', status: 'Paid', date: '03 May 2026' },
  ],
  growthHistory: [
    { name: 'Jan', companies: 8, seats: 2100 },
    { name: 'Feb', companies: 9, seats: 2450 },
    { name: 'Mar', companies: 10, seats: 2800 },
    { name: 'Apr', companies: 11, seats: 3100 },
    { name: 'May', companies: 13, seats: 4200 },
    { name: 'Jun', companies: 14, seats: 5100 },
    { name: 'Jul', companies: 15, seats: 6425 },
  ],
  recentActivity: [
    { id: 'act-1', type: 'success', title: 'New company onboarded', description: 'Innovate Digital was onboarded successfully.', time: '2h ago' },
    { id: 'act-2', type: 'info', title: 'New employee registered', description: 'Employee Amit Kumar was registered.', time: '5h ago' },
    { id: 'act-3', type: 'warning', title: 'Comment added', description: 'Priya Sharma commented on Delhi HQ.', time: '1d ago' },
  ]
};

export async function fetchCompanyStats(): Promise<CompanyStats> {
  try {
    const { data } = await api.get<CompanyStatsResponse>(
      '/api/admin/companies/stats'
    );

    return {
      totalEntities: data.totalEntities ?? 0,
      globalSeats: data.globalSeats ?? 0,
      pendingVerification: data.pendingVerification ?? 0,
      systemGrowth: data.systemGrowth ?? '0%',
      monthlyRevenue: data.monthlyRevenue ?? 0,
      planMix: data.planMix,
      recentInvoices: data.recentInvoices,
      growthHistory: data.growthHistory,
      recentActivity: data.recentActivity
    };
  } catch (error) {
    if (isDevAuthSession()) {
      return DEMO_COMPANY_STATS;
    }
    throw new Error(
      getApiErrorMessage(error, 'Failed to load company stats. Please try again.')
    );
  }
}
