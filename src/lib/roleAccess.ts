import type { PortalType } from '@/lib/portals';

export type AppRole = 'ADMIN' | 'HR' | 'EMPLOYEE';

export interface RoleAccessInfo {
  portal: PortalType;
  label: string;
  title: string;
  description: string;
  modules: string[];
  accent: 'primary' | 'secondary' | 'accent';
}

export const ROLE_ACCESS: Record<PortalType, RoleAccessInfo> = {
  super_admin: {
    portal: 'super_admin',
    label: 'Super Admin',
    title: 'Super Admin Login',
    description: 'Platform owner — companies, billing & global settings',
    modules: [
      'Dashboard',
      'Companies',
      'Subscriptions',
      'System Settings',
      'Profile',
    ],
    accent: 'secondary',
  },
  platform_admin: {
    portal: 'platform_admin',
    label: 'Admin',
    title: 'Admin Login',
    description: 'HR & operations — manage workforce across the organization',
    modules: [
      'HR Management',
      'Employees',
      'Leave Management',
      'Task Management',
      'Payroll',
      'Attendance',
      'Live Location',
      'Analytics',
      'Reports',
      'Notifications',
      'Profile',
    ],
    accent: 'primary',
  },
  employee: {
    portal: 'employee',
    label: 'Employee',
    title: 'Employee Login',
    description: 'Self-service — your attendance, leave, tasks & profile',
    modules: [
      'My Dashboard',
      'My Attendance',
      'My Leave',
      'My Tasks',
      'Notifications',
      'Profile',
    ],
    accent: 'accent',
  },
};

export const PORTAL_ORDER: PortalType[] = [
  'super_admin',
  'platform_admin',
  'employee',
];

/** Portals shown on the unified login page (employee excluded). */
export const LOGIN_PORTAL_ORDER = [
  'super_admin',
  'platform_admin',
] as const;

export type LoginPortalType = (typeof LOGIN_PORTAL_ORDER)[number];

/** Modules visible to roles below the selected portal (user rights control). */
export function getLowerRoleAccess(portal: PortalType): RoleAccessInfo[] {
  if (portal === 'super_admin') {
    return [ROLE_ACCESS.platform_admin, ROLE_ACCESS.employee];
  }
  if (portal === 'platform_admin') {
    return [ROLE_ACCESS.employee];
  }
  return [];
}

export function canAccessPath(portal: PortalType, pathname: string): boolean {
  if (portal === 'super_admin') {
    return (
      pathname === '/super-admin' ||
      (pathname.startsWith('/super-admin/') &&
        pathname !== '/super-admin/login')
    );
  }

  if (portal === 'employee') {
    return pathname === '/employee' || pathname.startsWith('/employee/');
  }

  if (portal === 'platform_admin') {
    if (pathname.startsWith('/super-admin') || pathname.startsWith('/employee')) {
      return false;
    }
    return true;
  }

  return false;
}
