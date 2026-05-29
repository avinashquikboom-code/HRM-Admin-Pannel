const LOCAL_API_DEFAULT = 'http://localhost:5003';

/**
 * Backend base URL (no trailing slash).
 * - Browser: same-origin `/api/*` → Next.js rewrite → `NEXT_PUBLIC_API_URL`
 * - Server: direct URL to backend (for SSR / server calls)
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '';
  }

  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  return LOCAL_API_DEFAULT;
}

/** Where API traffic is forwarded in dev (shown in errors). */
export function getBackendApiTarget(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  return (fromEnv || LOCAL_API_DEFAULT).replace(/\/$/, '');
}

export function isApiMisconfigured(): boolean {
  return !process.env.NEXT_PUBLIC_API_URL?.trim();
}
