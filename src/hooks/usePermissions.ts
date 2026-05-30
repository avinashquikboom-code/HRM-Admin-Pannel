'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PortalType } from '@/lib/portals';
import {
  canAccessModulePath,
  getEffectivePermissions,
  getFirstAllowedPath,
  filterMenuItemsByPermissions,
} from '@/lib/modulePermissions';
import { api } from '@/lib/api';
import { useAppSelector } from '@/store/hooks';

export function usePermissions(portal: PortalType | null, email?: string | null) {
  const [version, setVersion] = useState(0);
  const [backendPermissions, setBackendPermissions] = useState<Record<string, boolean> | null>(null);
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const refresh = () => setVersion((current) => current + 1);

    window.addEventListener('storage', refresh);
    window.addEventListener('hrm-permissions-updated', refresh);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('hrm-permissions-updated', refresh);
    };
  }, []);

  useEffect(() => {
    if (token && portal) {
      api.get('/api/permissions/me')
        .then((res) => setBackendPermissions(res.data))
        .catch(() => setBackendPermissions(null));
    }
  }, [token, portal, version]);

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

    const fallbackPermissions = getEffectivePermissions(portal, email);
    // If backend returns permissions, use them, otherwise fallback to local/hardcoded logic
    const permissions = backendPermissions || fallbackPermissions;

    return {
      permissions,
      canAccessPath: (pathname: string) => {
        if (!backendPermissions) return canAccessModulePath(portal, pathname, email);
        const moduleId = require('@/lib/modulePermissions').getModuleIdForPath(portal, pathname);
        return !moduleId || permissions[moduleId] !== false;
      },
      firstAllowedPath: getFirstAllowedPath(portal, email),
      filterMenuItems: <T extends { path: string; moduleId: string }>(
        items: T[]
      ) => {
        if (!backendPermissions) return filterMenuItemsByPermissions(portal, items, email);
        return items.filter(item => permissions[item.moduleId] !== false);
      }
    };
  }, [portal, email, version, backendPermissions]);
}

export function notifyPermissionsUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('hrm-permissions-updated'));
}
