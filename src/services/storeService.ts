import { api } from '@/lib/api';

export interface Store {
  id: number;
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  pincode?: string;
  phone?: string;
  email?: string;
  branchId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  branch?: {
    id: number;
    name: string;
    code?: string;
  };
  _count?: {
    employees: number;
  };
}

export const fetchStores = async (branchId?: string): Promise<Store[]> => {
  const params = branchId ? { branchId } : {};
  const response = await api.get('/admin/stores', { params });
  return response.data.data;
};

export const fetchStoreById = async (id: string): Promise<Store> => {
  const response = await api.get(`/admin/stores/${id}`);
  return response.data.data;
};

export const createStore = async (data: Partial<Store>): Promise<Store> => {
  const response = await api.post('/admin/stores', data);
  return response.data.data;
};

export const updateStore = async (id: string, data: Partial<Store>): Promise<Store> => {
  const response = await api.put(`/admin/stores/${id}`, data);
  return response.data.data;
};

export const deleteStore = async (id: string): Promise<void> => {
  await api.delete(`/admin/stores/${id}`);
};
