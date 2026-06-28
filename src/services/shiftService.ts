import { api, getApiErrorMessage } from '@/lib/api';

export interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  workingDays: string[];
  graceMinutes: number;
  breakMinutes: number;
  color: string;
  roleId?: number;
  branchId?: number;
  createdAt: string;
  updatedAt: string;
  assignments?: Array<{
    id: number;
    employee: {
      id: number;
      firstName: string;
      lastName: string;
      employeeCode: string;
    };
  }>;
}

export interface CreateShiftRequest {
  name: string;
  startTime: string;
  endTime: string;
  workingDays: string[];
  graceMinutes?: number;
  breakMinutes?: number;
  color?: string;
  roleId?: number;
  branchId?: number;
}

export interface UpdateShiftRequest {
  name?: string;
  startTime?: string;
  endTime?: string;
  workingDays?: string[];
  graceMinutes?: number;
  breakMinutes?: number;
  color?: string;
  roleId?: number;
  branchId?: number;
}

export interface AssignShiftRequest {
  employeeId: number;
  shiftId: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface ShiftsResponse {
  success: boolean;
  shifts: Shift[];
}

export async function fetchShifts(): Promise<ShiftsResponse> {
  try {
    const { data } = await api.get('/api/admin/shifts');
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch shifts.'));
  }
}

export async function createShift(data: CreateShiftRequest): Promise<Shift> {
  try {
    const { data: response } = await api.post<{ success: boolean; shift: Shift }>('/api/admin/shifts', data);
    return response.shift;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create shift.'));
  }
}

export async function updateShift(id: number, data: UpdateShiftRequest): Promise<Shift> {
  try {
    const { data: response } = await api.put<{ success: boolean; shift: Shift }>(`/api/admin/shifts/${id}`, data);
    return response.shift;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update shift.'));
  }
}

export async function deleteShift(id: number): Promise<void> {
  try {
    await api.delete(`/api/admin/shifts/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete shift.'));
  }
}

export async function assignShiftToEmployee(data: AssignShiftRequest): Promise<void> {
  try {
    await api.post('/api/admin/shifts/assign', data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to assign shift to employee.'));
  }
}
