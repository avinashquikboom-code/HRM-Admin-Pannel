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
  workMode: string;
  shiftType: string;
  workModeId: string;
  shiftTypeId: string;
  shift?: { id: string; name: string; startTime: string; endTime: string; color?: string | null } | null;
  department: string | { id: string; name: string; code: string | null } | null;
  office: string | { id: string; name: string; latitude: number; longitude: number; idealRadiusMeters: number; maxPunchRadiusMeters: number } | null;
  email: string | null;
  phone?: string;
  aadharNumber?: string;
  pfNumber?: string;
  esicNumber?: string;
  isHandicapped?: boolean;
  currentAddress?: string;
  permanentAddress?: string;
  role?: string;
  commissionPercentage?: number;
  storeId?: number | null;
  branchId?: number | null;
  customPunchRadius?: number | null;
  store?: { id: number; name: string } | null;
  branch?: { id: number; name: string } | null;
  // Bank Details
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountType?: string;
  branchName?: string;
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
    const { data } = await api.get<{ success: boolean; data: HRLeaveOverview }>('/api/hr/leaves');
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

export interface HROffice {
  id: number;
  name: string;
  code: string | null;
  address: string;
}

export interface HRDepartment {
  id: number;
  name: string;
  code: string | null;
}

export interface CreateHREmployeeRequest {
  email: string;
  firstName: string;
  lastName?: string;
  designation?: string;
  status?: string;
  officeId?: number;
  departmentId?: number;
  phone?: string;
  aadharNumber?: string;
  pfNumber?: string;
  esicNumber?: string;
  isHandicapped?: boolean;
  currentAddress?: string;
  permanentAddress?: string;
  workMode?: string;
  shiftType?: string;
  workModeId?: string;
  shiftTypeId?: string;
  shiftId?: number;
  effectiveFrom?: string;
  role?: string;
  commissionPercentage?: number;
  storeId?: number;
  branchId?: number;
  customPunchRadius?: number;
  // Bank Details
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountType?: string;
  branchName?: string;
  // Salary Structure
  basicSalary?: number;
  grossSalary?: number;
  hra?: number;
  medicalAllowance?: number;
  travelAllowance?: number;
  specialAllowance?: number;
  incentive?: number;
  bonus?: number;
  pfEnabled?: boolean;
  employeePfRate?: number;
  employerPfRate?: number;
  esicEnabled?: boolean;
  employeeEsicRate?: number;
  employerEsicRate?: number;
}

export interface UpdateHREmployeeRequest {
  firstName?: string;
  lastName?: string;
  designation?: string;
  status?: string;
  officeId?: number;
  departmentId?: number;
  phone?: string;
  aadharNumber?: string;
  pfNumber?: string;
  esicNumber?: string;
  isHandicapped?: boolean;
  currentAddress?: string;
  permanentAddress?: string;
  workMode?: string;
  shiftType?: string;
  workModeId?: string;
  shiftTypeId?: string;
  shiftId?: number;
  effectiveFrom?: string;
  role?: string;
  password?: string;
  commissionPercentage?: number;
  storeId?: number;
  branchId?: number;
  customPunchRadius?: number;
  // Bank Details
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountType?: string;
  branchName?: string;
  // Salary Structure
  basicSalary?: number;
  grossSalary?: number;
  hra?: number;
  medicalAllowance?: number;
  travelAllowance?: number;
  specialAllowance?: number;
  incentive?: number;
  bonus?: number;
  pfEnabled?: boolean;
  employeePfRate?: number;
  employerPfRate?: number;
  esicEnabled?: boolean;
  employeeEsicRate?: number;
  employerEsicRate?: number;
}

export async function fetchHROffices(): Promise<HROffice[]> {
  try {
    const { data } = await api.get<{ success: boolean; offices: HROffice[] }>('/api/admin/offices');
    return data.offices;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch offices.'));
  }
}

export async function fetchHRDepartments(): Promise<HRDepartment[]> {
  try {
    const { data } = await api.get<{ success: boolean; departments: HRDepartment[] }>('/api/admin/departments');
    return data.departments;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch departments.'));
  }
}

export async function createHREmployee(employeeData: CreateHREmployeeRequest): Promise<HREmployee> {
  try {
    const { data } = await api.post<{ success: boolean; employee: HREmployee }>('/api/hr/employees', employeeData);
    return data.employee;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create employee.'));
  }
}

export async function updateHREmployee(id: number, employeeData: UpdateHREmployeeRequest): Promise<HREmployee> {
  try {
    const { data } = await api.put<{ success: boolean; employee: HREmployee }>(`/api/hr/employees/${id}`, employeeData);
    return data.employee;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update employee.'));
  }
}

export async function deleteHREmployee(id: number): Promise<void> {
  try {
    await api.delete(`/api/hr/employees/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete employee.'));
  }
}

export async function downloadHRLeaveReport(params?: {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<void> {
  try {
    const token = getAuthToken('super_admin');
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://69.62.80.20:5004');
    const queryParams = new URLSearchParams();
    
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const url = `${baseUrl}/api/admin/leaves/report/download?token=${token}&${queryParams.toString()}`;
    window.open(url, '_blank');
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to download leave report.'));
  }
}

export async function downloadHRAttendanceReport(params?: {
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  officeId?: string;
}): Promise<void> {
  try {
    const token = getAuthToken('super_admin');
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://69.62.80.20:5004');
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.departmentId) queryParams.append('departmentId', params.departmentId);
    if (params?.officeId) queryParams.append('officeId', params.officeId);
    
    const url = `${baseUrl}/api/admin/reports/attendance/download?token=${token}&${queryParams.toString()}`;
    window.open(url, '_blank');
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to download attendance report.'));
  }
}

export async function downloadHREmployeeReport(params?: {
  departmentId?: string;
  officeId?: string;
  status?: string;
}): Promise<void> {
  try {
    const token = getAuthToken('super_admin');
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://69.62.80.20:5004');
    const queryParams = new URLSearchParams();
    
    if (params?.departmentId) queryParams.append('departmentId', params.departmentId);
    if (params?.officeId) queryParams.append('officeId', params.officeId);
    if (params?.status) queryParams.append('status', params.status);
    
    const url = `${baseUrl}/api/hr/employees/download?token=${token}&${queryParams.toString()}`;
    window.open(url, '_blank');
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to download employee report.'));
  }
}

// ─── HR Payroll ─────────────────────────────────────────────────────────

export interface HRPayrollStats {
  totalEmployees: number;
  activeEmployees: number;
  totalMonthlyPayroll: number;
  averageSalary: number;
  currency: string;
}

export interface HRPayrollRun {
  id: number;
  officeName: string;
  employeeCount: number;
  lastRunDate: string;
  status: string;
  totalAmount: number;
}

export async function fetchHRPayrollStats(): Promise<HRPayrollStats> {
  try {
    const { data } = await api.get<{ data: HRPayrollStats }>('/api/hr/payroll/stats');
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch HR payroll stats.'));
  }
}

export async function fetchHRPayrollRuns(): Promise<HRPayrollRun[]> {
  try {
    const { data } = await api.get<{ payrollRuns: HRPayrollRun[] }>('/api/hr/payroll/runs');
    return data.payrollRuns;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch HR payroll runs.'));
  }
}

