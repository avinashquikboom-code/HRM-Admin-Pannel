import { api } from '@/lib/api';

export interface RemoteWorkEmployeeInfo {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation: string | null;
  office: { name: string } | null;
}

export interface RemoteWorkRequestRecord {
  id: string;
  employeeId: string;
  fromDate: string;
  toDate: string;
  reason: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';
  appliedOn: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: RemoteWorkEmployeeInfo | null;
}

export async function fetchHrRemoteWorkRequests(status?: string): Promise<RemoteWorkRequestRecord[]> {
  const params = status && status !== 'ALL' ? { status } : {};
  const { data } = await api.get<{ success: boolean; data: RemoteWorkRequestRecord[] }>(
    '/api/hr/remote-work/requests',
    { params }
  );
  return data.data || [];
}

export async function reviewHrRemoteWorkRequest(
  id: string,
  status: 'APPROVED' | 'REJECTED' | 'REVOKED',
  reviewNote?: string
): Promise<RemoteWorkRequestRecord> {
  const { data } = await api.patch<{ success: boolean; data: RemoteWorkRequestRecord }>(
    `/api/hr/remote-work/${id}`,
    { status, reviewNote }
  );
  return data.data;
}
