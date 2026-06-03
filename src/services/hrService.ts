import { getAuthToken } from '@/lib/authStorage';

export interface HRStats {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  pendingLeaves: number;
  newHires: number;
  openTasks: number;
  departments: number;
  attendanceRate: number;
  totalAttendanceToday: number;
  totalHRAdmins: number;
  activeSessions: number;
  onboardingRate: string;
  hiringGrowth: Array<{ name: string; hires: number }>;
  hrDistribution: Array<{ name: string; value: number; color: string }>;
}

export interface HRDepartmentOverview {
  id: number;
  name: string;
  code: string | null;
  count: number;
  active: number;
  inactive: number;
  percentage: number;
}

export interface HRDepartmentResponse {
  success: boolean;
  departments: HRDepartmentOverview[];
  unassigned: number;
  totalEmployees: number;
}

export interface HRLeaveRecent {
  id: number;
  employeeName: string;
  designation: string;
  department: string;
  type: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: string;
  appliedOn: string;
}

export interface HRLeaveOverview {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  leaveTypes: Array<{ type: string; count: number }>;
  recent: HRLeaveRecent[];
}

export interface HREmployee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  designation: string;
  status: string;
  department: string;
  office: string;
  email: string | null;
  isActive: boolean;
  leaveCount: number;
  taskCount: number;
  attendanceCount: number;
  joinedAt: string;
}

export interface HREmployeesResponse {
  success: boolean;
  employees: HREmployee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HRAttendanceDay {
  date: string;
  day: string;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
}

export interface HRActivityItem {
  id: string;
  type: 'task' | 'leave';
  title: string;
  description: string;
  status: string;
  priority: string | null;
  date: string;
}

import { api, getApiErrorMessage } from '@/lib/api';

export async function fetchHRStats(): Promise<HRStats> {
  try {
    const { data } = await api.get<{ data: HRStats }>('/api/hr/stats');
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch HR stats.'));
  }
}

export async function fetchDepartmentOverview(): Promise<HRDepartmentResponse> {
  try {
    const { data } = await api.get<HRDepartmentResponse>('/api/hr/departments');
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch department overview.'));
  }
}

export async function fetchLeaveOverview(): Promise<HRLeaveOverview> {
  try {
    const { data } = await api.get<{ data: HRLeaveOverview }>('/api/hr/leaves');
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch leave overview.'));
  }
}

export async function fetchHREmployees(params: {
  search?: string;
  status?: string;
  department?: string;
  page?: number;
  limit?: number;
}): Promise<HREmployeesResponse> {
  try {
    const { data } = await api.get<HREmployeesResponse>('/api/hr/employees', { params });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch HR employees.'));
  }
}

export async function fetchAttendanceTrend(): Promise<HRAttendanceDay[]> {
  try {
    const { data } = await api.get<{ data: HRAttendanceDay[] }>('/api/hr/attendance-trend');
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch attendance trend.'));
  }
}

export async function fetchHRActivity(): Promise<HRActivityItem[]> {
  try {
    const { data } = await api.get<{ activity: HRActivityItem[] }>('/api/hr/activity');
    return data.activity;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch HR activity.'));
  }
}

