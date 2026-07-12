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
  maxPunchRadiusMeters?: number;
  createdAt: string;
  updatedAt: string;
  stores?: {
    id: number;
    name: string;
    code?: string;
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
  maxPunchRadiusMeters?: number;
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
  maxPunchRadiusMeters?: number;
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

/**
 * Fetch all branches that a specific store belongs to.
 * Since Store.branchId is a single FK, this returns an array with 0 or 1 element.
 */
export const fetchBranchesByStoreId = async (storeId: string): Promise<Branch[]> => {
  // Get the store to find its branchId
  const storeResponse = await api.get(`/api/admin/stores/${storeId}`);
  const store = storeResponse.data.data;
  if (!store?.branchId) return [];
  // Fetch the specific branch
  const branchResponse = await api.get(`/api/admin/branches/${store.branchId}`);
  const branch = branchResponse.data.data;
  return branch ? [branch] : [];
};

