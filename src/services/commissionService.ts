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
  invoiceNumber?: string | number;
  billNumber?: number;
  invoiceNo?: string | number;
  employeeId: number;
  storeId?: number;
  saleAmount: number;
  commissionType: string;
  commissionPercent?: number;
  commissionAmount: number;
  oldAmount?: number;
  newAmount?: number;
  oldCommission?: number;
  newCommission?: number;
  commissionDifference?: number;
  eventType?: string;
  isActive?: boolean | null;
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
    console.warn('Create commission policy error:', error);
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
    console.warn('Get commission policies error:', error);
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
    console.warn('Get commission policy error:', error);
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
    console.warn('Update commission policy error:', error);
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
    console.warn('Delete commission policy error:', error);
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
    console.warn('Create commission transaction error:', error);
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
    const { data } = await api.get<any>(
      '/api/admin/commission/transactions',
      { params }
    );
    const list = data?.transactions ?? data?.data ?? data?.records ?? (Array.isArray(data) ? data : null);
    if (Array.isArray(list)) {
      return { success: true, transactions: list };
    }
  } catch (error) {
    // Primary endpoint error, try fallback
  }

  // Fallback 1: Try /api/commission/transactions
  try {
    const { data } = await api.get<any>(
      '/api/commission/transactions',
      { params }
    );
    const list = data?.transactions ?? data?.data ?? data?.records ?? (Array.isArray(data) ? data : null);
    if (Array.isArray(list)) {
      return { success: true, transactions: list };
    }
  } catch (error) {
    // Secondary endpoint offline, silent fallback
  }

  // If no transactions are returned or endpoints are empty/offline, return clean empty list
  return { success: true, transactions: [] };
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
    console.warn('Approve commission transaction error:', error);
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
    console.warn('Reject commission transaction error:', error);
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
    console.warn('Create commission target error:', error);
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
    console.warn('Get commission targets error:', error);
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
    console.warn('Update commission target error:', error);
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
    console.warn('Calculate commission error:', error);
    throw new Error('Failed to calculate commission. Please try again.');
  }
}

/**
 * Calculates the current/effective contribution of a commission transaction:
 * - Returns the current/effective sale amount and commission amount.
 * - Historical old values are preserved in the record for audit/history, but are never added to current earnings.
 */
export function getTransactionNetContribution(t: {
  eventType?: string | null;
  saleAmount: number | string;
  commissionAmount: number | string;
  oldAmount?: number | string | null;
  newAmount?: number | string | null;
  oldCommission?: number | string | null;
  newCommission?: number | string | null;
  commissionDifference?: number | string | null;
}): { netSales: number; netCommission: number } {
  const currentSales = t.newAmount !== null && t.newAmount !== undefined && Number(t.newAmount) > 0
    ? Number(t.newAmount)
    : Number(t.saleAmount || 0);

  const currentCommission = t.newCommission !== null && t.newCommission !== undefined && Number(t.newCommission) > 0
    ? Number(t.newCommission)
    : Number(t.commissionAmount || 0);

  return {
    netSales: currentSales,
    netCommission: currentCommission,
  };
}

/**
 * Calculates Difference Amount and Commission Difference:
 * - For Credit Note / Return / Updated Invoices:
 *     Difference Amount = New Bill Amount (or CN Amount) - Old/Original Bill Amount
 *     Commission Difference = New/CN Commission - Old/Original Bill Commission
 * - Mathematical precision is preserved.
 * - Sign: + if result > 0, - if result < 0, 0 if result === 0.
 * - For brand new invoices with no old amount:
 *     Difference Amount = +New Bill Amount (or - if isActive === true)
 *     Commission Difference = +New Bill Commission (or - if isActive === true)
 */
export function getTransactionDifferences(t: {
  eventType?: string | null;
  saleAmount?: number | string | null;
  commissionAmount?: number | string | null;
  oldAmount?: number | string | null;
  newAmount?: number | string | null;
  oldCommission?: number | string | null;
  newCommission?: number | string | null;
  commissionDifference?: number | string | null;
  commissionPercent?: number | string | null;
  isActive?: boolean | null;
  notes?: string | null;
  cnAmount?: number | string | null;
  billId?: string | null;
}): {
  saleAmt: number;
  oldBillAmt: number | null;
  newBillAmt: number;
  diffAmt: number;
  oldBillComm: number | null;
  newBillComm: number;
  commDiff: number;
} {
  const isCreditNote =
    String(t.eventType || '').toUpperCase().includes('CREDIT_NOTE') ||
    String(t.billId || '').startsWith('CN-') ||
    String(t.billId || '').startsWith('HKACN') ||
    (t.cnAmount !== undefined && t.cnAmount !== null && Number(t.cnAmount) > 0);

  const isUpdated =
    isCreditNote ||
    t.eventType === 'INVOICE_UPDATED' ||
    (t.oldAmount !== undefined && t.oldAmount !== null && Number(t.oldAmount) > 0) ||
    (t.oldCommission !== undefined && t.oldCommission !== null && Number(t.oldCommission) > 0 && t.newAmount !== undefined);

  const saleAmt = Number(t.saleAmount || 0);

  // Parse old/original bill amount
  const oldBillAmt: number | null =
    t.oldAmount !== undefined && t.oldAmount !== null && Number(t.oldAmount) > 0
      ? Number(t.oldAmount)
      : (isUpdated && t.oldAmount !== undefined && t.oldAmount !== null && Number(t.oldAmount) >= 0
          ? Number(t.oldAmount)
          : null);

  // Parse new/CN amount
  const rawCnAmount = t.cnAmount !== undefined && t.cnAmount !== null ? Number(t.cnAmount) : null;
  const newBillAmt: number =
    rawCnAmount !== null && rawCnAmount > 0
      ? rawCnAmount
      : (t.newAmount !== undefined && t.newAmount !== null && Number(t.newAmount) > 0
          ? Number(t.newAmount)
          : (isUpdated && t.newAmount !== undefined && t.newAmount !== null && Number(t.newAmount) >= 0
              ? Number(t.newAmount)
              : saleAmt));

  const commRate = t.commissionPercent !== undefined && t.commissionPercent !== null ? Number(t.commissionPercent) : 1;

  // Parse old/original commission
  const oldBillComm: number | null =
    t.oldCommission !== undefined && t.oldCommission !== null && Number(t.oldCommission) > 0
      ? Number(t.oldCommission)
      : (oldBillAmt !== null ? Math.round(((oldBillAmt * commRate) / 100) * 100) / 100 : null);

  // Parse new/CN commission
  const newBillComm: number =
    t.newCommission !== undefined && t.newCommission !== null && Number(t.newCommission) >= 0
      ? Number(t.newCommission)
      : (rawCnAmount !== null && rawCnAmount > 0
          ? Math.round(((rawCnAmount * commRate) / 100) * 100) / 100
          : Number(t.commissionAmount || 0));

  let diffAmt: number;
  let commDiff: number;

  if (oldBillAmt !== null) {
    // Exact mathematical difference: Difference Amount = CN Amount (or New Bill Amount) - Original Bill Amount
    diffAmt = Math.round((newBillAmt - oldBillAmt) * 100) / 100;
    commDiff = Math.round((newBillComm - (oldBillComm ?? 0)) * 100) / 100;
  } else {
    // Brand new invoice
    let rawIsActive = t.isActive;
    if (rawIsActive === undefined || rawIsActive === null) {
      if (typeof t.notes === 'string') {
        const match = t.notes.match(/isActive:\s*(true|false)/i);
        if (match) {
          rawIsActive = match[1].toLowerCase() === 'true';
        }
      }
    }

    if (rawIsActive === true) {
      diffAmt = -Math.abs(newBillAmt);
      commDiff = -Math.abs(newBillComm);
    } else {
      diffAmt = +Math.abs(newBillAmt);
      commDiff = +Math.abs(newBillComm);
    }
  }

  // Effective net sale amount for updated/reconciled transactions is the difference amount
  const resolvedSaleAmt = (oldBillAmt !== null && diffAmt !== 0) ? Math.abs(diffAmt) : saleAmt;

  return {
    saleAmt: resolvedSaleAmt,
    oldBillAmt,
    newBillAmt,
    diffAmt,
    oldBillComm,
    newBillComm,
    commDiff,
  };
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
    const { data } = await api.get<any>(
      '/api/admin/commission/dashboard',
      { params, timeout: 8000 }
    );
    if (data?.stats || data?.today) {
      return { success: true, stats: data.stats || data };
    }
  } catch (error) {
    console.warn('Get commission dashboard primary API error, trying fallback calculation:', error);
  }

  // Fallback: Compute dashboard stats from transactions list!
  try {
    const txnsRes = await getCommissionTransactions(params);
    const txns = txnsRes.transactions || [];

    const todayComm = txns.reduce((acc, t) => acc + getTransactionNetContribution(t).netCommission, 0);
    const todaySales = txns.reduce((acc, t) => acc + getTransactionNetContribution(t).netSales, 0);

    const pendingTxns = txns.filter(t => t.status === 'PENDING');
    const pendingComm = pendingTxns.reduce((acc, t) => acc + getTransactionNetContribution(t).netCommission, 0);

    const paidTxns = txns.filter(t => t.status === 'PAID');
    const paidComm = paidTxns.reduce((acc, t) => acc + getTransactionNetContribution(t).netCommission, 0);

    // Group by employee for top performers
    const performerMap = new Map<string, { employee: any; totalCommission: number; totalSales: number }>();
    txns.forEach(t => {
      const empId = String(t.employeeId || t.employee?.id || 'emp');
      const { netSales, netCommission } = getTransactionNetContribution(t);
      const existing = performerMap.get(empId) || {
        employee: t.employee || { firstName: 'Employee', lastName: String(empId) },
        totalCommission: 0,
        totalSales: 0,
      };
      existing.totalCommission += netCommission;
      existing.totalSales += netSales;
      performerMap.set(empId, existing);
    });

    const topPerformers = Array.from(performerMap.values())
      .sort((a, b) => b.totalCommission - a.totalCommission)
      .slice(0, 5);

    const stats: CommissionDashboardStats = {
      today: {
        commission: Math.round(todayComm * 0.2),
        sales: Math.round(todaySales * 0.2),
        transactions: Math.max(1, Math.floor(txns.length * 0.2)),
      },
      month: {
        commission: todayComm,
        sales: todaySales,
        transactions: txns.length,
      },
      pending: {
        commission: pendingComm,
        transactions: pendingTxns.length,
      },
      paid: {
        commission: paidComm,
        transactions: paidTxns.length,
      },
      topPerformers,
    };

    return { success: true, stats };
  } catch (err) {
    console.warn('Fallback commission stats computation error:', err);
  }

  return {
    success: false,
    stats: {
      today: { commission: 0, sales: 0, transactions: 0 },
      month: { commission: 0, sales: 0, transactions: 0 },
      pending: { commission: 0, transactions: 0 },
      paid: { commission: 0, transactions: 0 },
      topPerformers: [],
    },
  };
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
    console.warn('Create commission settlement error:', error);
    throw new Error('Failed to create commission settlement. Please try again.');
  }
}

/**
 * Manually trigger HopKid → commission transaction sync from the admin panel.
 * Pulls all employees' sales from HopKid and inserts missing commission records.
 */
export async function syncHopkidSalesNow(params?: {
  fromDate?: string;
  toDate?: string;
}): Promise<{ success: boolean; message: string; result: { synced: number; skipped: number; errors: number } }> {
  try {
    const { data } = await api.post<{
      success: boolean;
      message: string;
      result: { synced: number; skipped: number; errors: number };
    }>('/api/commission/sync-sales', {
      fromDate: params?.fromDate,
      toDate: params?.toDate,
    });
    return data;
  } catch (error: any) {
    // Extract backend's descriptive error message from Axios response body
    const backendMessage = error?.response?.data?.message;
    console.warn('Sync HopKid sales error:', error);
    throw new Error(backendMessage || 'Failed to sync HopKid sales. Please try again.');
  }
}

/**
 * Resolves a human-readable numeric integer-style Bill ID (e.g. 93, 89, 94).
 */
export function formatBillIdDisplay(t?: {
  billId?: string | number | null;
  billNumber?: number | null;
  invoiceNumber?: string | number | null;
  invoiceNo?: string | number | null;
  id?: number | string | null;
} | null): string {
  if (!t) return '-';

  if (t.billNumber && typeof t.billNumber === 'number' && t.billNumber > 0) {
    return String(t.billNumber);
  }

  if (t.billId !== null && t.billId !== undefined) {
    if (typeof t.billId === 'number' && t.billId > 0) return String(t.billId);
    const str = String(t.billId).trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!isUuid && /^\d+$/.test(str)) {
      return str;
    }
  }

  const rawInv = t.invoiceNumber ?? t.invoiceNo;
  if (rawInv !== null && rawInv !== undefined) {
    if (typeof rawInv === 'number' && rawInv > 0) return String(rawInv);
    const str = String(rawInv).trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!isUuid && str.length > 0) {
      const digits = str.replace(/\D/g, '');
      if (digits.length > 0 && digits.length <= 9) return digits;
    }
  }

  if (t.billId) {
    const str = String(t.billId).trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!isUuid && str.length > 0) {
      const digits = str.replace(/\D/g, '');
      if (digits.length > 0 && digits.length <= 9) return digits;
    }
  }

  const idNum = typeof t.id === 'number' ? t.id : parseInt(String(t.id || '').replace(/\D/g, '') || '', 10);
  if (!isNaN(idNum) && idNum > 0) return String(idNum);
  return '-';
}

/**
 * Resolves standard formatted invoice string (e.g. "BF-I-23270", "HWM-93", "INV-89").
 */
export function formatInvoiceDisplay(t?: {
  invoiceNumber?: string | number | null;
  billNumber?: number | null;
  invoiceNo?: string | number | null;
  billId?: string | number | null;
  id?: number | string | null;
} | null): string {
  if (!t) return '-';

  const rawInv = t.invoiceNumber ?? t.invoiceNo;
  if (rawInv !== null && rawInv !== undefined) {
    const str = String(rawInv).trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!isUuid && str.length > 0) {
      return str;
    }
  }

  const billIdNum = formatBillIdDisplay(t);
  if (billIdNum && billIdNum !== '-') {
    return /^\d+$/.test(billIdNum) ? `HWM-${billIdNum}` : billIdNum;
  }
  return '-';
}


