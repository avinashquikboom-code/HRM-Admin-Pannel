'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PortalType } from '@/lib/portals';
import {
  canAccessModulePath,
  getEffectivePermissions,
  getFirstAllowedPath,
  filterMenuItemsByPermissions,
} from '@/lib/modulePermissions';

export function usePermissions(portal: PortalType | null, email?: string | null) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setVersion((current) => current + 1);

    window.addEventListener('storage', refresh);
    window.addEventListener('hrm-permissions-updated', refresh);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('hrm-permissions-updated', refresh);
    };
  }, []);

  return useMemo(() => {
    if (!portal) {
      return {
        permissions: {} as Record<string, boolean>,
        canAccessPath: () => true,
        firstAllowedPath: '/login',
        filterMenuItems: <T extends { path: string; moduleId: string }>(
          items: T[]
        ) => items,
      };
    }

    const permissions = getEffectivePermissions(portal, email);

    return {
      permissions,
      canAccessPath: (pathname: string) =>
        canAccessModulePath(portal, pathname, email),
      firstAllowedPath: getFirstAllowedPath(portal, email),
      filterMenuItems: <T extends { path: string; moduleId: string }>(
        items: T[]
      ) => filterMenuItemsByPermissions(portal, items, email),
    };
  }, [portal, email, version]);
}

export function notifyPermissionsUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('hrm-permissions-updated'));
}
