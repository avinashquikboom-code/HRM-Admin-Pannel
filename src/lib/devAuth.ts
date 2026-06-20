import type { User } from '@/store/slices/authSlice';
import type { PortalType } from '@/lib/portals';

/** Super Admin portal — offline demo */
export const SUPER_ADMIN_DEV_EMAIL = 'superadmin@hrm.com';
export const SUPER_ADMIN_DEV_PASSWORD = '123456';
export const LEGACY_SUPER_ADMIN_DEV_EMAIL = 'admin@hrm.com';

/** Admin (HR) portal — offline demo */
export const DEFAULT_PLATFORM_DEV_EMAIL = 'hr@hrm.com';
export const DEFAULT_PLATFORM_DEV_PASSWORD = '123456';

/** Employee portal — offline demo */
export const EMPLOYEE_DEV_EMAIL = 'employee@hrm.com';
export const EMPLOYEE_DEV_PASSWORD = '123456';

export const DEV_AUTH_TOKEN = 'dev-local-auth-token';
export const DEV_PLATFORM_AUTH_TOKEN = 'dev-platform-auth-token';
export const DEV_ADMIN_AUTH_TOKEN = 'dev-admin-auth-token';
export const DEV_EMPLOYEE_AUTH_TOKEN = 'dev-employee-auth-token';

export function matchesSuperAdminDevCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  let currentDevPassword = SUPER_ADMIN_DEV_PASSWORD;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('dev_pwd_super_admin');
    if (saved) {
      currentDevPassword = saved;
    }
  }
  return (
    password.trim() === currentDevPassword &&
    (normalizedEmail === SUPER_ADMIN_DEV_EMAIL ||
      normalizedEmail === LEGACY_SUPER_ADMIN_DEV_EMAIL)
  );
}

export function matchesPlatformDevCredentials(email: string, password: string) {
  let currentDevPassword = DEFAULT_PLATFORM_DEV_PASSWORD;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('dev_pwd_platform_admin');
    if (saved) {
      currentDevPassword = saved;
    }
  }
  return (
    email.trim().toLowerCase() === DEFAULT_PLATFORM_DEV_EMAIL &&
    password.trim() === currentDevPassword
  );
}

export function matchesEmployeeDevCredentials(email: string, password: string) {
  let currentDevPassword = EMPLOYEE_DEV_PASSWORD;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('dev_pwd_employee');
    if (saved) {
      currentDevPassword = saved;
    }
  }
  return (
    email.trim().toLowerCase() === EMPLOYEE_DEV_EMAIL &&
    password.trim() === currentDevPassword
  );
}

export function matchesDevCredentialsForPortal(
  email: string,
  password: string,
  portal: PortalType
) {
  if (portal === 'super_admin') {
    return matchesSuperAdminDevCredentials(email, password);
  }
  if (portal === 'platform_admin') {
    return matchesPlatformDevCredentials(email, password);
  }
  if (portal === 'employee') {
    return matchesEmployeeDevCredentials(email, password);
  }
  return false;
}

export function isDevAuthSession(portal?: PortalType): boolean {
  if (typeof window === 'undefined') return false;

  const portals: PortalType[] = portal
    ? [portal]
    : ['super_admin', 'platform_admin', 'employee'];

  try {
    for (const target of portals) {
      const storageKey =
        target === 'super_admin'
          ? 'super_hrm_auth'
          : target === 'employee'
            ? 'employee_hrm_auth'
            : 'hrm_auth';
      const raw = localStorage.getItem(storageKey);
      if (!raw) continue;

      const session = JSON.parse(raw) as { token?: string };
      if (
        session.token === DEV_AUTH_TOKEN ||
        session.token === DEV_PLATFORM_AUTH_TOKEN ||
        session.token === DEV_ADMIN_AUTH_TOKEN ||
        session.token === DEV_EMPLOYEE_AUTH_TOKEN
      ) {
        return true;
      }
    }
    return false;
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

export function createDevAuthSession(portal: PortalType, role?: string): {
  token: string;
  user: User;
  portal: PortalType;
} {
  if (portal === 'super_admin') {
    const isAdmin = role?.toUpperCase() === 'ADMIN';
    return {
      token: isAdmin ? DEV_ADMIN_AUTH_TOKEN : DEV_AUTH_TOKEN,
      portal,
      user: {
        id: isAdmin ? 14 : 1,
        name: isAdmin ? 'Admin' : 'Super Admin',
        email: isAdmin ? 'admin@hrm.com' : SUPER_ADMIN_DEV_EMAIL,
        role: isAdmin ? 'ADMIN' : 'SUPER_ADMIN',
        avatar: '/favicon.svg',
        phone: '',
        bio: isAdmin ? 'Offline demo administrator' : 'Offline demo super administrator',
        profile: createBaseProfile(
          isAdmin ? 'admin@hrm.com' : SUPER_ADMIN_DEV_EMAIL,
          isAdmin ? 'Admin' : 'Super Admin',
          isAdmin ? 'Admin' : 'Super Admin'
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
