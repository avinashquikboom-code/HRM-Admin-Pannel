import type { User } from '@/store/slices/authSlice';
import { portalForRole, type PortalType } from '@/lib/portals';
import { DEV_AUTH_TOKEN } from '@/lib/devAuth';

function decodeJwt(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

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

  // Recover session from cookie token if localStorage is empty
  const cookieToken = readTokenCookie();
  if (cookieToken && cookieToken !== DEV_AUTH_TOKEN) {
    try {
      const decoded = decodeJwt(cookieToken);
      if (decoded && decoded.email && decoded.role) {
        const portal = portalForRole(decoded.role) ?? 'platform_admin';
        const emailName = decoded.email.split('@')[0];
        const fallbackName =
          emailName.charAt(0).toUpperCase() + emailName.slice(1);

        const session: AuthSession = {
          token: cookieToken,
          user: {
            id: decoded.userId ?? 1,
            email: decoded.email,
            role: decoded.role,
            name: fallbackName,
            avatar: '/favicon.svg',
          },
          portal,
        };
        // Save to localStorage to sync
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
        return session;
      }
    } catch (e) {
      console.error('Failed to recover session from cookie token:', e);
    }
  }

  return null;
}

export function readTokenCookie(): string | null {
  if (!isBrowser()) return null;

  // Try reading hrm_token first
  let match = document.cookie.match(
    new RegExp(`(?:^|; )${AUTH_TOKEN_COOKIE}=([^;]*)`)
  );
  if (match) {
    return decodeURIComponent(match[1]);
  }

  // Fallback to token cookie
  match = document.cookie.match(
    new RegExp(`(?:^|; )token=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function writeTokenCookie(token: string): void {
  if (!isBrowser()) return;

  document.cookie = `${AUTH_TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
  document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
}

function clearTokenCookie(): void {
  if (!isBrowser()) return;

  document.cookie = `${AUTH_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `token=; path=/; max-age=0; SameSite=Lax`;
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
