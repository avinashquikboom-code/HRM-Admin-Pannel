import { api, getApiErrorMessage } from '@/lib/api';
import { getAuthToken } from '@/lib/authStorage';
import { isDevAuthSession } from '@/lib/devAuth';

export interface CompanyStats {
  totalEntities: number;
  globalSeats: number;
  pendingVerification: number;
  systemGrowth: string;
}

interface CompanyStatsResponse {
  totalEntities: number;
  globalSeats: number;
  pendingVerification: number;
  systemGrowth: string;
}

const DEMO_COMPANY_STATS: CompanyStats = {
  totalEntities: 15,
  globalSeats: 6425,
  pendingVerification: 2,
  systemGrowth: '18.7%',
};

export async function fetchCompanyStats(): Promise<CompanyStats> {
  if (isDevAuthSession()) {
    return DEMO_COMPANY_STATS;
  }

  if (!getAuthToken()) {
    throw new Error(
      'Admin token not found. Sign in first — token is stored in hrm_auth and hrm_token cookie.'
    );
  }

  try {
    const { data } = await api.get<CompanyStatsResponse>(
      '/api/admin/companies/stats'
    );

    return {
      totalEntities: data.totalEntities ?? 0,
      globalSeats: data.globalSeats ?? 0,
      pendingVerification: data.pendingVerification ?? 0,
      systemGrowth: data.systemGrowth ?? '0%',
    };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load company stats. Please try again.')
    );
  }
}
