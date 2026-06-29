import { api } from '@/lib/api';

export interface Branch {
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
  isActive: boolean;
  officeId?: number;
  officeName?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
  stores?: {
    _count?: {
      employees: number;
    }
  }[];
}

export interface CreateBranchRequest {
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  pincode?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
  officeId: number;
  latitude?: number;
  longitude?: number;
}

export interface UpdateBranchRequest {
  name?: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
  officeId?: number;
  latitude?: number;
  longitude?: number;
}

export const fetchBranches = async (): Promise<Branch[]> => {
  const response = await api.get('/api/admin/branches');
  return response.data.data || [];
};

export const fetchBranchById = async (id: string): Promise<Branch> => {
  const response = await api.get(`/api/admin/branches/${id}`);
  return response.data.data;
};

export const createBranch = async (data: CreateBranchRequest): Promise<Branch> => {
  const response = await api.post('/api/admin/branches', data);
  return response.data.data;
};

export const updateBranch = async (id: string, data: UpdateBranchRequest): Promise<Branch> => {
  const response = await api.put(`/api/admin/branches/${id}`, data);
  return response.data.data;
};

export const deleteBranch = async (id: string): Promise<void> => {
  await api.delete(`/api/admin/branches/${id}`);
};
