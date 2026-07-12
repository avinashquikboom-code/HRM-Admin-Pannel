import { api } from '@/lib/api';

// Commission Policy Types
export interface CommissionPolicy {
  id: number;
  name: string;
  description?: string;
  commissionType: 'PERCENTAGE' | 'FIXED' | 'NONE';
  commissionValue: number;
  priority: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  storeId?: number | null;
  employeeId?: number | null;
  departmentId?: number | null;
  designationId?: number | null;
  roleId?: string;
  productId?: number;
  categoryId?: number;
  brandId?: number;
  targetAmount?: number;
  targetBonus?: number;
  monthlyBonus?: number;
  quarterlyBonus?: number;
  yearlyBonus?: number;
  maxCommission?: number;
  minTarget?: number;
  createdAt: string;
  updatedAt: string;
  employee?: any;
  store?: any;
  department?: any;
  designationRelation?: any;
}

export interface CommissionTransaction {
  id: number;
  billId?: string;
  invoiceNumber?: string;
  employeeId: number;
  storeId?: number;
  saleAmount: number;
  commissionType: string;
  commissionPercent?: number;
  commissionAmount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  approvedBy?: number;
  approvedAt?: string;
  payrollId?: number;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  employee?: any;
  store?: any;
  policy?: any;
}

export interface CommissionTarget {
  id: number;
  policyId: number;
  employeeId?: number;
  storeId?: number;
  targetType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  targetAmount: number;
  achievedAmount: number;
  progressPercent: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'ACHIEVED' | 'MISSED' | 'CANCELLED';
  bonusAmount?: number;
  bonusPaid: boolean;
  createdAt: string;
  updatedAt: string;
  employee?: any;
  store?: any;
  policy?: any;
}

export interface CommissionDashboardStats {
  today: {
    commission: number;
    sales: number;
    transactions: number;
  };
  month: {
    commission: number;
    sales: number;
    transactions: number;
  };
  pending: {
    commission: number;
    transactions: number;
  };
  paid: {
    commission: number;
    transactions: number;
  };
  topPerformers: Array<{
    employee: any;
    totalCommission: number;
    totalSales: number;
  }>;
}

// Commission Policy API Calls

export async function createCommissionPolicy(
  policyData: Partial<CommissionPolicy>
): Promise<{ success: boolean; message: string; policy: CommissionPolicy }> {
  try {
    const { data } = await api.post<{ success: boolean; message: string; policy: CommissionPolicy }>(
      '/api/admin/commission/policies',
      policyData
    );
    return data;
  } catch (error) {
    console.error('Create commission policy error:', error);
    throw new Error('Failed to create commission policy. Please try again.');
  }
}

export async function getCommissionPolicies(
  params?: {
    storeId?: string;
    employeeId?: string;
    isActive?: boolean;
  }
): Promise<{ success: boolean; policies: CommissionPolicy[] }> {
  try {
    const { data } = await api.get<{ success: boolean; policies: CommissionPolicy[] }>(
      '/api/admin/commission/policies',
      { params }
    );
    return data;
  } catch (error) {
    console.error('Get commission policies error:', error);
    throw new Error('Failed to fetch commission policies. Please try again.');
  }
}

export async function getCommissionPolicyById(
  id: string
): Promise<{ success: boolean; policy: CommissionPolicy }> {
  try {
    const { data } = await api.get<{ success: boolean; policy: CommissionPolicy }>(
      `/api/admin/commission/policies/${id}`
    );
    return data;
  } catch (error) {
    console.error('Get commission policy error:', error);
    throw new Error('Failed to fetch commission policy. Please try again.');
  }
}

export async function updateCommissionPolicy(
  id: string,
  policyData: Partial<CommissionPolicy>
): Promise<{ success: boolean; message: string; policy: CommissionPolicy }> {
  try {
    const { data } = await api.put<{ success: boolean; message: string; policy: CommissionPolicy }>(
      `/api/admin/commission/policies/${id}`,
      policyData
    );
    return data;
  } catch (error) {
    console.error('Update commission policy error:', error);
    throw new Error('Failed to update commission policy. Please try again.');
  }
}

export async function deleteCommissionPolicy(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      `/api/admin/commission/policies/${id}`
    );
    return data;
  } catch (error) {
    console.error('Delete commission policy error:', error);
    throw new Error('Failed to delete commission policy. Please try again.');
  }
}

// Commission Transaction API Calls

export async function createCommissionTransaction(
  transactionData: {
    billId?: string;
    invoiceNumber?: string;
    employeeId: string;
    storeId?: string;
    saleAmount: number;
    commissionType: string;
    commissionPercent?: number;
    commissionAmount?: number;
    notes?: string;
  }
): Promise<{ success: boolean; message: string; transaction: CommissionTransaction }> {
  try {
    const { data } = await api.post<{ success: boolean; message: string; transaction: CommissionTransaction }>(
      '/api/admin/commission/transactions',
      transactionData
    );
    return data;
  } catch (error) {
    console.error('Create commission transaction error:', error);
    throw new Error('Failed to create commission transaction. Please try again.');
  }
}

export async function getCommissionTransactions(
  params?: {
    employeeId?: string;
    storeId?: string;
    branchId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<{ success: boolean; transactions: CommissionTransaction[] }> {
  try {
    const { data } = await api.get<{ success: boolean; transactions: CommissionTransaction[] }>(
      '/api/admin/commission/transactions',
      { params }
    );
    return data;
  } catch (error) {
    console.error('Get commission transactions error:', error);
    throw new Error('Failed to fetch commission transactions. Please try again.');
  }
}

export async function approveCommissionTransaction(
  id: string,
  notes?: string
): Promise<{ success: boolean; message: string; transaction: CommissionTransaction }> {
  try {
    const { data } = await api.put<{ success: boolean; message: string; transaction: CommissionTransaction }>(
      `/api/admin/commission/transactions/${id}/approve`,
      { notes }
    );
    return data;
  } catch (error) {
    console.error('Approve commission transaction error:', error);
    throw new Error('Failed to approve commission transaction. Please try again.');
  }
}

export async function rejectCommissionTransaction(
  id: string,
  notes?: string
): Promise<{ success: boolean; message: string; transaction: CommissionTransaction }> {
  try {
    const { data } = await api.put<{ success: boolean; message: string; transaction: CommissionTransaction }>(
      `/api/admin/commission/transactions/${id}/reject`,
      { notes }
    );
    return data;
  } catch (error) {
    console.error('Reject commission transaction error:', error);
    throw new Error('Failed to reject commission transaction. Please try again.');
  }
}

// Commission Target API Calls

export async function createCommissionTarget(
  targetData: {
    policyId: string;
    employeeId?: string;
    storeId?: string;
    targetType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    targetAmount: number;
    startDate: string;
    endDate: string;
    bonusAmount?: number;
  }
): Promise<{ success: boolean; message: string; target: CommissionTarget }> {
  try {
    const { data } = await api.post<{ success: boolean; message: string; target: CommissionTarget }>(
      '/api/admin/commission/targets',
      targetData
    );
    return data;
  } catch (error) {
    console.error('Create commission target error:', error);
    throw new Error('Failed to create commission target. Please try again.');
  }
}

export async function getCommissionTargets(
  params?: {
    employeeId?: string;
    storeId?: string;
    status?: string;
  }
): Promise<{ success: boolean; targets: CommissionTarget[] }> {
  try {
    const { data } = await api.get<{ success: boolean; targets: CommissionTarget[] }>(
      '/api/admin/commission/targets',
      { params }
    );
    return data;
  } catch (error) {
    console.error('Get commission targets error:', error);
    throw new Error('Failed to fetch commission targets. Please try again.');
  }
}

export async function updateCommissionTarget(
  id: string,
  targetData: {
    achievedAmount?: number;
    status?: string;
    bonusPaid?: boolean;
  }
): Promise<{ success: boolean; message: string; target: CommissionTarget }> {
  try {
    const { data } = await api.put<{ success: boolean; message: string; target: CommissionTarget }>(
      `/api/admin/commission/targets/${id}`,
      targetData
    );
    return data;
  } catch (error) {
    console.error('Update commission target error:', error);
    throw new Error('Failed to update commission target. Please try again.');
  }
}

// Commission Calculation Engine

export async function calculateCommission(
  calculationData: {
    employeeId: string;
    saleAmount: number;
    storeId?: string;
    billId?: string;
    invoiceNumber?: string;
  }
): Promise<{
  success: boolean;
  commission: number;
  commissionPercent?: number;
  policy?: CommissionPolicy;
  employee?: any;
  message?: string;
}> {
  try {
    const { data } = await api.post<{
      success: boolean;
      commission: number;
      commissionPercent?: number;
      policy?: CommissionPolicy;
      employee?: any;
      message?: string;
    }>('/api/admin/commission/calculate', calculationData);
    return data;
  } catch (error) {
    console.error('Calculate commission error:', error);
    throw new Error('Failed to calculate commission. Please try again.');
  }
}

// Commission Dashboard

export async function getCommissionDashboard(
  params?: {
    employeeId?: string;
    storeId?: string;
    branchId?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<{ success: boolean; stats: CommissionDashboardStats }> {
  try {
    const { data } = await api.get<{ success: boolean; stats: CommissionDashboardStats }>(
      '/api/admin/commission/dashboard',
      { params }
    );
    return data;
  } catch (error) {
    console.error('Get commission dashboard error:', error);
    throw new Error('Failed to fetch commission dashboard. Please try again.');
  }
}

// Commission Settlement

export async function createCommissionSettlement(
  settlementData: {
    employeeId: string;
    settlementDate: string;
    notes?: string;
  }
): Promise<{ success: boolean; message: string; settlement: any }> {
  try {
    const { data } = await api.post<{ success: boolean; message: string; settlement: any }>(
      '/api/admin/commission/settlements',
      settlementData
    );
    return data;
  } catch (error) {
    console.error('Create commission settlement error:', error);
    throw new Error('Failed to create commission settlement. Please try again.');
  }
}
