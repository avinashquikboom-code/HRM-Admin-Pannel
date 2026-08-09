import type { PortalType } from '@/lib/portals';
import { isEmployeePath, isSuperAdminRole } from '@/lib/portals';
import { api } from '@/lib/api';
import { getAuthSession } from '@/lib/authStorage';

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
      { id: 'sa-location-new', label: 'Live Location Tracker', group: 'Operations', description: 'Real-time location tracking dashboard' },
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
      { id: 'pa-employee-rights', label: 'Employee Rights', group: 'Security', description: 'Configure employee module access' },
      { id: 'pa-employees', label: 'Employees', group: 'Workforce', description: 'Employee directory and records' },
      { id: 'pa-leave', label: 'Leave Management', group: 'Operations', description: 'Leave requests and approvals' },
      { id: 'pa-tasks', label: 'Task Management', group: 'Operations', description: 'Assign and track team tasks' },
      { id: 'pa-payroll', label: 'Expenses Report', group: 'Finance', description: 'Salary runs, expenses report and disbursements' },
      { id: 'pa-attendance', label: 'Attendance', group: 'Operations', description: 'Attendance logs and policies' },
      { id: 'pa-shift-rules', label: 'Shift Guidelines', group: 'Operations', description: 'Operational shift rules and conduct guidelines' },
      { id: 'pa-remote-work', label: 'Remote Work', group: 'Operations', description: 'Remote work approvals and geofence bypass' },
      { id: 'pa-policies', label: 'Policies', group: 'Operations', description: 'Manage company attendance and leave policies' },
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
    description: 'Self-service — attendance, wallet, leave, tasks, shift, remote work & profile',
    moduleDefs: [
      // 1. HOME & DASHBOARD
      { id: 'canViewGeofence', label: 'View Geofence Banner', group: 'Home & Dashboard', description: 'Displays office geofence status & GPS radius' },
      { id: 'canPunchInOut', label: 'Punch In / Out Access', group: 'Home & Dashboard', description: 'Mark daily check-in and check-out attendance' },
      { id: 'canPunchHalfDay', label: 'Half-Day Punch', group: 'Home & Dashboard', description: 'Punch in/out specifically for half-day shift' },
      { id: 'canTakeBreaks', label: 'Take Break Timers', group: 'Home & Dashboard', description: 'Start and stop active break timers (Lunch, Tea, Personal)' },

      // 2. ATTENDANCE & LOGS
      { id: 'canViewAttendance', label: 'View Attendance Calendar', group: 'Attendance & Logs', description: 'View monthly attendance logs and history' },
      { id: 'canViewBreakHistory', label: 'View Break History', group: 'Attendance & Logs', description: 'View past break timestamps and durations' },
      { id: 'canRequestAttendanceCorrection', label: 'Attendance Regularization', group: 'Attendance & Logs', description: 'Submit correction request for missed punches' },

      // 3. WALLET & FINANCIALS
      { id: 'canViewSalary', label: 'View Salary Slip', group: 'Wallet & Financials', description: 'View monthly base salary, allowances, deductions & net pay' },
      { id: 'canDownloadSalaryPDF', label: 'Download Salary PDF', group: 'Wallet & Financials', description: 'Download or print PDF salary slip' },
      { id: 'canRequestSalaryAdvance', label: 'Request Salary Advance', group: 'Wallet & Financials', description: 'Submit salary advance application' },
      { id: 'canViewCommission', label: 'View Commission Dashboard', group: 'Wallet & Financials', description: 'View sales commission earnings and targets' },
      { id: 'canLogSale', label: 'Log New Sale', group: 'Wallet & Financials', description: 'Submit new sale transaction for commission calculation' },
      { id: 'canViewExpenses', label: 'View Expense Claims', group: 'Wallet & Financials', description: 'View history of submitted expense claims' },
      { id: 'canSubmitExpenseClaim', label: 'Submit Expense Claim', group: 'Wallet & Financials', description: 'Submit reimbursement claim with receipt photo' },
      { id: 'canCancelExpenseClaim', label: 'Cancel Expense Claim', group: 'Wallet & Financials', description: 'Revoke pending reimbursement claim' },
      { id: 'canRequestBankDetailsEdit', label: 'Request Bank Details Edit', group: 'Wallet & Financials', description: 'Request permission to update bank account details' },

      // 4. LEAVE & HOLIDAYS
      { id: 'canViewLeaveBalance', label: 'View Leave Balance', group: 'Leave & Holidays', description: 'View casual, paid, and sick leave balances' },
      { id: 'canViewLeaveHistory', label: 'View Leave History', group: 'Leave & Holidays', description: 'View status of past leave applications' },
      { id: 'canApplyLeave', label: 'Apply for Leave', group: 'Leave & Holidays', description: 'Submit new leave application with dates & reason' },
      { id: 'canCancelLeave', label: 'Cancel Pending Leave', group: 'Leave & Holidays', description: 'Withdraw pending leave request before HR review' },
      { id: 'canViewHolidays', label: 'View Holiday Calendar', group: 'Leave & Holidays', description: 'View official company holiday list' },

      // 5. TASKS MANAGEMENT
      { id: 'canViewTasks', label: 'View Assigned Tasks', group: 'Tasks Management', description: 'View task titles, priority badges, and due dates' },
      { id: 'canCompleteTask', label: 'Complete Task', group: 'Tasks Management', description: 'Mark task as completed or add progress notes' },

      // 6. SHIFT & GUIDELINES
      { id: 'canViewShift', label: 'View Shift Schedule', group: 'Shift & Guidelines', description: 'View assigned shift timings and office location' },
      { id: 'canRequestShiftChange', label: 'Request Shift Change', group: 'Shift & Guidelines', description: 'Submit shift timing change or swap request' },
      { id: 'canCancelShiftRequest', label: 'Cancel Shift Request', group: 'Shift & Guidelines', description: 'Revoke pending shift change request' },
      { id: 'canViewShiftGuidelines', label: 'View Shift Guidelines', group: 'Shift & Guidelines', description: 'Read operational rules and store guidelines' },

      // 7. REMOTE WORK
      { id: 'canViewRemoteWorkStatus', label: 'View Remote Work Status', group: 'Remote Work', description: 'View history of remote work approvals' },
      { id: 'canApplyRemoteWork', label: 'Apply for Remote Work', group: 'Remote Work', description: 'Request remote work / geofence bypass permission' },
      { id: 'canCancelRemoteRequest', label: 'Cancel Remote Request', group: 'Remote Work', description: 'Withdraw pending remote work request' },

      // 8. PROFILE & SYSTEM
      { id: 'canViewProfile', label: 'View Profile', group: 'Profile & System', description: 'View personal details, employee code & designation' },
      { id: 'canEditAvatar', label: 'Edit Profile Photo', group: 'Profile & System', description: 'Upload or update profile picture' },
      { id: 'canChangePassword', label: 'Change Password', group: 'Profile & System', description: 'Update account password' },
      { id: 'canViewNotifications', label: 'View Notifications', group: 'Profile & System', description: 'View system alerts & broadcast messages' },
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

export async function saveManagedRolePermissionsAsync(
  managerPortal: PortalType,
  permissions: RolePermissionsMap
) {
  const existing = await fetchRolePermissionsAsync();
  const managed = getManagedRolesForPortal(managerPortal);

  for (const role of managed) {
    existing[role] = { ...permissions[role] };
  }

  await saveRolePermissionsAsync(existing);
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

export async function fetchRolePermissionsAsync(): Promise<RolePermissionsMap> {
  const defaults = getDefaultRolePermissions();

  if (typeof window === 'undefined') {
    return defaults;
  }

  const session = getAuthSession();
  if (!isSuperAdminRole(session?.user?.role)) {
    return loadRolePermissions();
  }

  try {
    const { data } = await api.get('/api/permissions/global');
    if (data.ADMIN || data.SUPER_ADMIN) defaults.super_admin = { ...defaults.super_admin, ...(data.ADMIN || data.SUPER_ADMIN) };
    if (data.HR || data.PLATFORM_ADMIN) defaults.platform_admin = { ...defaults.platform_admin, ...(data.HR || data.PLATFORM_ADMIN) };
    if (data.EMPLOYEE) defaults.employee = { ...defaults.employee, ...data.EMPLOYEE };
  } catch (error) {
    console.error('Failed to fetch global permissions', error);
  }
  return defaults;
}

export async function saveRolePermissionsAsync(permissions: RolePermissionsMap) {
  if (typeof window === 'undefined') return;

  const session = getAuthSession();
  if (!isSuperAdminRole(session?.user?.role)) {
    saveRolePermissions(permissions);
    return;
  }

  try {
    const payload = {
      ADMIN: permissions.super_admin,
      HR: permissions.platform_admin,
      EMPLOYEE: permissions.employee
    };
    await api.put('/api/permissions/global', { permissions: payload });
    saveRolePermissions(permissions); // keep local in sync
  } catch (error) {
    console.error('Failed to save global permissions', error);
    throw error;
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
