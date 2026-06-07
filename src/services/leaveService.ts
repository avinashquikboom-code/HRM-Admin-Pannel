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
