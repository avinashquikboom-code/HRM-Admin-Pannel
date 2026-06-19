import { api, getApiErrorMessage } from '@/lib/api';

export interface Department {
  id: string;
  name: string;
  code: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    employees: number;
  };
}

export interface CreateDepartmentRequest {
  name: string;
  code?: string;
}

export interface UpdateDepartmentRequest {
  name: string;
  code?: string;
}

export interface DepartmentResponse {
  success: boolean;
  message: string;
  department: Department;
}

export interface DepartmentsResponse {
  success: boolean;
  departments: Department[];
}

export async function fetchDepartments(): Promise<DepartmentsResponse> {
  try {
    const { data } = await api.get<DepartmentsResponse>('/api/admin/departments');
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load departments. Please try again.')
    );
  }
}

export async function createDepartment(
  request: CreateDepartmentRequest
): Promise<DepartmentResponse> {
  try {
    const { data } = await api.post<DepartmentResponse>(
      '/api/admin/departments',
      request
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to create department. Please try again.')
    );
  }
}

export async function updateDepartment(
  id: string,
  request: UpdateDepartmentRequest
): Promise<DepartmentResponse> {
  try {
    const { data } = await api.put<DepartmentResponse>(
      `/api/admin/departments/${id}`,
      request
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to update department. Please try again.')
    );
  }
}

export async function deleteDepartment(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      `/api/admin/departments/${id}`
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to delete department. Please try again.')
    );
  }
}
