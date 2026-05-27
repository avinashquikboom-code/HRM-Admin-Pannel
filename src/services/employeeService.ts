import { api, getApiErrorMessage } from '@/lib/api';
import { getAuthSession } from '@/lib/authStorage';
import { isDevAuthSession } from '@/lib/devAuth';

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

interface EmployeesResponse {
  count: number;
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

export async function fetchEmployees(): Promise<AdminEmployee[]> {
  if (isDevAuthSession()) {
    return [];
  }

  try {
    const { data } = await api.get<EmployeesResponse>('/api/admin/employees');
    return data.employees;
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
