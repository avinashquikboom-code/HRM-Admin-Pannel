'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hydrateAuth } from '@/store/slices/authSlice';
import { getAuthSession, portalFromRoute } from '@/lib/authStorage';
import { canAccessPath } from '@/lib/roleAccess';
import {
  getLoginPathForPortal,
  isPublicPath,
  isSuperAdminPath,
  isEmployeePath,
  type PortalType,
} from '@/lib/portals';
import {
  canAccessModulePath,
  getFirstAllowedPath,
} from '@/lib/modulePermissions';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';

function AuthLoader({ message = 'Authenticating...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-[#F6F9F8] dark:bg-[#0F172A] flex items-center justify-center flex-col gap-4 transition-colors duration-300">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
      </div>
      <p className="text-xs font-bold text-text-secondary uppercase tracking-widest animate-pulse">
        {message}
      </p>
    </div>
  );
}

function resolveRoutePortal(pathname: string): PortalType {
  if (typeof window === 'undefined') {
    return portalFromRoute(pathname, null);
  }
  const params = new URLSearchParams(window.location.search);
  return portalFromRoute(pathname, params.get('portal'));
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token, portal, user } = useAppSelector(
    (state) => state.auth
  );
  const router = useRouter();
  const pathname = usePathname();
  const routePortal = useMemo(
    () => resolveRoutePortal(pathname),
    [pathname]
  );
  const publicPath = isPublicPath(pathname);
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    dispatch(hydrateAuth(routePortal));
    setIsReady(true);
  }, [dispatch, routePortal]);

  const session = getAuthSession(routePortal);
  const sessionMatchesRoute =
    Boolean(session?.token) && session?.portal === routePortal;
  const reduxMatchesRoute =
    Boolean(token) && isAuthenticated && portal === routePortal;
  const isLoggedInForRoute = sessionMatchesRoute || reduxMatchesRoute;

  const activePortal: PortalType | null = sessionMatchesRoute
    ? session!.portal
    : reduxMatchesRoute
      ? portal
      : session?.portal ?? portal ?? null;

  const userEmail = session?.user?.email ?? user?.email ?? null;

  const portalPathAllowed =
    activePortal && canAccessPath(activePortal, pathname);
  const modulePathAllowed =
    activePortal && canAccessModulePath(activePortal, pathname, userEmail);
  const pathAllowed = Boolean(portalPathAllowed && modulePathAllowed);

  const landingPath =
    activePortal && isLoggedInForRoute
      ? getFirstAllowedPath(activePortal, userEmail)
      : getLoginPathForPortal(routePortal);

  useEffect(() => {
    if (!isReady) return;

    if (!isLoggedInForRoute) {
      if (!publicPath) {
        let loginPortal: PortalType = routePortal;
        if (isSuperAdminPath(pathname)) loginPortal = 'super_admin';
        else if (isEmployeePath(pathname)) loginPortal = 'employee';
        router.replace(getLoginPathForPortal(loginPortal));
      }
      return;
    }

    if (!activePortal) return;

    if (publicPath) {
      if (pathname !== landingPath) {
        router.replace(landingPath);
      }
      return;
    }

    if (!pathAllowed && pathname !== landingPath) {
      router.replace(landingPath);
    }
  }, [
    activePortal,
    isLoggedInForRoute,
    isReady,
    landingPath,
    pathname,
    pathAllowed,
    publicPath,
    routePortal,
    router,
  ]);

  if (!isReady) {
    return <AuthLoader />;
  }

  if (!isLoggedInForRoute && !publicPath) {
    return <AuthLoader message="Redirecting to login..." />;
  }

  if (isLoggedInForRoute && publicPath && pathname !== landingPath) {
    return <AuthLoader message="Redirecting..." />;
  }

  if (
    isLoggedInForRoute &&
    activePortal &&
    !publicPath &&
    !pathAllowed &&
    pathname !== landingPath
  ) {
    return <AuthLoader message="Redirecting..." />;
  }

  return <>{children}</>;
}
