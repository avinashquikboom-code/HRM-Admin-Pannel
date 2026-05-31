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

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://quickboom-hrm-backend-gjch.onrender.com';

async function getHeaders() {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchHRStats(): Promise<HRStats> {
  const response = await fetch(`${BASE_URL}/api/hr/stats`, {
    method: 'GET',
    headers: await getHeaders(),
    cache: 'no-store',
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to fetch HR stats: ${err}`);
  }
  const res = await response.json();
  return res.data;
}

export async function fetchDepartmentOverview(): Promise<HRDepartmentResponse> {
  const response = await fetch(`${BASE_URL}/api/hr/departments`, {
    method: 'GET',
    headers: await getHeaders(),
    cache: 'no-store',
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to fetch department overview: ${err}`);
  }
  return response.json();
}

export async function fetchLeaveOverview(): Promise<HRLeaveOverview> {
  const response = await fetch(`${BASE_URL}/api/hr/leaves`, {
    method: 'GET',
    headers: await getHeaders(),
    cache: 'no-store',
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to fetch leave overview: ${err}`);
  }
  const res = await response.json();
  return res.data;
}

export async function fetchHREmployees(params: {
  search?: string;
  status?: string;
  department?: string;
  page?: number;
  limit?: number;
}): Promise<HREmployeesResponse> {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.status) query.append('status', params.status);
  if (params.department) query.append('department', params.department);
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());

  const response = await fetch(`${BASE_URL}/api/hr/employees?${query.toString()}`, {
    method: 'GET',
    headers: await getHeaders(),
    cache: 'no-store',
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to fetch HR employees: ${err}`);
  }
  return response.json();
}

export async function fetchAttendanceTrend(): Promise<HRAttendanceDay[]> {
  const response = await fetch(`${BASE_URL}/api/hr/attendance-trend`, {
    method: 'GET',
    headers: await getHeaders(),
    cache: 'no-store',
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to fetch attendance trend: ${err}`);
  }
  const res = await response.json();
  return res.data;
}

export async function fetchHRActivity(): Promise<HRActivityItem[]> {
  const response = await fetch(`${BASE_URL}/api/hr/activity`, {
    method: 'GET',
    headers: await getHeaders(),
    cache: 'no-store',
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to fetch HR activity: ${err}`);
  }
  const res = await response.json();
  return res.activity;
}
