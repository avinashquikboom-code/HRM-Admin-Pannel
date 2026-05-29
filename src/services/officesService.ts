import { getAuthToken } from '@/lib/authStorage';

export interface Office {
  id: number;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  idealRadiusMeters: number;
  maxPunchRadiusMeters: number;
  isActive: boolean;
}

export async function fetchOffices(): Promise<Office[]> {
  const token = await getAuthToken();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/offices`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to fetch offices: ${err}`);
  }

  const data = await response.json();
  // Assuming response shape { offices: [...] }
  return data.offices as Office[];
}
