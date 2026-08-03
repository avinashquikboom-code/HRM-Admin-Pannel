import { api } from '@/lib/api';

export interface ShiftRuleRecord {
  id: string;
  title: string;
  content: string;
  shiftType: string | null;
  branchId: string | null;
  isActive: boolean;
  priority: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isNew?: boolean;
}

export interface CreateShiftRuleInput {
  title: string;
  content: string;
  shiftType?: string | null;
  branchId?: string | null;
  priority?: number;
}

export interface UpdateShiftRuleInput {
  title?: string;
  content?: string;
  shiftType?: string | null;
  branchId?: string | null;
  isActive?: boolean;
  priority?: number;
}

export async function fetchHrShiftRules(params?: {
  shiftType?: string;
  branchId?: string;
  search?: string;
}): Promise<ShiftRuleRecord[]> {
  const { data } = await api.get<{ success: boolean; data: ShiftRuleRecord[] }>(
    '/api/hr/shift-rules',
    { params }
  );
  return data.data || [];
}

export async function createHrShiftRule(input: CreateShiftRuleInput): Promise<ShiftRuleRecord> {
  const { data } = await api.post<{ success: boolean; data: ShiftRuleRecord }>(
    '/api/hr/shift-rules',
    input
  );
  return data.data;
}

export async function updateHrShiftRule(id: string, input: UpdateShiftRuleInput): Promise<ShiftRuleRecord> {
  const { data } = await api.patch<{ success: boolean; data: ShiftRuleRecord }>(
    `/api/hr/shift-rules/${id}`,
    input
  );
  return data.data;
}

export async function deleteHrShiftRule(id: string): Promise<void> {
  await api.delete(`/api/hr/shift-rules/${id}`);
}
