import { api, getApiErrorMessage } from '@/lib/api';

export interface AdminSettings {
  company: {
    name: string;
    logo: string;
    timezone: string;
    workingDays: string[];
    workingHours: {
      start: string;
      end: string;
    };
  };
  attendance: {
    lateThreshold: number;
    halfDayThreshold: number;
    autoMarkAbsent: boolean;
    absentThreshold: number;
    enableGeofence?: boolean;
  };
  leave: {
    casualLeavePerYear: number;
    sickLeavePerYear: number;
    earnedLeavePerYear: number;
    requireApproval: boolean;
    maxConsecutiveDays: number;
    leaveTypes?: {
      id: string;
      name: string;
      code: string;
      daysPerYear: number;
      maxConsecutiveDays: number;
      requiresApproval: boolean;
      paid: boolean;
    }[];
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    dailyReports: boolean;
    weeklyReports: boolean;
  };
  payroll: {
    processingDay: number;
    currency: string;
    includeTax: boolean;
    includeProvidentFund: boolean;
  };
}

export interface SettingsResponse {
  settings: AdminSettings;
}

export async function fetchSettings(): Promise<SettingsResponse> {
  try {
    const { data } = await api.get<SettingsResponse>('/api/admin/settings');
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load settings. Please try again.')
    );
  }
}

export async function updateSettings(
  category: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: Record<string, any>
): Promise<{ message: string; settings: any }> {
  try {
    const { data } = await api.put<{ message: string; settings: any }>(
      '/api/admin/settings',
      { category, settings }
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to update settings.')
    );
  }
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'mandatory' | 'optional' | 'restricted';
  recurring: boolean;
}

export async function fetchAdminHolidays(): Promise<Holiday[]> {
  try {
    const { data } = await api.get<{ success: boolean; holidays: Holiday[] }>('/api/admin/holidays');
    return data.holidays;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to fetch holidays.')
    );
  }
}

export async function createAdminHoliday(holidayData: {
  name: string;
  date: string;
  type: 'mandatory' | 'optional' | 'restricted';
  recurring: boolean;
}): Promise<Holiday> {
  try {
    const { data } = await api.post<{ success: boolean; holiday: Holiday }>('/api/admin/holidays', holidayData);
    return data.holiday;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to create holiday.')
    );
  }
}

export async function deleteAdminHoliday(id: string): Promise<void> {
  try {
    await api.delete(`/api/admin/holidays/${id}`);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to delete holiday.')
    );
  }
}
