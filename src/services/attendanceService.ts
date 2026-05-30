import { api, getApiErrorMessage } from '@/lib/api';
import { isDevAuthSession } from '@/lib/devAuth';

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
}

interface TodayAttendanceResponse {
  date: string;
  count: number;
  attendances: AttendanceRecord[];
}

interface AttendanceHistoryResponse {
  from: string;
  to: string;
  page: number;
  limit: number;
  total: number;
  records: AttendanceRecord[];
}

export async function fetchTodayAttendance(): Promise<AttendanceRecord[]> {
  try {
    const { data } = await api.get<TodayAttendanceResponse>(
      '/api/admin/attendance/today'
    );
    return data.attendances;
  } catch (error) {
    if (isDevAuthSession()) {
      return [];
    }
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
