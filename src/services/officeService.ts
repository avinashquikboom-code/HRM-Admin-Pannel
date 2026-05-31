import { api, getApiErrorMessage } from '@/lib/api';
import { getAuthToken } from '@/lib/authStorage';

interface ApiOffice {
  id: string;
  name: string | null;
  code: string | null;
  address: string | null;
  latitude: string | number;
  longitude: string | number;
  idealRadiusMeters: number | null;
  maxPunchRadiusMeters: number | null;
  isActive: boolean | null;
  subscriptionPlan?: string;
  billingCycle?: string;
  invoiceStatus?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    employees: number;
  };
}

export interface OfficeEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation: string | null;
}

export interface Office {
  id: string;
  name: string;
  code: string | null;
  address: string;
  latitude: number;
  longitude: number;
  idealRadiusMeters: number;
  maxPunchRadiusMeters: number;
  isActive: boolean;
  subscriptionPlan: string;
  billingCycle: string;
  invoiceStatus: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    employees: number;
  };
}

export interface OfficeDetail extends Office {
  employees: OfficeEmployee[];
}

interface OfficesResponse {
  success: boolean;
  offices: ApiOffice[];
}

interface OfficeDetailResponse {
  success: boolean;
  office: ApiOffice & { employees?: OfficeEmployee[] };
}

interface CreateOfficeResponse {
  message: string;
  office: ApiOffice;
}

export interface UpdateOfficeRequest {
  name: string;
  code?: string;
  address: string;
  latitude: number;
  longitude: number;
  idealRadiusMeters: number;
  maxPunchRadiusMeters: number;
  isActive: boolean;
  subscriptionPlan?: string;
  billingCycle?: string;
  invoiceStatus?: string;
}

export type CreateOfficeRequest = Omit<UpdateOfficeRequest, 'isActive'> & {
  isActive?: boolean;
};

interface MutateOfficeResponse {
  message: string;
  office: ApiOffice;
}

function toNumber(value: string | number | null | undefined, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function mapOffice(api: ApiOffice): Office {
  return {
    id: api.id,
    name: api.name?.trim() || 'Unnamed Office',
    code: api.code,
    address: api.address?.trim() || '',
    latitude: toNumber(api.latitude),
    longitude: toNumber(api.longitude),
    idealRadiusMeters: api.idealRadiusMeters ?? 25,
    maxPunchRadiusMeters: api.maxPunchRadiusMeters ?? 50,
    isActive: api.isActive ?? true,
    subscriptionPlan: api.subscriptionPlan || 'Basic',
    billingCycle: api.billingCycle || 'monthly',
    invoiceStatus: api.invoiceStatus || 'Paid',
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
    _count: api._count ?? { employees: 0 },
  };
}

function mapOfficeDetail(api: OfficeDetailResponse['office']): OfficeDetail {
  return {
    ...mapOffice(api),
    employees: api.employees ?? [],
  };
}

function assertOfficeAuthToken() {
  if (!getAuthToken()) {
    throw new Error(
      'Admin token not found. Sign in first — token is stored in hrm_auth / hrm_token (HRM Admin) or super_hrm_auth / super_hrm_token (Super HRM).'
    );
  }
}

export function getMapBoundsForOffice(
  latitude: number,
  longitude: number,
  radiusMeters: number
) {
  const latDelta = (radiusMeters * 4) / 111000;
  const lngDelta =
    (radiusMeters * 4) / (111000 * Math.cos((latitude * Math.PI) / 180));

  return {
    minLat: latitude - latDelta,
    maxLat: latitude + latDelta,
    minLng: longitude - lngDelta,
    maxLng: longitude + lngDelta,
  };
}

export function metersToDegreeRadius(meters: number, latitude: number) {
  const latRadius = meters / 111000;
  const lngRadius =
    meters / (111000 * Math.cos((latitude * Math.PI) / 180));
  return Math.max(latRadius, lngRadius);
}

export async function fetchOffices(): Promise<Office[]> {
  assertOfficeAuthToken();

  try {
    const { data } = await api.get<OfficesResponse>('/api/admin/offices');
    if (!data.success) {
      throw new Error('Failed to load offices');
    }
    return data.offices.map(mapOffice);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load offices. Please try again.')
    );
  }
}

export async function fetchOfficeById(id: string): Promise<OfficeDetail> {
  assertOfficeAuthToken();

  try {
    const { data } = await api.get<OfficeDetailResponse>(
      `/api/admin/offices/${id}`
    );
    if (!data.success) {
      throw new Error('Failed to load office details');
    }
    return mapOfficeDetail(data.office);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load office details. Please try again.')
    );
  }
}

export async function createOffice(
  payload: CreateOfficeRequest
): Promise<{ message: string; office: Office }> {
  assertOfficeAuthToken();

  const body = {
    name: payload.name.trim(),
    code: payload.code?.trim() || undefined,
    address: payload.address.trim(),
    latitude: payload.latitude,
    longitude: payload.longitude,
    idealRadiusMeters: payload.idealRadiusMeters,
    maxPunchRadiusMeters: payload.maxPunchRadiusMeters,
    isActive: payload.isActive ?? true,
    subscriptionPlan: payload.subscriptionPlan,
    billingCycle: payload.billingCycle,
    invoiceStatus: payload.invoiceStatus,
  };

  try {
    const { data } = await api.post<CreateOfficeResponse>(
      '/api/admin/offices',
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      message: data.message,
      office: mapOffice(data.office),
    };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to create office. Please try again.')
    );
  }
}

export async function updateOffice(
  id: string,
  payload: UpdateOfficeRequest
): Promise<{ message: string; office: Office }> {
  assertOfficeAuthToken();

  const body: UpdateOfficeRequest = {
    name: payload.name.trim(),
    code: payload.code?.trim() || undefined,
    address: payload.address.trim(),
    latitude: payload.latitude,
    longitude: payload.longitude,
    idealRadiusMeters: payload.idealRadiusMeters,
    maxPunchRadiusMeters: payload.maxPunchRadiusMeters,
    isActive: payload.isActive,
    subscriptionPlan: payload.subscriptionPlan,
    billingCycle: payload.billingCycle,
    invoiceStatus: payload.invoiceStatus,
  };

  try {
    const { data } = await api.put<MutateOfficeResponse>(
      `/api/admin/offices/${id}`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      message: data.message,
      office: mapOffice(data.office),
    };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to update office. Please try again.')
    );
  }
}

export async function deleteOffice(id: string): Promise<{ message: string }> {
  assertOfficeAuthToken();

  try {
    const { data } = await api.delete<{ message: string }>(
      `/api/admin/offices/${id}`
    );

    return { message: data.message };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to delete office. Please try again.')
    );
  }
}
