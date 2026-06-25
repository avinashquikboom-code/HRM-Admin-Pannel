import { api } from '@/lib/api';

export interface Role {
  id?: number;
  name: string;
  isSystem: boolean;
  isActive: boolean;
}

export const fetchRoles = async (): Promise<Role[]> => {
  const response = await api.get('/admin/roles');
  return response.data.data;
};

export const createRole = async (name: string): Promise<Role> => {
  const response = await api.post('/admin/roles', { name });
  return response.data.data;
};

export const updateRole = async (id: string, name: string): Promise<Role> => {
  const response = await api.put(`/admin/roles/${id}`, { name });
  return response.data.data;
};

export const deleteRole = async (id: string): Promise<void> => {
  await api.delete(`/admin/roles/${id}`);
};
