import { api, getApiErrorMessage } from '@/lib/api';
export interface PlatformUserEmployeeProfile {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation: string | null;
  status: string;
  office: {
    id: number;
    name: string;
  } | null;
}

export interface PlatformUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  registeredAt: string;
  employee: PlatformUserEmployeeProfile | null;
  hasEmployeeProfile: boolean;
}

export interface UsersApiResponse {
  count: number;
  withEmployeeProfile: number;
  employees: PlatformUser[];
}

export async function fetchPlatformUsers(): Promise<PlatformUser[]> {
  try {
    const { data } = await api.get<UsersApiResponse>('/api/admin/users');
    return data.employees ?? [];
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to fetch platform users. Please try again.')
    );
  }
}

export async function updateUserStatus(userId: number, isActive: boolean): Promise<{ message: string }> {
  try {
    const { data } = await api.put<{ success: boolean; message: string; user: any }>(`/api/admin/users/${userId}/status`, {
      isActive,
    });
    return { message: data.message };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to update user status.')
    );
  }
}
