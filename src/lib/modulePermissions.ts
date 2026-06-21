import type { PortalType } from '@/lib/portals';
import {
  EMPLOYEE_PREFIX,
  getHomePathForPortal,
  SUPER_ADMIN_PREFIX,
} from '@/lib/portals';
import {
  loadRolePermissions,
  ROLE_ACCESS,
  type RolePermissionsMap,
} from '@/lib/roleAccess';

/** Default route for each permission module */
export const MODULE_PATHS: Record<PortalType, Record<string, string>> = {
  super_admin: {
    'sa-dashboard': SUPER_ADMIN_PREFIX,
    'sa-companies': `${SUPER_ADMIN_PREFIX}/companies`,
    'sa-subscriptions': `${SUPER_ADMIN_PREFIX}/subscriptions`,
    'sa-location': `${SUPER_ADMIN_PREFIX}/location`,
    'sa-settings': `${SUPER_ADMIN_PREFIX}/settings`,
    'sa-user-rights': `${SUPER_ADMIN_PREFIX}/user-rights`,
    'sa-profile': `${SUPER_ADMIN_PREFIX}/profile`,
  },
  platform_admin: {
    'pa-hr': '/hr-management',
    'pa-employee-rights': '/user-rights',
    'pa-employees': '/employees',
    'pa-leave': '/leave',
    'pa-tasks': '/tasks',
    'pa-payroll': '/payroll',
    'pa-attendance': '/attendance',
    'pa-policies': '/policies',
    'pa-analytics': '/analytics',
    'pa-reports': '/reports',
    'pa-notifications': '/notifications',
    'pa-profile': '/profile',
  },
  employee: {
    'em-dashboard': EMPLOYEE_PREFIX,
    'em-attendance': `${EMPLOYEE_PREFIX}/attendance`,
    'em-leave': `${EMPLOYEE_PREFIX}/leave`,
    'em-tasks': `${EMPLOYEE_PREFIX}/tasks`,
    'em-notifications': `${EMPLOYEE_PREFIX}/notifications`,
    'em-profile': `${EMPLOYEE_PREFIX}/profile`,
  },
};

/** Extra routes that inherit permission from a parent module */
const PATH_MODULE_ALIASES: Record<PortalType, Record<string, string>> = {
  super_admin: {
    [`${SUPER_ADMIN_PREFIX}/profile/edit`]: 'sa-profile',
  },
  platform_admin: {
    '/profile/edit': 'pa-profile',
    '/users/register': 'pa-employees',
    '/settings': 'pa-profile',
  },
  employee: {},
};

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function getModuleIdForPath(
  portal: PortalType,
  pathname: string
): string | null {
  const path = normalizePath(pathname);
  const alias = PATH_MODULE_ALIASES[portal][path];
  if (alias) return alias;

  const entries = Object.entries(MODULE_PATHS[portal]);
  let bestMatch: { moduleId: string; length: number } | null = null;

  for (const [moduleId, modulePath] of entries) {
    const normalizedModulePath = normalizePath(modulePath);
    if (path === normalizedModulePath) {
      return moduleId;
    }
    if (
      path.startsWith(`${normalizedModulePath}/`) &&
      (!bestMatch || normalizedModulePath.length > bestMatch.length)
    ) {
      bestMatch = { moduleId, length: normalizedModulePath.length };
    }
  }

  return bestMatch?.moduleId ?? null;
}

export function getPathForModuleId(portal: PortalType, moduleId: string) {
  return MODULE_PATHS[portal][moduleId] ?? null;
}

export function getEffectivePermissions(
  portal: PortalType,
  email?: string | null
): Record<string, boolean> {
  if (portal === 'super_admin') {
    const full: Record<string, boolean> = {};
    for (const module of ROLE_ACCESS.super_admin.moduleDefs) {
      full[module.id] = true;
    }
    return full;
  }

  return { ...loadRolePermissions()[portal] };
}

export function isModuleEnabled(
  portal: PortalType,
  moduleId: string,
  email?: string | null,
  permissions?: Record<string, boolean>
) {
  const perms = permissions ?? getEffectivePermissions(portal, email);
  return perms[moduleId] !== false;
}

export function canAccessModulePath(
  portal: PortalType,
  pathname: string,
  email?: string | null
) {
  const moduleId = getModuleIdForPath(portal, pathname);
  if (!moduleId) {
    return true;
  }
  return isModuleEnabled(portal, moduleId, email);
}

export function getFirstAllowedPath(
  portal: PortalType,
  email?: string | null
): string {
  const permissions = getEffectivePermissions(portal, email);
  const homePath = getHomePathForPortal(portal);
  const homeModuleId = getModuleIdForPath(portal, homePath);

  if (
    homeModuleId &&
    isModuleEnabled(portal, homeModuleId, email, permissions)
  ) {
    return homePath;
  }

  for (const module of ROLE_ACCESS[portal].moduleDefs) {
    if (!isModuleEnabled(portal, module.id, email, permissions)) continue;
    const path = getPathForModuleId(portal, module.id);
    if (path) return path;
  }

  return homePath;
}

export function filterMenuItemsByPermissions<
  T extends { path: string; moduleId: string },
>(portal: PortalType, items: T[], email?: string | null): T[] {
  if (portal === 'super_admin') {
    return items;
  }

  const permissions = getEffectivePermissions(portal, email);
  return items.filter((item) => {
    if (portal === 'platform_admin' && item.moduleId === 'pa-location') {
      return false;
    }
    return isModuleEnabled(portal, item.moduleId, email, permissions);
  });
}

export function countEffectiveEnabledModules(
  portal: PortalType,
  email?: string | null
) {
  const permissions = getEffectivePermissions(portal, email);
  const defs = ROLE_ACCESS[portal].moduleDefs;
  const enabled = defs.filter((module) =>
    isModuleEnabled(portal, module.id, email, permissions)
  ).length;
  return { enabled, total: defs.length };
}

export function mergeRolePermissions(
  base: RolePermissionsMap,
  portal: PortalType,
  updates: Record<string, boolean>
): RolePermissionsMap {
  return {
    ...base,
    [portal]: {
      ...base[portal],
      ...updates,
    },
  };
}
