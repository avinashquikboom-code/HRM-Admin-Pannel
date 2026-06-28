import { api, getApiErrorMessage } from '@/lib/api';

export interface WorkMode {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchWorkModes(): Promise<WorkMode[]> {
  try {
    const { data } = await api.get<{ success: boolean; data: WorkMode[] }>('/api/hr/work-modes');
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch work modes.'));
  }
}
