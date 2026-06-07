import { api, getApiErrorMessage } from '@/lib/api';

export interface SubscriptionPlan {
  name: string;
  value: number;
  color: string;
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  onLeave: number;
  newHires: number;
  subscriptionDistribution: SubscriptionPlan[];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    const { data } = await api.get<{ success: boolean; data: DashboardStats }>('/api/admin/dashboard/stats');
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to fetch dashboard stats. Please try again.')
    );
  }
}

