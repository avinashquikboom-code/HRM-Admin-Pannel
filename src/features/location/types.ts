export interface LocationLog {
  id: string;
  employeeName: string;
  event: string;
  description: string;
  timestamp: string;
  coordinates: string;
}

export type LocationStatusFilter = 'All' | 'In Office' | 'Outside' | 'On Leave';

export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface MapCenter {
  lat: number;
  lng: number;
}
