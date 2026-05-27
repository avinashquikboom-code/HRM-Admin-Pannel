export type PortalType = 'super_admin' | 'platform_admin' | 'employee';

export const SUPER_ADMIN_LOGIN_PATH = '/super-admin/login';
export const PLATFORM_LOGIN_PATH = '/login';
export const EMPLOYEE_PREFIX = '/employee';

export const SUPER_ADMIN_HOME = '/super-admin';
export const PLATFORM_HOME = '/hr-management';
export const EMPLOYEE_HOME = '/employee';

export const SUPER_ADMIN_PREFIX = '/super-admin';

export const SUPER_ADMIN_ROUTES = [
  SUPER_ADMIN_HOME,
  `${SUPER_ADMIN_PREFIX}/companies`,
  `${SUPER_ADMIN_PREFIX}/subscriptions`,
  `${SUPER_ADMIN_PREFIX}/settings`,
];

export const PUBLIC_PATHS = [
  PLATFORM_LOGIN_PATH,
  SUPER_ADMIN_LOGIN_PATH,
  '/forgot-password',
];

export function isSuperAdminPath(pathname: string) {
  if (pathname === SUPER_ADMIN_LOGIN_PATH) {
    return false;
  }

  return (
    pathname === SUPER_ADMIN_PREFIX ||
    pathname.startsWith(`${SUPER_ADMIN_PREFIX}/`)
  );
}

export function isEmployeePath(pathname: string) {
  return (
    pathname === EMPLOYEE_PREFIX || pathname.startsWith(`${EMPLOYEE_PREFIX}/`)
  );
}

export function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname);
}

export function getLoginPathForPortal(portal: PortalType) {
  if (portal === 'super_admin') {
    return `${PLATFORM_LOGIN_PATH}?portal=super_admin`;
  }
  if (portal === 'employee') {
    return `${PLATFORM_LOGIN_PATH}?portal=employee`;
  }
  return PLATFORM_LOGIN_PATH;
}

export function getHomePathForPortal(portal: PortalType) {
  if (portal === 'super_admin') return SUPER_ADMIN_HOME;
  if (portal === 'employee') return EMPLOYEE_HOME;
  return PLATFORM_HOME;
}

export function normalizeUserRole(role: string | undefined | null) {
  return (role ?? '').trim().toUpperCase();
}

export function roleAllowedForPortal(
  role: string | undefined | null,
  portal: PortalType
) {
  const normalized = normalizeUserRole(role);

  if (portal === 'super_admin') {
    return normalized === 'ADMIN';
  }

  if (portal === 'platform_admin') {
    return normalized === 'HR';
  }

  if (portal === 'employee') {
    return normalized === 'EMPLOYEE';
  }

  return false;
}

export function getProfileBasePath(pathname: string) {
  if (
    pathname === SUPER_ADMIN_PREFIX ||
    (pathname.startsWith(`${SUPER_ADMIN_PREFIX}/`) &&
      pathname !== SUPER_ADMIN_LOGIN_PATH)
  ) {
    return `${SUPER_ADMIN_PREFIX}/profile`;
  }

  if (isEmployeePath(pathname)) {
    return `${EMPLOYEE_PREFIX}/profile`;
  }

  return '/profile';
}

export function portalForRole(role: string | undefined | null): PortalType | null {
  const normalized = normalizeUserRole(role);

  if (normalized === 'ADMIN') {
    return 'super_admin';
  }

  if (normalized === 'HR') {
    return 'platform_admin';
  }

  if (normalized === 'EMPLOYEE') {
    return 'employee';
  }

  return null;
}

export function portalFromLoginParam(value: string | null): PortalType {
  if (value === 'super_admin') return 'super_admin';
  return 'platform_admin';
}
