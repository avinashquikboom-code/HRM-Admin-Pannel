const GEO_TIMEOUT_MS = 8000;

function formatPlace(city?: string, region?: string, countryCode?: string): string | null {
  const place = city || region;
  if (!place) return null;
  if (countryCode) {
    return `${place}, ${countryCode.toUpperCase()}`;
  }
  return place;
}

async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('format', 'json');
    url.searchParams.set('lat', String(latitude));
    url.searchParams.set('lon', String(longitude));

    const response = await fetch(url.toString(), {
      headers: { 'Accept-Language': 'en' },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      address?: {
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        country_code?: string;
      };
    };

    const address = data.address;
    if (!address) return null;

    return (
      formatPlace(
        address.city || address.town || address.village,
        address.state,
        address.country_code
      ) ?? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    );
  } catch {
    return null;
  }
}

function getBrowserPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation unavailable'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: GEO_TIMEOUT_MS,
      maximumAge: 5 * 60 * 1000,
    });
  });
}

async function resolveLocationFromIp(): Promise<string | null> {
  try {
    const response = await fetch(
      'https://ip-api.com/json/?fields=status,city,regionName,countryCode',
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as {
      status?: string;
      city?: string;
      regionName?: string;
      countryCode?: string;
    };

    if (data.status !== 'success') return null;

    return formatPlace(data.city, data.regionName, data.countryCode);
  } catch {
    return null;
  }
}

function resolveLocationFromTimezone(): string {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone === 'Asia/Kolkata') return 'India';
    return timezone.replace(/_/g, ' ');
  } catch {
    return 'Unknown location';
  }
}

/** Quick location for login — avoids long GPS wait blocking sign-in */
export async function resolveLoginLocationQuick(): Promise<string> {
  try {
    const fromIp = await Promise.race([
      fetch(
        'https://ip-api.com/json/?fields=status,city,regionName,countryCode',
        { signal: AbortSignal.timeout(2000) }
      ).then(async (response) => {
        if (!response.ok) return null;
        const data = (await response.json()) as {
          status?: string;
          city?: string;
          regionName?: string;
          countryCode?: string;
        };
        if (data.status !== 'success') return null;
        return formatPlace(data.city, data.regionName, data.countryCode);
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
    ]);

    if (fromIp) return fromIp;
  } catch {
    // fall through
  }

  return resolveLocationFromTimezone();
}

/** Resolve a human-readable location for login (GPS → IP → timezone). */
export async function resolveLoginLocation(): Promise<string> {
  try {
    const position = await getBrowserPosition();
    const fromGps = await reverseGeocode(
      position.coords.latitude,
      position.coords.longitude
    );
    if (fromGps) return fromGps;
  } catch {
    // GPS denied or unavailable — fall through
  }

  return resolveLoginLocationQuick();
}

export const LOGIN_LOCATION_BANNER_KEY = 'hrm_login_location_banner';

export function setLoginLocationBanner(location: string) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(LOGIN_LOCATION_BANNER_KEY, location);
}

export function consumeLoginLocationBanner(): string | null {
  if (typeof window === 'undefined') return null;
  const location = sessionStorage.getItem(LOGIN_LOCATION_BANNER_KEY);
  if (location) {
    sessionStorage.removeItem(LOGIN_LOCATION_BANNER_KEY);
  }
  return location;
}
