import type { User } from '@/store/slices/authSlice';
import type { PortalType } from '@/lib/portals';

/** Super Admin portal — offline demo */
export const SUPER_ADMIN_DEV_EMAIL = 'superadmin@hrm.com';
export const SUPER_ADMIN_DEV_PASSWORD = '123456';
/** Also accepts legacy admin email on super-admin login */
export const LEGACY_SUPER_ADMIN_DEV_EMAIL = 'admin@hrm.com';

/** Platform Admin portal — offline demo */
export const DEFAULT_PLATFORM_DEV_EMAIL = 'hr@quickboom.com';
export const DEFAULT_PLATFORM_DEV_PASSWORD = '123456';

/** @deprecated use SUPER_ADMIN_DEV_EMAIL */
export const DEFAULT_DEV_EMAIL = SUPER_ADMIN_DEV_EMAIL;
export const DEFAULT_DEV_PASSWORD = SUPER_ADMIN_DEV_PASSWORD;
export const DEV_AUTH_TOKEN = 'dev-local-auth-token';
export const DEV_PLATFORM_AUTH_TOKEN = 'dev-platform-auth-token';

export function matchesSuperAdminDevCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return (
    password === SUPER_ADMIN_DEV_PASSWORD &&
    (normalizedEmail === SUPER_ADMIN_DEV_EMAIL ||
      normalizedEmail === LEGACY_SUPER_ADMIN_DEV_EMAIL)
  );
}

/** @deprecated use matchesSuperAdminDevCredentials */
export function matchesDevCredentials(email: string, password: string) {
  return matchesSuperAdminDevCredentials(email, password);
}

export function matchesPlatformDevCredentials(email: string, password: string) {
  return (
    email.trim().toLowerCase() === DEFAULT_PLATFORM_DEV_EMAIL &&
    password === DEFAULT_PLATFORM_DEV_PASSWORD
  );
}

export function isDevAuthSession(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const raw = localStorage.getItem('hrm_auth');
    if (!raw) return false;
    const session = JSON.parse(raw) as { token?: string };
    return (
      session.token === DEV_AUTH_TOKEN ||
      session.token === DEV_PLATFORM_AUTH_TOKEN
    );
  } catch {
    return false;
  }
}

function createBaseProfile(email: string, fullName: string, clearanceLabel: string) {
  const now = new Date().toISOString();

  return {
    id: 1,
    userId: 1,
    email,
    fullName,
    phone: '',
    avatarUrl: null,
    timezone: 'Asia/Kolkata',
    timezoneLabel: 'India Standard Time (IST)',
    bio: '',
    security: {
      twoFactorEnabled: false,
      twoFactorStatus: 'Disabled',
      lastLoginAt: now,
      lastLoginLocation: 'Local device',
      clearanceLevel: 5,
      clearanceLabel,
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function createDevAuthSession(portal: PortalType): {
  token: string;
  user: User;
  portal: PortalType;
} {
  const isSuperAdmin = portal === 'super_admin';

  return {
    token: isSuperAdmin ? DEV_AUTH_TOKEN : DEV_PLATFORM_AUTH_TOKEN,
    portal,
    user: {
      id: 1,
      name: isSuperAdmin ? 'Super Admin' : 'HR Admin',
      email: isSuperAdmin ? SUPER_ADMIN_DEV_EMAIL : DEFAULT_PLATFORM_DEV_EMAIL,
      role: isSuperAdmin ? 'ADMIN' : 'HR',
      avatar: '/favicon.svg',
      phone: '',
      bio: isSuperAdmin
        ? 'Offline demo super administrator'
        : 'Offline demo platform administrator',
      profile: createBaseProfile(
        isSuperAdmin ? SUPER_ADMIN_DEV_EMAIL : DEFAULT_PLATFORM_DEV_EMAIL,
        isSuperAdmin ? 'Super Admin' : 'HR Admin',
        isSuperAdmin ? 'Super Admin' : 'HR Manager'
      ),
    },
  };
}
