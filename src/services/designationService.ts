import { api, getApiErrorMessage } from '@/lib/api';

export interface Designation {
  id: number;
  name: string;
  code: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDesignationRequest {
  name: string;
}

export interface UpdateDesignationRequest {
  name: string;
  isActive?: boolean;
}

export interface DesignationsResponse {
  success: boolean;
  data: Designation[];
}

export async function fetchDesignations(): Promise<DesignationsResponse> {
  try {
    const { data } = await api.get('/api/admin/designations');
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch designations.'));
  }
}

export async function createDesignation(data: CreateDesignationRequest): Promise<Designation> {
  try {
    const response = await api.post('/api/admin/designations', data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create designation.'));
  }
}

export async function updateDesignation(id: number, data: UpdateDesignationRequest): Promise<Designation> {
  try {
    const response = await api.put(`/api/admin/designations/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update designation.'));
  }
}

export async function deleteDesignation(id: number): Promise<void> {
  try {
    await api.delete(`/api/admin/designations/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete designation.'));
  }
}
