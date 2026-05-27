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

const MOCK_LIVE_LOCATIONS: EmployeeLiveLocation[] = [
  { employeeId: 1, name: 'Sarah Johnson', role: 'Senior Developer', lat: 19.0760, lng: 72.8777, status: 'In Office', speed: '0 km/h', battery: '92%' },
  { employeeId: 2, name: 'Michael Chen', role: 'Operations Manager', lat: 19.0820, lng: 72.8820, status: 'In Office', speed: '0 km/h', battery: '85%' },
  { employeeId: 3, name: 'Emma Wilson', role: 'Product Designer', lat: 19.0900, lng: 72.8900, status: 'On Leave', speed: '0 km/h', battery: '95%' },
  { employeeId: 4, name: 'David Miller', role: 'Marketing Lead', lat: 19.0650, lng: 72.8600, status: 'Outside Geofence', speed: '12 km/h', battery: '42%' },
];

export async function fetchLiveLocations(): Promise<EmployeeLiveLocation[]> {
  if (isDevAuthSession()) {
    return MOCK_LIVE_LOCATIONS;
  }

  try {
    const { data } = await api.get<LiveLocationResponse>('/api/admin/location/live');
    return data.employees ?? [];
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load live telemetry locations. Please try again.')
    );
  }
}
