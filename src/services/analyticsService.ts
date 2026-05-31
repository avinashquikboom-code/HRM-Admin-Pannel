import { api, getApiErrorMessage } from '@/lib/api';

export interface AnalyticsOverview {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  averageRetention: string;
  totalPresentToday: number;
  weeklyData: {
    name: string;
    revenue: number;
    employees: number;
    companies: number;
  }[];
  retentionData: {
    name: string;
    value: number;
  }[];
}

export interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsOverview;
}

export async function fetchAnalyticsOverview(): Promise<AnalyticsResponse> {
  try {
    const { data } = await api.get<AnalyticsResponse>('/api/admin/analytics/overview');
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load analytics data. Please try again.')
    );
  }
}
