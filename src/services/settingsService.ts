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
  };
  leave: {
    casualLeavePerYear: number;
    sickLeavePerYear: number;
    earnedLeavePerYear: number;
    requireApproval: boolean;
    maxConsecutiveDays: number;
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
  settings: Partial<AdminSettings>
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
