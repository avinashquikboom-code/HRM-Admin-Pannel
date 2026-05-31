import { api, getApiErrorMessage } from '@/lib/api';
export interface EmployeeLiveLocation {
  employeeId: number;
  name: string;
  role: string;
  lat: number;
  lng: number;
  status: string;
  speed: string;
  battery: string;
}

export interface LiveLocationResponse {
  count: number;
  pollIntervalSeconds: number;
  updatedAt: string;
  employees: EmployeeLiveLocation[];
}

export interface GeofenceActivityLog {
  id: string;
  employeeId: number;
  name: string;
  type: string; // 'Office Check-In' | 'Geofence Breach' | 'GPS Reconnected' | 'GPS Disconnected'
  message: string;
  lat: number;
  lng: number;
  timestamp: string;
}

export interface LiveLocationLogsResponse {
  success: boolean;
  count: number;
  logs: GeofenceActivityLog[];
}

export async function fetchLiveLocations(): Promise<EmployeeLiveLocation[]> {
  try {
    const { data } = await api.get<LiveLocationResponse>('/api/admin/location/live');
    return data.employees ?? [];
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load live telemetry locations. Please try again.')
    );
  }
}

export async function fetchLiveLocationLogs(): Promise<GeofenceActivityLog[]> {
  try {
    const { data } = await api.get<LiveLocationLogsResponse>('/api/admin/location/logs');
    return data.logs ?? [];
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load geofence activity logs. Please try again.')
    );
  }
}

export async function clearLiveLocationLogs(): Promise<boolean> {
  try {
    const { data } = await api.post<{ success: boolean }>('/api/admin/location/logs/clear');
    return data.success;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to clear activity logs.')
    );
  }
}
