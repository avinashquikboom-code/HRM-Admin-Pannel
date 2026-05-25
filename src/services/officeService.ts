import { api, getApiErrorMessage } from '@/lib/api';

export interface OfficeEmployee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation: string;
}

export interface Office {
  id: number;
  name: string;
  code: string;
  address: string;
  latitude: number;
  longitude: number;
  idealRadiusMeters: number;
  maxPunchRadiusMeters: number;
  isActive: boolean;
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
  offices: Office[];
}

interface OfficeDetailResponse {
  office: OfficeDetail;
}

interface CreateOfficeResponse {
  message: string;
  office: Office;
}

export interface CreateOfficeRequest {
  name: string;
  code: string;
  address: string;
  latitude: number;
  longitude: number;
  idealRadiusMeters: number;
  maxPunchRadiusMeters: number;
  isActive?: boolean;
}

export type UpdateOfficeRequest = CreateOfficeRequest;

interface MutateOfficeResponse {
  message: string;
  office: Office;
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
  try {
    const { data } = await api.get<OfficesResponse>('/api/admin/offices');
    return data.offices;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load offices. Please try again.')
    );
  }
}

export async function fetchOfficeById(id: number): Promise<OfficeDetail> {
  try {
    const { data } = await api.get<OfficeDetailResponse>(
      `/api/admin/offices/${id}`
    );
    return data.office;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load office details. Please try again.')
    );
  }
}

export async function createOffice(
  payload: CreateOfficeRequest
): Promise<{ message: string; office: Office }> {
  try {
    const { data } = await api.post<CreateOfficeResponse>(
      '/api/admin/offices',
      {
        ...payload,
        isActive: payload.isActive ?? true,
      }
    );

    return {
      message: data.message,
      office: data.office,
    };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to create office. Please try again.')
    );
  }
}

export async function updateOffice(
  id: number,
  payload: UpdateOfficeRequest
): Promise<{ message: string; office: Office }> {
  try {
    const { data } = await api.put<MutateOfficeResponse>(
      `/api/admin/offices/${id}`,
      {
        ...payload,
        isActive: payload.isActive ?? true,
      }
    );

    return {
      message: data.message,
      office: data.office,
    };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to update office. Please try again.')
    );
  }
}

export async function deleteOffice(id: number): Promise<{ message: string }> {
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
