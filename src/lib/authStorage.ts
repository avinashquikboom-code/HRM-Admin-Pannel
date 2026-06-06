import type { User } from '@/store/slices/authSlice';
import {
  portalForRole,
  normalizeUserRole,
  isSuperAdminPath,
  isEmployeePath,
  SUPER_ADMIN_LOGIN_PATH,
  type PortalType,
} from '@/lib/portals';

export const PORTAL_AUTH_KEYS = {
  super_admin: {
    storageKey: 'super_hrm_auth',
    cookieName: 'super_hrm_token',
    displayName: 'Super HRM',
  },
  platform_admin: {
    storageKey: 'hrm_auth',
    cookieName: 'hrm_token',
    displayName: 'HRM Admin',
  },
  employee: {
    storageKey: 'employee_hrm_auth',
    cookieName: 'employee_hrm_token',
    displayName: 'Employee HRM',
  },
} as const satisfies Record<
  PortalType,
  { storageKey: string; cookieName: string; displayName: string }
>;

/** @deprecated Use portal-specific keys via PORTAL_AUTH_KEYS */
export const AUTH_STORAGE_KEY = PORTAL_AUTH_KEYS.platform_admin.storageKey;
/** @deprecated Use portal-specific keys via PORTAL_AUTH_KEYS */
export const AUTH_TOKEN_COOKIE = PORTAL_AUTH_KEYS.platform_admin.cookieName;

/**
 * The super_admin portal serves two distinct roles (SUPER_ADMIN and ADMIN) that
 * share the same routes. To stop one role's session from overwriting the other,
 * each role gets its own storage key + cookie within the super_admin portal.
 * SUPER_ADMIN keeps the original keys for backward compatibility.
 */
export const SUPER_ROLE_AUTH_KEYS = {
  SUPER_ADMIN: {
    storageKey: PORTAL_AUTH_KEYS.super_admin.storageKey,
    cookieName: PORTAL_AUTH_KEYS.super_admin.cookieName,
    displayName: 'Super HRM',
  },
  ADMIN: {
    storageKey: 'admin_hrm_auth',
    cookieName: 'admin_hrm_token',
    displayName: 'HRM Admin (Admin)',
  },
} as const;

type SuperRole = keyof typeof SUPER_ROLE_AUTH_KEYS;

/** Tracks which super-portal role is currently active (last logged in). */
const SUPER_ACTIVE_ROLE_KEY = 'super_hrm_active_role';

export interface AuthSession {
  token: string;
  user: User;
  portal: PortalType;
}

const ALL_PORTALS: PortalType[] = ['super_admin', 'platform_admin', 'employee'];

function isBrowser() {
  return typeof window !== 'undefined';
}

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Map an arbitrary role string to one of the two super-portal buckets. */
function toSuperRole(role?: string | null): SuperRole {
  return normalizeUserRole(role) === 'ADMIN' ? 'ADMIN' : 'SUPER_ADMIN';
}

function readActiveSuperRole(): SuperRole {
  if (!isBrowser()) return 'SUPER_ADMIN';
  const fromStorage = localStorage.getItem(SUPER_ACTIVE_ROLE_KEY);
  if (fromStorage === 'ADMIN' || fromStorage === 'SUPER_ADMIN') return fromStorage;
  const fromCookie = readCookie(SUPER_ACTIVE_ROLE_KEY);
  if (fromCookie === 'ADMIN' || fromCookie === 'SUPER_ADMIN') return fromCookie;
  return 'SUPER_ADMIN';
}

function writeActiveSuperRole(superRole: SuperRole): void {
  if (!isBrowser()) return;
  localStorage.setItem(SUPER_ACTIVE_ROLE_KEY, superRole);
  writeCookie(SUPER_ACTIVE_ROLE_KEY, superRole);
}

/**
 * Resolve the storage key + cookie name for a portal. For the super_admin
 * portal the bucket also depends on role: pass an explicit role when known
 * (writes), otherwise the active-role marker is used (reads).
 */
export function getPortalAuthKeys(portal: PortalType, role?: string | null) {
  if (portal === 'super_admin') {
    const superRole = role != null ? toSuperRole(role) : readActiveSuperRole();
    return SUPER_ROLE_AUTH_KEYS[superRole];
  }
  return PORTAL_AUTH_KEYS[portal];
}

export function portalFromRoute(
  pathname: string,
  portalParam?: string | null
): PortalType {
  if (portalParam === 'super_admin') return 'super_admin';
  if (portalParam === 'employee') return 'employee';
  if (pathname === SUPER_ADMIN_LOGIN_PATH) return 'super_admin';
  if (isSuperAdminPath(pathname)) return 'super_admin';
  if (isEmployeePath(pathname)) return 'employee';
  return 'platform_admin';
}

export function resolvePortalFromWindow(): PortalType {
  if (!isBrowser()) return 'platform_admin';

  const params = new URLSearchParams(window.location.search);
  return portalFromRoute(window.location.pathname, params.get('portal'));
}

function readCookie(name: string): string | null {
  if (!isBrowser()) return null;

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, token: string): void {
  if (!isBrowser()) return;
  document.cookie = `${name}=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
}

function clearCookie(name: string): void {
  if (!isBrowser()) return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function readTokenCookie(portal: PortalType, role?: string | null): string | null {
  const { cookieName } = getPortalAuthKeys(portal, role);
  const token = readCookie(cookieName);
  if (token) return token;

  // Legacy shared cookies — migrate to the correct portal bucket once.
  if (portal === 'platform_admin') {
    const legacy = readCookie('token');
    if (legacy) return legacy;
  }

  return null;
}

export function writeTokenCookie(token: string, portal: PortalType, role?: string | null): void {
  writeCookie(getPortalAuthKeys(portal, role).cookieName, token);
}

function clearTokenCookie(portal: PortalType, role?: string | null): void {
  clearCookie(getPortalAuthKeys(portal, role).cookieName);

  if (portal === 'platform_admin') {
    clearCookie('token');
  }
}

function buildSessionFromJwt(token: string, portal: PortalType): AuthSession | null {
  const decoded = decodeJwt(token);
  if (!decoded || typeof decoded.email !== 'string' || typeof decoded.role !== 'string') {
    return null;
  }

  const resolvedPortal = portalForRole(decoded.role);
  if (!resolvedPortal || resolvedPortal !== portal) {
    return null;
  }

  const emailName = decoded.email.split('@')[0];
  const fallbackName =
    emailName.charAt(0).toUpperCase() + emailName.slice(1);

  return {
    token,
    user: {
      id: typeof decoded.userId === 'number' ? decoded.userId : 1,
      email: decoded.email,
      role: normalizeUserRole(decoded.role),
      name: fallbackName,
      avatar: '/favicon.svg',
    },
    portal,
  };
}

function readPortalSession(portal: PortalType, role?: string | null): AuthSession | null {
  if (!isBrowser()) return null;

  const { storageKey } = getPortalAuthKeys(portal, role);
  const raw = localStorage.getItem(storageKey);

  if (raw) {
    try {
      const session = JSON.parse(raw) as AuthSession;
      if (session.token && session.user) {
        return {
          ...session,
          portal: session.portal ?? portal,
        };
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
  }

  const cookieToken = readTokenCookie(portal, role);
  if (cookieToken) {
    const session = buildSessionFromJwt(cookieToken, portal);
    if (session) {
      localStorage.setItem(storageKey, JSON.stringify(session));
      return session;
    }
  }

  return null;
}

function migrateLegacySharedStorage(): void {
  if (!isBrowser()) return;

  const legacyRaw = localStorage.getItem('hrm_auth');
  if (!legacyRaw) return;

  try {
    const legacy = JSON.parse(legacyRaw) as AuthSession;
    if (!legacy.token || !legacy.user) return;

    const portal =
      legacy.portal ?? portalForRole(legacy.user.role) ?? 'platform_admin';
    const targetKey = getPortalAuthKeys(portal, legacy.user.role).storageKey;

    if (!localStorage.getItem(targetKey)) {
      localStorage.setItem(
        targetKey,
        JSON.stringify({ ...legacy, portal })
      );
      writeTokenCookie(legacy.token, portal, legacy.user.role);
      if (portal === 'super_admin') {
        writeActiveSuperRole(toSuperRole(legacy.user.role));
      }
    }

    if (portal === 'super_admin') {
      localStorage.removeItem('hrm_auth');
      clearCookie('hrm_token');
      clearCookie('token');
    }
  } catch {
    localStorage.removeItem('hrm_auth');
  }

  const legacyToken = localStorage.getItem('token');
  const legacyUser = localStorage.getItem('user');
  if (legacyToken && legacyUser) {
    try {
      const user = JSON.parse(legacyUser) as User;
      const portal = portalForRole(user.role) ?? 'platform_admin';
      const session: AuthSession = { token: legacyToken, user, portal };
      setAuthSession(session);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
}

/** Read auth session for a specific portal (defaults to current route portal). */
export function getAuthSession(portal?: PortalType, role?: string | null): AuthSession | null {
  if (!isBrowser()) return null;

  migrateLegacySharedStorage();

  const targetPortal = portal ?? resolvePortalFromWindow();
  return readPortalSession(targetPortal, role);
}

/** First portal session found — used when redirecting from public login routes. */
export function getAnyAuthSession(): AuthSession | null {
  for (const portal of ALL_PORTALS) {
    if (portal === 'super_admin') {
      // Check both super-portal role buckets.
      const superSession =
        getAuthSession('super_admin', 'SUPER_ADMIN') ??
        getAuthSession('super_admin', 'ADMIN');
      if (superSession?.token) return superSession;
      continue;
    }
    const session = getAuthSession(portal);
    if (session?.token) return session;
  }
  return null;
}

/** Persist token + user for the session portal only. */
export function setAuthSession(session: AuthSession): void {
  if (!isBrowser()) return;

  const portal = session.portal;
  const role = session.user?.role;
  const { storageKey } = getPortalAuthKeys(portal, role);
  localStorage.setItem(storageKey, JSON.stringify(session));
  writeTokenCookie(session.token, portal, role);

  // Remember which super-portal role is active so reads target the right bucket.
  if (portal === 'super_admin') {
    writeActiveSuperRole(toSuperRole(role));
  }
}

/** Clear auth for one portal without touching the others. */
export function clearAuthSession(portal?: PortalType, role?: string | null): void {
  if (!isBrowser()) return;

  const portals = portal ? [portal] : ALL_PORTALS;

  for (const target of portals) {
    if (target === 'super_admin') {
      // When a role is given, clear only that bucket; otherwise clear both.
      const superRoles: SuperRole[] = role != null ? [toSuperRole(role)] : ['SUPER_ADMIN', 'ADMIN'];
      for (const superRole of superRoles) {
        localStorage.removeItem(SUPER_ROLE_AUTH_KEYS[superRole].storageKey);
        clearCookie(SUPER_ROLE_AUTH_KEYS[superRole].cookieName);
      }
      if (role == null || superRoles.includes(readActiveSuperRole())) {
        localStorage.removeItem(SUPER_ACTIVE_ROLE_KEY);
        clearCookie(SUPER_ACTIVE_ROLE_KEY);
      }
      continue;
    }
    localStorage.removeItem(getPortalAuthKeys(target, role).storageKey);
    clearTokenCookie(target, role);
  }

  if (!portal || portal === 'platform_admin') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

/** JWT for API calls — scoped to the active route portal (and role for super_admin). */
export function getAuthToken(portal?: PortalType, role?: string | null): string | null {
  const targetPortal = portal ?? resolvePortalFromWindow();
  const sessionToken = getAuthSession(targetPortal, role)?.token ?? null;

  // Allow dev tokens for local development
  if (sessionToken) {
    return sessionToken;
  }

  const cookieToken = readTokenCookie(targetPortal, role);
  if (cookieToken) {
    return cookieToken;
  }

  return sessionToken;
}
