import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Settings,
  ShieldCheck,
  MapPin,
  Users,
  UserSquare2,
  Calendar,
  CheckSquare,
  Wallet,
  BarChart3,
  FileText,
  User,
  Navigation,
} from 'lucide-react';
import type { PortalType } from '@/lib/portals';
import { SUPER_ADMIN_PREFIX } from '@/lib/portals';

export interface SidebarMenuItem {
  name: string;
  icon: LucideIcon;
  path: string;
  moduleId: string;
}

/** Legacy module — never show on HRM Admin sidebar. */
export const ADMIN_REMOVED_MODULE_IDS = new Set(['pa-location']);

export const SUPER_ADMIN_MENU_ITEMS: SidebarMenuItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, path: SUPER_ADMIN_PREFIX, moduleId: 'sa-dashboard' },
  { name: 'Geofence Editor', icon: MapPin, path: `${SUPER_ADMIN_PREFIX}/location?tab=editor`, moduleId: 'sa-location' },
  { name: 'Live Location', icon: Navigation, path: `${SUPER_ADMIN_PREFIX}/location?tab=tracker`, moduleId: 'sa-location-new' },
  { name: 'Companies', icon: Building2, path: `${SUPER_ADMIN_PREFIX}/companies`, moduleId: 'sa-companies' },
  { name: 'Subscriptions', icon: CreditCard, path: `${SUPER_ADMIN_PREFIX}/subscriptions`, moduleId: 'sa-subscriptions' },
  { name: 'Admin Rights', icon: ShieldCheck, path: `${SUPER_ADMIN_PREFIX}/user-rights`, moduleId: 'sa-user-rights' },
  { name: 'Settings', icon: Settings, path: `${SUPER_ADMIN_PREFIX}/settings`, moduleId: 'sa-settings' },
];

export const PLATFORM_ADMIN_MENU_ITEMS: SidebarMenuItem[] = [
  { name: 'HR Management', icon: Users, path: '/hr-management', moduleId: 'pa-hr' },
  { name: 'Employee Rights', icon: ShieldCheck, path: '/user-rights', moduleId: 'pa-employee-rights' },
  { name: 'Employees', icon: UserSquare2, path: '/employees', moduleId: 'pa-employees' },
  { name: 'Departments', icon: Building2, path: '/departments', moduleId: 'pa-departments' },
  { name: 'Leave Management', icon: Calendar, path: '/leave', moduleId: 'pa-leave' },
  { name: 'Payroll', icon: Wallet, path: '/payroll', moduleId: 'pa-payroll' },
  { name: 'Attendance', icon: CreditCard, path: '/attendance', moduleId: 'pa-attendance' },
  { name: 'Analytics', icon: BarChart3, path: '/analytics', moduleId: 'pa-analytics' },
  { name: 'Reports', icon: FileText, path: '/reports', moduleId: 'pa-reports' },
];

export const PLATFORM_ADMIN_ACCOUNT_ITEMS: SidebarMenuItem[] = [
  { name: 'Profile', icon: User, path: '/profile', moduleId: 'pa-profile' },
];

export function getSidebarMenuItems(portal: PortalType): SidebarMenuItem[] {
  if (portal === 'super_admin') return SUPER_ADMIN_MENU_ITEMS;
  if (portal === 'platform_admin') return PLATFORM_ADMIN_MENU_ITEMS;
  return [];
}

export function stripRemovedAdminModules<T extends { moduleId: string }>(
  items: T[]
): T[] {
  return items.filter((item) => !ADMIN_REMOVED_MODULE_IDS.has(item.moduleId));
}
