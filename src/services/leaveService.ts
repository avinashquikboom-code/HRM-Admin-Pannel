import { api, getApiErrorMessage } from '@/lib/api';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  appliedOn: string;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface LeaveHistoryResponse {
  success: boolean;
  leaves: LeaveRequest[];
}

export interface LeaveBalance {
  employeeId: string;
  employeeName: string;
  casual: number;
  sick: number;
  earned: number;
  paid: number;
}

export interface LeaveBalancesResponse {
  success: boolean;
  balances: LeaveBalance[];
}

export interface CreateLeaveRequest {
  employeeId: string;
  type: string;
  fromDate: string;
  toDate: string;
  reason: string;
}

export interface UpdateLeaveStatusRequest {
  status: 'APPROVED' | 'REJECTED';
  remarks?: string;
}

export async function fetchEmployeeLeaves(employeeId: number): Promise<LeaveRequest[]> {
  try {
    const { data } = await api.get<LeaveHistoryResponse>('/api/admin/leaves', {
      params: { employeeId }
    });
    return data.leaves;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load employee leaves. Please try again.')
    );
  }
}

export async function fetchAllLeaves(): Promise<LeaveRequest[]> {
  try {
    const { data } = await api.get<LeaveHistoryResponse>('/api/admin/leaves');
    return data.leaves;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load leave requests. Please try again.')
    );
  }
}

export async function fetchLeaveBalances(): Promise<LeaveBalance[]> {
  try {
    const { data } = await api.get<LeaveBalancesResponse>('/api/admin/leaves/balances');
    return data.balances;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load leave balances. Please try again.')
    );
  }
}

export async function createLeaveRequest(request: CreateLeaveRequest): Promise<{ message: string }> {
  try {
    const { data } = await api.post<{ message: string }>('/api/admin/leaves', request);
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to create leave request. Please try again.')
    );
  }
}

export async function updateLeaveStatus(
  leaveId: string,
  request: UpdateLeaveStatusRequest
): Promise<{ message: string }> {
  try {
    const { data } = await api.put<{ message: string }>(`/api/admin/leaves/${leaveId}`, request);
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to update leave status. Please try again.')
    );
  }
}
