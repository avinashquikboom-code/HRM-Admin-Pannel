import { getAuthToken } from '@/lib/authStorage';

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
  const token = await getAuthToken();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/dashboard/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to fetch dashboard stats: ${err}`);
  }

  const data = await response.json();
  return data.data as DashboardStats;
}
