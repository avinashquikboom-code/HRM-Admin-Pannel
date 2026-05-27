import type { User } from '@/store/slices/authSlice';
import type { PortalType } from '@/lib/portals';

/** Super Admin portal — offline demo */
export const SUPER_ADMIN_DEV_EMAIL = 'superadmin@hrm.com';
export const SUPER_ADMIN_DEV_PASSWORD = '123456';
export const LEGACY_SUPER_ADMIN_DEV_EMAIL = 'admin@hrm.com';

/** Admin (HR) portal — offline demo */
export const DEFAULT_PLATFORM_DEV_EMAIL = 'hr@quickboom.com';
export const DEFAULT_PLATFORM_DEV_PASSWORD = '123456';

/** Employee portal — offline demo */
export const EMPLOYEE_DEV_EMAIL = 'employee@quickboom.com';
export const EMPLOYEE_DEV_PASSWORD = '123456';

export const DEV_AUTH_TOKEN = 'dev-local-auth-token';
export const DEV_PLATFORM_AUTH_TOKEN = 'dev-platform-auth-token';
export const DEV_EMPLOYEE_AUTH_TOKEN = 'dev-employee-auth-token';

export function matchesSuperAdminDevCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return (
    password === SUPER_ADMIN_DEV_PASSWORD &&
    (normalizedEmail === SUPER_ADMIN_DEV_EMAIL ||
      normalizedEmail === LEGACY_SUPER_ADMIN_DEV_EMAIL)
  );
}

export function matchesPlatformDevCredentials(email: string, password: string) {
  return (
    email.trim().toLowerCase() === DEFAULT_PLATFORM_DEV_EMAIL &&
    password === DEFAULT_PLATFORM_DEV_PASSWORD
  );
}

export function matchesEmployeeDevCredentials(email: string, password: string) {
  return (
    email.trim().toLowerCase() === EMPLOYEE_DEV_EMAIL &&
    password === EMPLOYEE_DEV_PASSWORD
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
      session.token === DEV_PLATFORM_AUTH_TOKEN ||
      session.token === DEV_EMPLOYEE_AUTH_TOKEN
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
  if (portal === 'super_admin') {
    return {
      token: DEV_AUTH_TOKEN,
      portal,
      user: {
        id: 1,
        name: 'Super Admin',
        email: SUPER_ADMIN_DEV_EMAIL,
        role: 'ADMIN',
        avatar: '/favicon.svg',
        phone: '',
        bio: 'Offline demo super administrator',
        profile: createBaseProfile(
          SUPER_ADMIN_DEV_EMAIL,
          'Super Admin',
          'Super Admin'
        ),
      },
    };
  }

  if (portal === 'employee') {
    return {
      token: DEV_EMPLOYEE_AUTH_TOKEN,
      portal,
      user: {
        id: 3,
        name: 'Rahul Verma',
        email: EMPLOYEE_DEV_EMAIL,
        role: 'EMPLOYEE',
        avatar: '/favicon.svg',
        phone: '',
        bio: 'Offline demo employee',
        profile: createBaseProfile(
          EMPLOYEE_DEV_EMAIL,
          'Rahul Verma',
          'Employee'
        ),
      },
    };
  }

  return {
    token: DEV_PLATFORM_AUTH_TOKEN,
    portal: 'platform_admin',
    user: {
      id: 2,
      name: 'HR Admin',
      email: DEFAULT_PLATFORM_DEV_EMAIL,
      role: 'HR',
      avatar: '/favicon.svg',
      phone: '',
      bio: 'Offline demo platform administrator',
      profile: createBaseProfile(
        DEFAULT_PLATFORM_DEV_EMAIL,
        'HR Admin',
        'HR Manager'
      ),
    },
  };
}
