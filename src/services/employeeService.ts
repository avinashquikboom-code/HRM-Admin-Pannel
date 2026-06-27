import { api, getApiErrorMessage } from '@/lib/api';
import { getAuthSession } from '@/lib/authStorage';
export interface AdminEmployeeOffice {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  idealRadiusMeters: number;
  maxPunchRadiusMeters: number;
}

export interface AdminEmployeeUser {
  id: number;
  email: string;
  role: string;
  isActive: boolean;
}

export interface AdminEmployeeDepartment {
  id: string;
  name: string;
  code: string | null;
}

export interface AdminEmployeeShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface AdminEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation: string | null;
  status: string;
  workMode: string;
  shiftType: string;
  workModeId: string;
  shiftTypeId: string;
  officeId: string | null;
  office: AdminEmployeeOffice | null;
  user: AdminEmployeeUser | null;
  department: AdminEmployeeDepartment | null;
  shift: AdminEmployeeShift | null;
}

export interface EmployeesResponse {
  count: number;
  total: number;
  page: number;
  limit: number;
  registeredCount: number;
  employees: AdminEmployee[];
}

export interface AssignedEmployeeResult {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  officeId: string | null;
  office: AdminEmployeeOffice | null;
}

interface AssignEmployeeResponse {
  message: string;
  employee: AssignedEmployeeResult;
}

export async function fetchEmployees(): Promise<EmployeesResponse> {
  try {
    console.log('[employeeService] Fetching employees from /api/admin/employees');
    const { data } = await api.get<EmployeesResponse>('/api/admin/employees');
    console.log('[employeeService] Employees response received:', data);
    return data;
  } catch (error) {
    console.error('[employeeService] Error fetching employees:', error);
    throw new Error(
      getApiErrorMessage(error, 'Failed to load employees. Please try again.')
    );
  }
}

export async function assignEmployeeToOffice(
  employeeId: string,
  officeId: string
): Promise<{ message: string; employee: AssignedEmployeeResult }> {
  try {
    const { data } = await api.put<AssignEmployeeResponse>(
      `/api/admin/offices/assign-employee/${employeeId}`,
      { officeId }
    );

    return {
      message: data.message,
      employee: data.employee,
    };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to assign employee. Please try again.')
    );
  }
}

export async function assignUserToOffice(
  userId: number,
  officeId: string,
  departmentId?: number
): Promise<{ message: string; employee: AssignedEmployeeResult }> {
  try {
    const { data } = await api.post<AssignEmployeeResponse>(
      '/api/admin/employees/assign',
      { userId, officeId, departmentId }
    );

    return {
      message: data.message,
      employee: data.employee,
    };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to assign employee. Please try again.')
    );
  }
}

export async function unassignEmployeeFromOffice(
  employeeId: string
): Promise<{ message: string; employee: AssignedEmployeeResult }> {
  try {
    const { data } = await api.put<AssignEmployeeResponse>(
      `/api/admin/offices/assign-employee/${employeeId}`,
      {}
    );

    return {
      message: data.message,
      employee: data.employee,
    };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to unassign employee. Please try again.')
    );
  }
}

export async function unassignEmployeeFromDepartment(
  employeeId: string
): Promise<{ message: string; employee: AssignedEmployeeResult }> {
  try {
    const { data } = await api.put<AssignEmployeeResponse>(
      `/api/admin/offices/assign-employee/${employeeId}`,
      { departmentId: null }
    );

    return {
      message: data.message,
      employee: data.employee,
    };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to unassign employee from department. Please try again.')
    );
  }
}

export interface RegisterUserRequest {
  email: string;
  password: string;
  role: 'EMPLOYEE' | 'HR';
}

export interface RegisterUserResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    email: string;
    role: string;
    createdAt: string;
  };
}

export async function registerUser(
  credentials: RegisterUserRequest
): Promise<RegisterUserResponse> {
  try {
    const { data } = await api.post<RegisterUserResponse>(
      '/api/auth/register',
      credentials
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to register user. Please try again.')
    );
  }
}

export interface ResetPasswordRequest {
  newPassword: string;
  isTemporary?: boolean;
}

export interface ResetPasswordResponse {
  message: string;
}

export async function resetEmployeePassword(
  userId: number,
  payload: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  try {
    const { data } = await api.put<ResetPasswordResponse>(
      `/api/admin/users/${userId}/reset-password`,
      payload
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to reset password. Please try again.')
    );
  }
}

export async function deleteEmployee(employeeId: string): Promise<{ message: string }> {
  try {
    const { data } = await api.delete<{ message: string }>(
      `/api/admin/employees/${employeeId}`
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to delete employee. Please try again.')
    );
  }
}

export async function assignEmployeeToDepartment(
  employeeId: string,
  departmentId: string
): Promise<{ message: string }> {
  try {
    const { data } = await api.put<{ message: string }>(
      `/api/admin/employees/${employeeId}/assign-department`,
      { departmentId }
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to assign department. Please try again.')
    );
  }
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: string;
  departmentId?: number;
  officeId?: number;
  mobileNumber?: string;
  joiningDate?: string;
  reportingManagerId?: number;
  shiftId?: number;
  designationId?: number;
  workMode?: string;
  shiftType?: string;
  workModeId?: string;
  shiftTypeId?: string;
  salaryStructure?: {
    basicSalary?: number;
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
  };
}

export async function createEmployee(
  payload: CreateEmployeeRequest
): Promise<{ success: boolean; message: string; employee: any }> {
  try {
    const { data } = await api.post<{ success: boolean; message: string; employee: any }>(
      '/api/admin/employees',
      payload
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to create employee. Please try again.')
    );
  }
}

export async function fetchShifts(): Promise<any[]> {
  try {
    const { data } = await api.get<{ success: boolean; shifts: any[] }>('/api/admin/shifts');
    return data.shifts;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch shifts.'));
  }
}

export async function fetchDesignations(): Promise<any[]> {
  try {
    const { data } = await api.get<{ success: boolean; data: any[] }>('/api/admin/designations');
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch designations.'));
  }
}

