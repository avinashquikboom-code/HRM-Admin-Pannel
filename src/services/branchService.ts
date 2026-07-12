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
  const response = await api.get('/api/admin/stores');
  const stores = response.data.data || [];
  return stores.map((s: any) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    address: s.address,
    country: s.country || 'India',
    isActive: s.isActive,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));
};

export const fetchBranchById = async (id: string): Promise<Branch> => {
  const response = await api.get(`/api/admin/stores/${id}`);
  const store = response.data.data;
  return {
    id: store.id,
    name: store.name,
    code: store.code,
    address: store.address,
    country: store.country || 'India',
    isActive: store.isActive,
    createdAt: store.createdAt,
    updatedAt: store.updatedAt,
  };
};

export const createBranch = async (data: CreateBranchRequest): Promise<Branch> => {
  throw new Error('Branch creation is disabled.');
};

export const updateBranch = async (id: string, data: UpdateBranchRequest): Promise<Branch> => {
  throw new Error('Branch update is disabled.');
};

export const deleteBranch = async (id: string): Promise<void> => {
  throw new Error('Branch deletion is disabled.');
};

/**
 * Fetch all branches that a specific store belongs to.
 */
export const fetchBranchesByStoreId = async (storeId: string): Promise<Branch[]> => {
  const storeResponse = await api.get(`/api/admin/stores/${storeId}`);
  const store = storeResponse.data.data;
  if (!store) return [];
  return [{
    id: store.id,
    name: store.name,
    code: store.code,
    address: store.address,
    country: store.country || 'India',
    isActive: store.isActive,
    createdAt: store.createdAt,
    updatedAt: store.updatedAt,
  }];
};

