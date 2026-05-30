import { api, getApiErrorMessage } from '@/lib/api';
import { isDevAuthSession } from '@/lib/devAuth';

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

const MOCK_LIVE_LOCATIONS: EmployeeLiveLocation[] = [
  { employeeId: 1, name: 'Sarah Johnson', role: 'Senior Developer', lat: 19.0760, lng: 72.8777, status: 'In Office', speed: '0 km/h', battery: '92%' },
  { employeeId: 2, name: 'Michael Chen', role: 'Operations Manager', lat: 19.0820, lng: 72.8820, status: 'In Office', speed: '0 km/h', battery: '85%' },
  { employeeId: 3, name: 'Emma Wilson', role: 'Product Designer', lat: 19.0900, lng: 72.8900, status: 'On Leave', speed: '0 km/h', battery: '95%' },
  { employeeId: 4, name: 'David Miller', role: 'Marketing Lead', lat: 19.0650, lng: 72.8600, status: 'Outside Geofence', speed: '12 km/h', battery: '42%' },
];

const MOCK_LOGS: GeofenceActivityLog[] = [
  {
    id: 'log-mock-1',
    employeeId: 4,
    name: 'David Miller',
    type: 'Geofence Breach',
    message: 'Crossed outer boundary of Office Geofence Zone',
    lat: 19.0650,
    lng: 72.8600,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'log-mock-2',
    employeeId: 1,
    name: 'Sarah Johnson',
    type: 'Office Check-In',
    message: 'Checked in at Main Entrance Gate',
    lat: 19.0760,
    lng: 72.8777,
    timestamp: new Date().toISOString(),
  }
];

export async function fetchLiveLocations(): Promise<EmployeeLiveLocation[]> {
  try {
    const { data } = await api.get<LiveLocationResponse>('/api/admin/location/live');
    return data.employees ?? [];
  } catch (error) {
    if (isDevAuthSession()) {
      return MOCK_LIVE_LOCATIONS;
    }
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
    if (isDevAuthSession()) {
      return MOCK_LOGS;
    }
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
    if (isDevAuthSession()) {
      return true;
    }
    throw new Error(
      getApiErrorMessage(error, 'Failed to clear activity logs.')
    );
  }
}
