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
  count: number;
  page: number;
  limit: number;
  totalPages: number;
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
  count: number;
  page: number;
  limit: number;
  totalPages: number;
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

export async function fetchAllLeaves(page: number = 1, limit: number = 20): Promise<LeaveHistoryResponse> {
  try {
    console.log('=== FRONTEND: Fetching all leaves ===');
    console.log('API Endpoint: /api/admin/leaves');
    console.log('Backend URL:', process.env.NEXT_PUBLIC_API_URL || 'https://api.voxiqai.com');
    console.log('Pagination params:', { page, limit });
    
    const { data } = await api.get<LeaveHistoryResponse>('/api/admin/leaves', {
      params: { page, limit }
    });
    
    console.log('=== FRONTEND: API Response received ===');
    console.log('Success:', data.success);
    console.log('Number of leaves returned:', data.leaves?.length || 0);
    console.log('Total count:', data.count);
    console.log('Page:', data.page, 'of', data.totalPages);
    console.log('=== FRONTEND: Fetch complete ===');
    
    return data;
  } catch (error) {
    console.error('=== FRONTEND: API Error ===');
    console.error('Error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw new Error(
      getApiErrorMessage(error, 'Failed to load leave requests. Please try again.')
    );
  }
}

export async function fetchLeaveBalances(page: number = 1, limit: number = 20): Promise<LeaveBalancesResponse> {
  try {
    const { data } = await api.get<LeaveBalancesResponse>('/api/admin/leaves/balances', {
      params: { page, limit }
    });
    return data;
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
