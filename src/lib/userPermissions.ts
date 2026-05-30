import type { PortalType } from '@/lib/portals';
import type { RegisterRole } from '@/services/authService';
import {
  loadRolePermissions,
  ROLE_ACCESS,
} from '@/lib/roleAccess';

// This file provides utilities for building and counting permissions.
// The actual saving and loading of user permissions is handled via the backend API.


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
