import type { User } from '@/store/slices/authSlice';
import type { PortalType } from '@/lib/portals';
import { DEV_AUTH_TOKEN } from '@/lib/devAuth';

/** Single localStorage key — shared reference for auth across the app */
export const AUTH_STORAGE_KEY = 'hrm_auth';
export const AUTH_TOKEN_COOKIE = 'hrm_token';

export interface AuthSession {
  token: string;
  user: User;
  portal: PortalType;
}

function isBrowser() {
  return typeof window !== 'undefined';
}

/** Read auth session from localStorage (shared reference) */
export function getAuthSession(): AuthSession | null {
  if (!isBrowser()) return null;

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (raw) {
    try {
      const session = JSON.parse(raw) as AuthSession;
      if (session.token && session.user) {
        return {
          ...session,
          portal: session.portal ?? 'platform_admin',
        };
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  // Migrate legacy separate keys
  const legacyToken = localStorage.getItem('token');
  const legacyUser = localStorage.getItem('user');
  if (legacyToken && legacyUser) {
    try {
      const session: AuthSession = {
        token: legacyToken,
        user: JSON.parse(legacyUser) as User,
        portal: 'platform_admin',
      };
      setAuthSession(session);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return session;
    } catch {
      clearAuthSession();
    }
  }

  return null;
}

function readTokenCookie(): string | null {
  if (!isBrowser()) return null;

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${AUTH_TOKEN_COOKIE}=([^;]*)`)
  );

  return match ? decodeURIComponent(match[1]) : null;
}

function writeTokenCookie(token: string): void {
  if (!isBrowser()) return;

  document.cookie = `${AUTH_TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
}

function clearTokenCookie(): void {
  if (!isBrowser()) return;

  document.cookie = `${AUTH_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

/** Persist token + user together in localStorage and cookie */
export function setAuthSession(session: AuthSession): void {
  if (!isBrowser()) return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  writeTokenCookie(session.token);
}

/** Clear auth from localStorage and cookie */
export function clearAuthSession(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  clearTokenCookie();
}

/** Get JWT token — used by API client (localStorage + cookie fallback) */
export function getAuthToken(): string | null {
  const sessionToken = getAuthSession()?.token ?? null;
  if (sessionToken && sessionToken !== DEV_AUTH_TOKEN) {
    return sessionToken;
  }

  const cookieToken = readTokenCookie();
  if (cookieToken && cookieToken !== DEV_AUTH_TOKEN) {
    return cookieToken;
  }

  return sessionToken;
}
