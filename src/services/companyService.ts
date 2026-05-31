import { api, getApiErrorMessage } from '@/lib/api';
import { getAuthToken } from '@/lib/authStorage';
export interface CompanyStats {
  totalEntities: number;
  globalSeats: number;
  pendingVerification: number;
  systemGrowth: string;
  monthlyRevenue: number;
  planMix?: { name: string; count: number; percent: number; color: string }[];
  recentInvoices?: { id: string; company: string; plan: string; amount: string; status: string; date: string }[];
  growthHistory?: { name: string; companies: number; seats: number }[];
  revenueHistory?: { name: string; value: number; churn: number }[];
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
  revenueHistory?: { name: string; value: number; churn: number }[];
  recentActivity?: { id: string; type: 'success' | 'warning' | 'error' | 'info'; title: string; description: string; time: string }[];
}

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
      planMix: data.planMix ?? [],
      recentInvoices: data.recentInvoices ?? [],
      growthHistory: data.growthHistory ?? [],
      revenueHistory: data.revenueHistory ?? [],
      recentActivity: data.recentActivity ?? []
    };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load company stats. Please try again.')
    );
  }
}
