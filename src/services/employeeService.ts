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
  id: number;          // Integer DB primary key — use this for edit/delete API calls
  employeeID?: string; // HopKid GUID or legacy local-* string (may be null)
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation: string | null;
  designationId: number | null;
  designationRelation: { id: number; name: string } | null;
  status: string;
  source: 'HOPKID' | 'MANUAL';
  workMode: string;
  shiftType: string;
  workModeId: string;
  shiftTypeId: string;
  officeId: string | null;
  office: AdminEmployeeOffice | null;
  storeId: string | null;
  store: { id: string; name: string; branchId: string | null; branch: { id: string; name: string } | null } | null;
  branchId: string | null;
  branch: { id: string; name: string } | null;
  departmentId: string | null;
  user: AdminEmployeeUser | null;
  department: AdminEmployeeDepartment | null;
  shift: AdminEmployeeShift | null;
  commissionPercentage?: number;
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

export async function fetchEmployees(params?: { page?: number; limit?: number }): Promise<EmployeesResponse> {
  try {
    console.log('[employeeService] Fetching employees from /api/admin/employees', params);
    const { data } = await api.get<EmployeesResponse>('/api/admin/employees', { params });
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
  employeeId: string,
  payload: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  try {
    const { data } = await api.put<ResetPasswordResponse>(
      `/api/admin/employees/${employeeId.toLowerCase()}/reset-password`,
      payload
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to reset password. Please try again.')
    );
  }
}

export async function updateEmployee(
  employeeId: number | string,
  employeeData: {
    firstName?: string;
    lastName?: string;
    designation?: string;
    designationId?: string | number;
    status?: string;
    officeId?: string;
    storeId?: string | number;
    branchId?: string | number;
    departmentId?: string;
    shiftId?: string;
    workMode?: string;
    shiftType?: string;
    commissionPercentage?: number;
  }
): Promise<{ message: string; employee: any }> {
  try {
    const { data } = await api.put<{ message: string; employee: any }>(
      `/api/admin/employees/${employeeId}`,
      employeeData
    );
    return data;
  } catch (error) {
    console.error('Update employee API error:', error);
    throw new Error(
      getApiErrorMessage(error, 'Failed to update employee. Please try again.')
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

export interface HopkidEmployee {
  employeeID: string;
  employeeCode: string;
  employeeName: string;
  gender: string | null;
  dateofBirth: string | null;
  dateofJoining: string | null;
  pinCode: number | null;
  address: string;
  branchName: string;
  country: string;
  countryID: number;
  stateID: number;
  cityID: number;
  state: string;
  city: string;
  mobileNo: string;
  email: string | null;
  salary: number;
  commissionPercentage: number;
  companyId: string;
  branchId: string;
  isActive: boolean;
  createdBy: string;
  createdOn: string;
  updatedBy: string;
  updatedOn: string;
  updatedLog: string;
  branchId2: string;
  alternativeMobileNumber: string | null;
}

export interface HopkidEmployeeListResponse {
  success: boolean;
  message: string;
  data: HopkidEmployee[];
}

export async function fetchHopkidEmployeeList(): Promise<HopkidEmployeeListResponse> {
  try {
    const { data } = await api.get<HopkidEmployeeListResponse>('/api/Employee/GetEmployeeList', {
      headers: {
        'x-api-key': 'HOPKID-MOBILE-ACCESS-API-KEY',
      },
    });
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to fetch Hopkid employee list. Please try again.')
    );
  }
}

