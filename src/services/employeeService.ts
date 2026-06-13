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

export interface AdminEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation: string | null;
  status: string;
  officeId: string | null;
  office: AdminEmployeeOffice | null;
  user: AdminEmployeeUser | null;
  department: AdminEmployeeDepartment | null;
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
    const { data } = await api.get<EmployeesResponse>('/api/admin/employees');
    return data;
  } catch (error) {
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
  officeId: string
): Promise<{ message: string; employee: AssignedEmployeeResult }> {
  try {
    const { data } = await api.post<AssignEmployeeResponse>(
      '/api/admin/employees/assign',
      { userId, officeId }
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
