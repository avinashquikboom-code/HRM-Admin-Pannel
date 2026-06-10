import { api, getApiErrorMessage } from '@/lib/api';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  actionId?: string;
  actionType?: string;
  employee?: {
    id: string;
    employeeCode: string;
    name: string;
  };
}

export interface NotificationsResponse {
  notifications: AdminNotification[];
}

export async function fetchNotifications(): Promise<NotificationsResponse> {
  try {
    const { data } = await api.get<NotificationsResponse>('/api/admin/notifications');
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load notifications. Please try again.')
    );
  }
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<{ message: string }> {
  try {
    const { data } = await api.put<{ message: string }>(
      `/api/admin/notifications/${notificationId}/read`
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to mark notification as read.')
    );
  }
}

export async function markAllNotificationsAsRead(): Promise<{ message: string }> {
  try {
    const { data } = await api.put<{ message: string }>(
      '/api/admin/notifications/read-all'
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to mark all notifications as read.')
    );
  }
}

export async function sendNotificationToEmployee(payload: {
  employeeId: number;
  title: string;
  body: string;
  category?: string;
  actionType?: string;
}): Promise<{ message: string }> {
  try {
    const { data } = await api.post<{ message: string }>(
      '/api/hr/notifications/send',
      payload
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to send notification.')
    );
  }
}

export async function broadcastAnnouncement(payload: {
  title: string;
  body: string;
  category?: string;
}): Promise<{ message: string }> {
  try {
    const { data } = await api.post<{ message: string }>(
      '/api/hr/announcements/broadcast',
      payload
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to broadcast announcement.')
    );
  }
}

/**
 * Send a mobile push notification to an employee when they are added to an office.
 * Silently swallows errors so it never blocks the main operation.
 */
export async function sendOfficeAssignedNotification(payload: {
  employeeId: number;
  employeeName: string;
  officeName: string;
}): Promise<void> {
  try {
    await api.post('/api/hr/notifications/send', {
      employeeId: payload.employeeId,
      title: '🏢 Welcome to Your Office!',
      body: `Hi ${payload.employeeName}, you have been assigned to ${payload.officeName}. Please check the Employee Portal for your schedule and attendance details.`,
      category: 'office_assignment',
      actionType: 'office_assigned',
    });
  } catch (err) {
    console.warn(
      `[Notification] Office assignment notification failed for employee ${payload.employeeId}:`,
      err
    );
  }
}
