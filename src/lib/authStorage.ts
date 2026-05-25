import type { User } from '@/store/slices/authSlice';

/** Single localStorage key — shared reference for auth across the app */
export const AUTH_STORAGE_KEY = 'hrm_auth';

export interface AuthSession {
  token: string;
  user: User;
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
        return session;
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

/** Persist token + user together in localStorage */
export function setAuthSession(session: AuthSession): void {
  if (!isBrowser()) return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

/** Clear auth from localStorage */
export function clearAuthSession(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/** Get JWT token — used by API client */
export function getAuthToken(): string | null {
  return getAuthSession()?.token ?? null;
}
