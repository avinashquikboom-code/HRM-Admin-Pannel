export type PortalType = 'super_admin' | 'platform_admin';

export const SUPER_ADMIN_LOGIN_PATH = '/super-admin/login';
export const PLATFORM_LOGIN_PATH = '/login';

export const SUPER_ADMIN_HOME = '/super-admin';
export const PLATFORM_HOME = '/hr-management';

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

export function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname);
}

export function getLoginPathForPortal(portal: PortalType) {
  return portal === 'super_admin' ? SUPER_ADMIN_LOGIN_PATH : PLATFORM_LOGIN_PATH;
}

export function getHomePathForPortal(portal: PortalType) {
  return portal === 'super_admin' ? SUPER_ADMIN_HOME : PLATFORM_HOME;
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

  return normalized === 'HR' || normalized === 'ADMIN';
}

export function getProfileBasePath(pathname: string) {
  if (
    pathname === SUPER_ADMIN_PREFIX ||
    (pathname.startsWith(`${SUPER_ADMIN_PREFIX}/`) &&
      pathname !== SUPER_ADMIN_LOGIN_PATH)
  ) {
    return `${SUPER_ADMIN_PREFIX}/profile`;
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

  return null;
}
