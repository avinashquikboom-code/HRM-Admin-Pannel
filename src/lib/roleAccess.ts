import type { PortalType } from '@/lib/portals';
import { isEmployeePath } from '@/lib/portals';

export type AppRole = 'ADMIN' | 'HR' | 'EMPLOYEE';

export interface AccessModuleDef {
  id: string;
  label: string;
  group: string;
  description: string;
}

export interface RoleAccessInfo {
  portal: PortalType;
  label: string;
  title: string;
  description: string;
  moduleDefs: AccessModuleDef[];
  accent: 'primary' | 'secondary' | 'accent';
}

export const ROLE_ACCESS: Record<PortalType, RoleAccessInfo> = {
  super_admin: {
    portal: 'super_admin',
    label: 'Super HRM',
    title: 'Super HRM Login',
    description: 'Platform owner — companies, billing & global settings',
    moduleDefs: [
      { id: 'sa-dashboard', label: 'Dashboard', group: 'Platform', description: 'Overview of companies and platform metrics' },
      { id: 'sa-companies', label: 'Companies', group: 'Platform', description: 'Manage registered organizations' },
      { id: 'sa-subscriptions', label: 'Subscriptions', group: 'Billing', description: 'Plans, renewals and billing status' },
      { id: 'sa-location', label: 'Live Location', group: 'Operations', description: 'Platform-wide field staff location tracking' },
      { id: 'sa-settings', label: 'System Settings', group: 'Platform', description: 'Global configuration and access policies' },
      { id: 'sa-user-rights', label: 'User Rights', group: 'Security', description: 'Role permissions and module access' },
      { id: 'sa-profile', label: 'Profile', group: 'Account', description: 'Personal account and security settings' },
    ],
    accent: 'secondary',
  },
  platform_admin: {
    portal: 'platform_admin',
    label: 'HRM Admin',
    title: 'HRM Admin Login',
    description: 'HR & operations — manage workforce across the organization',
    moduleDefs: [
      { id: 'pa-hr', label: 'HR Management', group: 'Workforce', description: 'HR activity and hiring oversight' },
      { id: 'pa-employee-rights', label: 'Employee Rights', group: 'Security', description: 'Configure employee module access' },
      { id: 'pa-employees', label: 'Employees', group: 'Workforce', description: 'Employee directory and records' },
      { id: 'pa-leave', label: 'Leave Management', group: 'Operations', description: 'Leave requests and approvals' },
      { id: 'pa-tasks', label: 'Task Management', group: 'Operations', description: 'Assign and track team tasks' },
      { id: 'pa-payroll', label: 'Payroll', group: 'Finance', description: 'Salary runs and disbursements' },
      { id: 'pa-attendance', label: 'Attendance', group: 'Operations', description: 'Attendance logs and policies' },
      { id: 'pa-analytics', label: 'Analytics', group: 'Insights', description: 'Workforce analytics dashboards' },
      { id: 'pa-reports', label: 'Reports', group: 'Insights', description: 'Exportable HR and payroll reports' },
      { id: 'pa-notifications', label: 'Notifications', group: 'Communication', description: 'Alerts and system messages' },
      { id: 'pa-profile', label: 'Profile', group: 'Account', description: 'Personal account settings' },
    ],
    accent: 'primary',
  },
  employee: {
    portal: 'employee',
    label: 'Employee',
    title: 'Employee Login',
    description: 'Self-service — your attendance, leave, tasks & profile',
    moduleDefs: [
      { id: 'em-dashboard', label: 'My Dashboard', group: 'Self Service', description: 'Personal overview and quick links' },
      { id: 'em-attendance', label: 'My Attendance', group: 'Self Service', description: 'View and mark attendance' },
      { id: 'em-leave', label: 'My Leave', group: 'Self Service', description: 'Apply and track leave balance' },
      { id: 'em-tasks', label: 'My Tasks', group: 'Self Service', description: 'Assigned tasks and deadlines' },
      { id: 'em-notifications', label: 'Notifications', group: 'Communication', description: 'Updates from HR and system' },
      { id: 'em-profile', label: 'Profile', group: 'Account', description: 'Personal details and password' },
    ],
    accent: 'accent',
  },
};

export const PORTAL_ORDER: PortalType[] = [
  'super_admin',
  'platform_admin',
  'employee',
];

export const LOGIN_PORTAL_ORDER = [
  'super_admin',
  'platform_admin',
] as const;

export type LoginPortalType = (typeof LOGIN_PORTAL_ORDER)[number];

export const PLATFORM_HR_ROLE_ORDER: PortalType[] = ['employee'];

export function getModuleDefsForManager(
  targetPortal: PortalType,
  _managerPortal?: PortalType
): AccessModuleDef[] {
  return ROLE_ACCESS[targetPortal].moduleDefs;
}

/** Super Admin configures Admin (HR) role only — not own Super Admin access. */
export const SUPER_ADMIN_MANAGED_ROLES: PortalType[] = ['platform_admin'];

/** Admin (HR) configures Employee role only. */
export const ADMIN_MANAGED_ROLES: PortalType[] = ['employee'];

export function getManagedRolesForPortal(portal: PortalType): PortalType[] {
  if (portal === 'super_admin') return SUPER_ADMIN_MANAGED_ROLES;
  if (portal === 'platform_admin') return ADMIN_MANAGED_ROLES;
  return [];
}

export function canManageRole(
  managerPortal: PortalType,
  targetRole: PortalType
): boolean {
  return getManagedRolesForPortal(managerPortal).includes(targetRole);
}

export interface RolePreviewInfo {
  access: RoleAccessInfo;
  managedBy: string;
}

/** Read-only preview of the next role down in the hierarchy. */
export function getHierarchyPreview(
  managerPortal: PortalType,
  selectedRole: PortalType
): RolePreviewInfo[] {
  if (managerPortal === 'super_admin' && selectedRole === 'platform_admin') {
    return [
      {
        access: ROLE_ACCESS.employee,
        managedBy: 'Managed by Admin (HR) — not editable by Super Admin',
      },
    ];
  }

  return [];
}

export function saveManagedRolePermissions(
  managerPortal: PortalType,
  permissions: RolePermissionsMap
) {
  const existing = loadRolePermissions();
  const managed = getManagedRolesForPortal(managerPortal);

  for (const role of managed) {
    existing[role] = { ...permissions[role] };
  }

  saveRolePermissions(existing);
}

export const PERMISSIONS_STORAGE_KEY = 'hrm_role_permissions';

export type RolePermissionsMap = Record<PortalType, Record<string, boolean>>;

export function getModuleLabels(portal: PortalType): string[] {
  return ROLE_ACCESS[portal].moduleDefs.map((module) => module.label);
}

export function getDefaultRolePermissions(): RolePermissionsMap {
  const permissions = {} as RolePermissionsMap;

  for (const portal of PORTAL_ORDER) {
    permissions[portal] = {};
    for (const module of ROLE_ACCESS[portal].moduleDefs) {
      permissions[portal][module.id] = true;
    }
  }

  return permissions;
}

export function loadRolePermissions(): RolePermissionsMap {
  const defaults = getDefaultRolePermissions();

  if (typeof window === 'undefined') {
    return defaults;
  }

  try {
    const raw = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
    if (!raw) return defaults;

    const parsed = JSON.parse(raw) as Partial<RolePermissionsMap>;

    for (const portal of PORTAL_ORDER) {
      for (const module of ROLE_ACCESS[portal].moduleDefs) {
        const stored = parsed[portal]?.[module.id];
        defaults[portal][module.id] = stored ?? true;
      }
    }
  } catch {
    return defaults;
  }

  return defaults;
}

export function saveRolePermissions(permissions: RolePermissionsMap) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('hrm-permissions-updated'));
  }
}

export function countEnabledModules(
  portal: PortalType,
  permissions: RolePermissionsMap,
  managerPortal?: PortalType
) {
  const defs = getModuleDefsForManager(portal, managerPortal);
  const enabled = defs.filter((module) => permissions[portal][module.id]).length;
  return { enabled, total: defs.length };
}

export function getLowerRoleAccess(portal: PortalType): RoleAccessInfo[] {
  if (portal === 'super_admin') {
    return [ROLE_ACCESS.platform_admin];
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
    return isEmployeePath(pathname);
  }

  if (portal === 'platform_admin') {
    if (pathname.startsWith('/super-admin') || isEmployeePath(pathname)) {
      return false;
    }
    if (pathname === '/location' || pathname.startsWith('/location/')) {
      return false;
    }
    return true;
  }

  return false;
}
