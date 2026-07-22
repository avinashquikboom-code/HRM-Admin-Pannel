import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Settings,
  Shield,
  ShieldCheck,
  MapPin,
  Users,
  UserSquare2,
  Calendar,
  CheckSquare,
  Wallet,
  User,
  Navigation,
  DollarSign,
  Briefcase,
  Clock,
  Store,
  GitBranch,
  ShoppingBag,
  FileText,
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
export const ADMIN_REMOVED_MODULE_IDS = new Set<string>([]);

export const SUPER_ADMIN_MENU_ITEMS: SidebarMenuItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, path: SUPER_ADMIN_PREFIX, moduleId: 'sa-dashboard' },
  { name: 'Stores', icon: Store, path: `${SUPER_ADMIN_PREFIX}/store-branch`, moduleId: 'sa-store-branch' },
  { name: 'Live Location', icon: Navigation, path: `${SUPER_ADMIN_PREFIX}/location?tab=tracker`, moduleId: 'sa-location-new' },
  { name: 'Companies', icon: Building2, path: `${SUPER_ADMIN_PREFIX}/companies`, moduleId: 'sa-companies' },
  { name: 'Subscriptions', icon: CreditCard, path: `${SUPER_ADMIN_PREFIX}/subscriptions`, moduleId: 'sa-subscriptions' },
  { name: 'Admin Rights', icon: ShieldCheck, path: `${SUPER_ADMIN_PREFIX}/user-rights`, moduleId: 'sa-user-rights' },
  { name: 'Settings', icon: Settings, path: `${SUPER_ADMIN_PREFIX}/settings`, moduleId: 'sa-settings' },
];

export const PLATFORM_ADMIN_MENU_ITEMS: SidebarMenuItem[] = [
  { name: 'Live Dashboard', icon: LayoutDashboard, path: '/live-dashboard', moduleId: 'pa-live-dashboard' },
  { name: 'Products', icon: ShoppingBag, path: '/products', moduleId: 'pa-products' },
  { name: 'Flipkart Invoices', icon: FileText, path: '/invoices', moduleId: 'pa-invoices' },
  { name: 'HR Management', icon: Users, path: '/hr-management', moduleId: 'pa-hr' },
  { name: 'Employee Rights', icon: ShieldCheck, path: '/user-rights', moduleId: 'pa-employee-rights' },
  { name: 'Employees', icon: UserSquare2, path: '/employees', moduleId: 'pa-employees' },
  { name: 'Tasks', icon: CheckSquare, path: '/tasks', moduleId: 'pa-tasks' },
  { name: 'Departments', icon: Building2, path: '/departments', moduleId: 'pa-departments' },
  { name: 'Designations', icon: Briefcase, path: '/designations', moduleId: 'pa-designations' },
  { name: 'Shifts', icon: Clock, path: '/shifts', moduleId: 'pa-shifts' },
  { name: 'Leave Management', icon: Calendar, path: '/leave', moduleId: 'pa-leave' },
  { name: 'Payroll', icon: Wallet, path: '/payroll', moduleId: 'pa-payroll' },
  { name: 'Attendance', icon: CreditCard, path: '/attendance', moduleId: 'pa-attendance' },
  { name: 'Live Location', icon: Navigation, path: '/location', moduleId: 'pa-location' },
  { name: 'Commission', icon: DollarSign, path: '/commission', moduleId: 'pa-commission' },
  { name: 'Policies', icon: Shield, path: '/policies', moduleId: 'pa-policies' },
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
