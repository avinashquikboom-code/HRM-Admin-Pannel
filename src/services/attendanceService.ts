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
    const { data } = await api.get<TodayAttendanceResponse>(
      '/api/admin/attendance/today'
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load today attendance. Please try again.')
    );
  }
}

export async function fetchAttendanceHistory(params?: {
  from?: string;
  to?: string;
  limit?: number;
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
