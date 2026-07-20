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
