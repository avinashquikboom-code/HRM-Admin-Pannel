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
    const { data } = await api.get<LeaveHistoryResponse>('/api/admin/leaves', {
      params: { page, limit },
      timeout: 10000,
    });
    return data;
  } catch (error) {
    console.warn('[leaveService] fetchAllLeaves error:', error);
    return {
      success: false,
      count: 0,
      page: 1,
      limit,
      totalPages: 1,
      leaves: [],
    };
  }
}

export async function fetchLeaveBalances(page: number = 1, limit: number = 100): Promise<LeaveBalancesResponse> {
  try {
    const { data } = await api.get<LeaveBalancesResponse>('/api/admin/leaves/balances', {
      params: { page, limit },
      timeout: 10000,
    });
    return data;
  } catch (error) {
    console.warn('[leaveService] fetchLeaveBalances error:', error);
    return {
      success: false,
      count: 0,
      page: 1,
      limit,
      totalPages: 1,
      balances: [],
    };
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

export interface StaffAvailabilityCheckResponse {
  success: boolean;
  data: {
    employee: {
      id: number;
      employeeCode: string;
      name: string;
      department: string;
      store: string;
      designation: string;
      phone: string;
      email: string;
    };
    leave: {
      id: number;
      type: string;
      status: string;
      startDate: string;
      endDate: string;
      totalDays: number;
      reason: string;
      appliedOn: string;
    };
    scheduleContext: {
      weeklyOffDays: Array<{ date: string; dayName: string }>;
      weeklyOffCount: number;
      holidays: Array<{ id: number; name: string; date: string; type: string }>;
      holidayCount: number;
    };
    availability: {
      totalStoreStaff: number;
      totalDeptStaff: number;
      otherEmployeesOnLeave: Array<{
        id: number;
        employeeId: number;
        employeeName: string;
        employeeCode: string;
        department: string;
        designation: string;
        leaveType: string;
        startDate: string;
        endDate: string;
        reason: string;
      }>;
      onLeaveCount: number;
      availableStaffCount: number;
      availabilityPercentage: number;
      warningLevel: 'OPTIMAL' | 'MODERATE' | 'CRITICAL';
      warningMessage: string;
    };
  };
}

export async function fetchLeaveAvailabilityCheck(leaveId: string | number): Promise<StaffAvailabilityCheckResponse['data']> {
  try {
    const { data } = await api.get<StaffAvailabilityCheckResponse>(`/api/admin/leaves/${leaveId}/availability-check`);
    return data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to fetch staff availability check.')
    );
  }
}
