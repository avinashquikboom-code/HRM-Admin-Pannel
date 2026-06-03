import { api, getApiErrorMessage } from '@/lib/api';

export interface Office {
  id: number;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  idealRadiusMeters: number;
  maxPunchRadiusMeters: number;
  isActive: boolean;
}

export async function fetchOffices(): Promise<Office[]> {
  try {
    const { data } = await api.get<{ offices: Office[] }>('/api/admin/offices');
    return data.offices;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to fetch offices. Please try again.')
    );
  }
}

