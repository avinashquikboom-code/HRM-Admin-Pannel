import type { PortalType } from '@/lib/portals';
import type { RegisterRole } from '@/services/authService';
import {
  loadRolePermissions,
  ROLE_ACCESS,
} from '@/lib/roleAccess';

export const USER_PERMISSIONS_STORAGE_KEY = 'hrm_user_permissions';

export interface UserPermissionRecord {
  email: string;
  role: RegisterRole;
  portal: PortalType;
  permissions: Record<string, boolean>;
  updatedAt: string;
}

export type UserPermissionsStore = Record<string, UserPermissionRecord>;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function loadAllUserPermissions(): UserPermissionsStore {
  if (typeof window === 'undefined') return {};

  try {
    const raw = localStorage.getItem(USER_PERMISSIONS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as UserPermissionsStore;
  } catch {
    return {};
  }
}

export function saveUserPermissionRecord(record: UserPermissionRecord) {
  if (typeof window === 'undefined') return;

  const store = loadAllUserPermissions();
  store[normalizeEmail(record.email)] = record;
  localStorage.setItem(USER_PERMISSIONS_STORAGE_KEY, JSON.stringify(store));
}

export function getUserPermissionRecord(
  email: string
): UserPermissionRecord | null {
  return loadAllUserPermissions()[normalizeEmail(email)] ?? null;
}

export function getDefaultPermissionsForPortal(portal: PortalType) {
  const rolePermissions = loadRolePermissions();
  return { ...rolePermissions[portal] };
}

export function buildInitialUserPermissions(portal: PortalType) {
  return getDefaultPermissionsForPortal(portal);
}

export function countUserEnabledModules(
  portal: PortalType,
  permissions: Record<string, boolean>
) {
  const defs = ROLE_ACCESS[portal].moduleDefs;
  const enabled = defs.filter((module) => permissions[module.id]).length;
  return { enabled, total: defs.length };
}
