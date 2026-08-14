import { api } from '@/lib/api';

export interface AccessRequestEmployeeInfo {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName?: string;
  department?: { name: string } | null;
  office?: { name: string } | null;
}

export interface AccessRequestRecord {
  id: string;
  employeeId: number;
  featureName: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedOn: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  employee: AccessRequestEmployeeInfo;
}

export async function fetchAccessRequests(status?: string): Promise<AccessRequestRecord[]> {
  const params = status && status !== 'ALL' ? { status } : {};
  const { data } = await api.get<{ success: boolean; data: AccessRequestRecord[] }>(
    '/api/access-requests',
    { params }
  );
  return data.data || [];
}

export async function approveAccessRequestApi(id: string, reviewNote?: string): Promise<AccessRequestRecord> {
  const { data } = await api.post<{ success: boolean; data: AccessRequestRecord }>(
    `/api/access-requests/${id}/approve`,
    { reviewNote }
  );
  return data.data;
}

export async function rejectAccessRequestApi(id: string, reviewNote?: string): Promise<AccessRequestRecord> {
  const { data } = await api.post<{ success: boolean; data: AccessRequestRecord }>(
    `/api/access-requests/${id}/reject`,
    { reviewNote }
  );
  return data.data;
}
