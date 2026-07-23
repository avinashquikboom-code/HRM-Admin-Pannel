import { api, getApiErrorMessage } from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────────────────────────

export type HrPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type HrTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface HrTask {
  id: string;
  title: string;
  description: string | null;
  assignedTo: string;       // Employee.employeeID
  assigneeName: string;     // Resolved by API
  assignedBy: number;       // User.id
  assignerName?: string;    // Resolved by detail endpoint
  priority: HrPriority;
  dueDate: string | null;
  status: HrTaskStatus;
  requiresPhoto?: boolean;
  photoUrl?: string | null;
  photoUrls?: string[];
  overdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HrTaskUpdate {
  id: string;
  taskId: string;
  byUserId: number;
  byName: string;
  oldStatus: HrTaskStatus | null;
  newStatus: HrTaskStatus;
  comment: string | null;
  at: string;
}

export interface TaskStats {
  assigned: number;
  completed: number;
  inProgress: number;
  pending: number;
  cancelled: number;
  overdue: number;
}

export interface ListTasksParams {
  assignedTo?: string;
  status?: HrTaskStatus;
  priority?: HrPriority;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListTasksResponse {
  data: HrTask[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface FixedTaskTemplate {
  id: string;
  title: string;
  description: string;
  priority: HrPriority;
  requiresPhoto: boolean;
}

export const FIXED_TASK_TEMPLATES: FixedTaskTemplate[] = [
  {
    id: 'store_opening',
    title: 'Daily Store Opening & Sanitization Checklist',
    description: 'Verify store cleanliness, inspect counter setup, check POS system display, and capture photo proof of opening state.',
    priority: 'HIGH',
    requiresPhoto: true,
  },
  {
    id: 'store_closing',
    title: 'Store Closing Cash & Security Lockup Verification',
    description: 'Count closing cash register, verify daily ledger slip, capture photo of closed cash drawer, and lock main store entrance.',
    priority: 'HIGH',
    requiresPhoto: true,
  },
  {
    id: 'inventory_audit',
    title: 'Inventory & Shelf Stock Count Audit',
    description: 'Perform physical count of high-demand items, arrange front shelves neatly, and upload photo of display shelves.',
    priority: 'MEDIUM',
    requiresPhoto: true,
  },
  {
    id: 'hygiene_check',
    title: 'Customer Area & Staff Hygiene Inspection',
    description: 'Inspect staff uniforms, sanitize high-touch surfaces, and ensure customer service standards.',
    priority: 'MEDIUM',
    requiresPhoto: false,
  },
  {
    id: 'promo_banner',
    title: 'Promotional Display Stand & Poster Setup',
    description: 'Set up marketing banners at main entrance and capture photo proof of completed promotional arrangement.',
    priority: 'LOW',
    requiresPhoto: true,
  },
];

// ─── API Functions ──────────────────────────────────────────────────────────────

export async function fetchTasks(params: ListTasksParams = {}): Promise<ListTasksResponse> {
  try {
    const { data } = await api.get<{ success: boolean } & ListTasksResponse>('/api/tasks', {
      params,
    });
    return { data: data.data, meta: data.meta };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load tasks.'));
  }
}

export async function fetchTaskStats(assignedTo?: string): Promise<TaskStats> {
  try {
    const { data } = await api.get<{ success: boolean; data: TaskStats }>('/api/tasks/stats', {
      params: assignedTo ? { assignedTo } : {},
    });
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load task stats.'));
  }
}

export async function fetchTask(id: string): Promise<HrTask> {
  try {
    const { data } = await api.get<{ success: boolean; data: HrTask }>(`/api/tasks/${id}`);
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load task.'));
  }
}

export async function fetchTaskHistory(id: string): Promise<HrTaskUpdate[]> {
  try {
    const { data } = await api.get<{ success: boolean; data: HrTaskUpdate[] }>(
      `/api/tasks/${id}/history`
    );
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load task history.'));
  }
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  assignedTo: string;
  priority?: HrPriority;
  dueDate?: string;
  requiresPhoto?: boolean;
  photoUrl?: string;
}

export async function createTask(payload: CreateTaskPayload): Promise<HrTask> {
  try {
    const { data } = await api.post<{ success: boolean; data: HrTask }>('/api/tasks', payload);
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create task.'));
  }
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  assignedTo?: string;
  priority?: HrPriority;
  dueDate?: string | null;
  status?: HrTaskStatus;
  comment?: string;
  requiresPhoto?: boolean;
  photoUrl?: string | null;
}

export async function updateTask(id: string, payload: UpdateTaskPayload): Promise<HrTask> {
  try {
    const { data } = await api.patch<{ success: boolean; data: HrTask }>(
      `/api/tasks/${id}`,
      payload
    );
    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update task.'));
  }
}
