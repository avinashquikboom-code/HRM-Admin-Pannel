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
  `${SUPER_ADMIN_PREFIX}/location`,
  `${SUPER_ADMIN_PREFIX}/settings`,
];

// Paths that are public to everyone, including signed-in users (legal pages,
// etc.). Unlike auth pages, a logged-in visitor is NOT redirected away from
// these.
export const ALWAYS_PUBLIC_PATHS = [
  '/privacy',
];

export const PUBLIC_PATHS = [
  '/',
  PLATFORM_LOGIN_PATH,
  SUPER_ADMIN_LOGIN_PATH,
  '/forgot-password',
  ...ALWAYS_PUBLIC_PATHS,
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

// Public to everyone, including signed-in users (no redirect away).
export function isAlwaysPublicPath(pathname: string) {
  return ALWAYS_PUBLIC_PATHS.includes(pathname);
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
  return (role ?? '').trim().toUpperCase().replace(/\s+/g, '_');
}

export function isSuperAdminRole(role: string | undefined | null) {
  const normalized = normalizeUserRole(role);
  return normalized === 'SUPER_ADMIN' || normalized === 'ADMIN';
}

export function isPlatformAdminRole(role: string | undefined | null) {
  const normalized = normalizeUserRole(role);
  return normalized === 'HR' || normalized === 'PLATFORM_ADMIN';
}

export function isEmployeeRole(role: string | undefined | null) {
  return normalizeUserRole(role) === 'EMPLOYEE';
}

export function roleAllowedForPortal(
  role: string | undefined | null,
  portal: PortalType
) {
  if (portal === 'super_admin') {
    return isSuperAdminRole(role);
  }

  if (portal === 'platform_admin') {
    return isPlatformAdminRole(role);
  }

  if (portal === 'employee') {
    return isEmployeeRole(role);
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
  if (isSuperAdminRole(role)) {
    return 'super_admin';
  }

  if (isPlatformAdminRole(role)) {
    return 'platform_admin';
  }

  if (isEmployeeRole(role)) {
    return 'employee';
  }

  return null;
}

export function portalFromLoginParam(value: string | null): PortalType {
  if (value === 'super_admin') return 'super_admin';
  return 'platform_admin';
}
