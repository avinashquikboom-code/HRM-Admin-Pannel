import { api, getApiErrorMessage } from '@/lib/api';
export interface AttendanceEmployee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation: string | null;
}

export interface AttendanceOffice {
  id: number;
  name: string;
}

export interface AttendanceRecord {
  id: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  notes: string | null;
  employee: AttendanceEmployee;
  office: AttendanceOffice | null;
  isOnBreak?: boolean;
  breakStartTime?: string | null;
  totalBreakSeconds?: number;
}

export interface AttendanceDistributionItem {
  name: string;
  value: number;
  color: string;
}

export interface TodayAttendanceResponse {
  date: string;
  count: number;
  total: number;
  page: number;
  limit: number;
  attendances: AttendanceRecord[];
  attendanceDistribution: AttendanceDistributionItem[];
}

interface AttendanceHistoryResponse {
  from: string;
  to: string;
  page: number;
  limit: number;
  total: number;
  records: AttendanceRecord[];
}

export async function fetchTodayAttendance(): Promise<TodayAttendanceResponse> {
  try {
    console.log('Fetching attendance from /api/admin/attendance/today');
    const { data } = await api.get<TodayAttendanceResponse>(
      '/api/admin/attendance/today'
    );
    console.log('Attendance API response:', data);
    return data;
  } catch (error) {
    console.error('Attendance API error:', error);
    throw new Error(
      getApiErrorMessage(error, 'Failed to load today attendance. Please try again.')
    );
  }
}

export async function fetchAttendanceHistory(params?: {
  from?: string;
  to?: string;
  limit?: number;
  employeeId?: number;
}): Promise<AttendanceRecord[]> {
  try {
    const { data } = await api.get<AttendanceHistoryResponse>(
      '/api/admin/attendance/history',
      { params }
    );
    return data.records;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load attendance history. Please try again.')
    );
  }
}

export interface ComprehensiveReportSummary {
  totalDays: number;
  fullDays: number;
  halfDays: number;
  absentDays: number;
  lateDays: number;
  presentDays: number;
  totalWorkHours: number;
  totalBreakTime: number;
  locationTrackingDays: number;
  locationTrackingPercentage: number;
}

export interface ComprehensiveAttendanceRecord {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  attendanceType: string;
  workHours: number;
  breakMinutes: number;
  hasLocation: boolean;
  location: {
    latitude: number;
    longitude: number;
    officeName: string;
    officeRadius: number;
  } | null;
}

export interface LocationTracking {
  date: string;
  latitude: number;
  longitude: number;
  officeName: string;
  officeRadius: number;
  locationStatus: string;
}

export interface BreakDetail {
  date: string;
  breakStartTime: string | null;
  breakMinutes: number;
  breakType: string;
}

export interface ComprehensiveReportResponse {
  period: {
    month: number;
    year: number;
    startDate: string;
    endDate: string;
  };
  summary: ComprehensiveReportSummary;
  attendanceRecords: ComprehensiveAttendanceRecord[];
  locationTracking: LocationTracking[];
  breakDetails: BreakDetail[];
}

export async function fetchComprehensiveAttendanceReport(params: {
  month: number;
  year: number;
  employeeId?: number;
  departmentId?: number;
  includeLocationTracking?: boolean;
  includeBreakDetails?: boolean;
}): Promise<ComprehensiveReportResponse> {
  try {
    const { data } = await api.get<ComprehensiveReportResponse>(
      '/api/attendance/comprehensive-report',
      { params }
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load comprehensive attendance report. Please try again.')
    );
  }
}

export async function downloadComprehensiveAttendanceReport(params: {
  month: number;
  year: number;
  employeeId?: number;
  departmentId?: number;
}): Promise<void> {
  try {
    const response = await api.get(
      '/api/attendance/comprehensive-report/download',
      {
        params,
        responseType: 'blob'
      }
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `comprehensive-attendance-report-${params.month}-${params.year}.pdf`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to download comprehensive attendance report. Please try again.')
    );
  }
}

export interface AllEmployeesAttendanceParams {
  from?: string;
  to?: string;
  employeeId?: number;
  departmentId?: number;
  officeId?: number;
  page?: number;
  limit?: number;
}

export interface AllEmployeesAttendanceResponse {
  success: boolean;
  from: string | null;
  to: string | null;
  page: number;
  limit: number;
  total: number;
  records: AttendanceRecord[];
}

export async function fetchAllEmployeesAttendance(
  params?: AllEmployeesAttendanceParams
): Promise<AllEmployeesAttendanceResponse> {
  try {
    const { data } = await api.get<AllEmployeesAttendanceResponse>(
      '/api/mobile/attendance/all',
      { params }
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load all employees attendance. Please try again.')
    );
  }
}
