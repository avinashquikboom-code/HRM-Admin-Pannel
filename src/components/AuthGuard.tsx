'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hydrateAuth } from '@/store/slices/authSlice';
import { getAuthSession } from '@/lib/authStorage';
import {
  getHomePathForPortal,
  getLoginPathForPortal,
  isPublicPath,
  isSuperAdminPath,
  type PortalType,
} from '@/lib/portals';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useState } from 'react';

function AuthLoader() {
  return (
    <div className="min-h-screen bg-[#F6F9F8] dark:bg-[#0F172A] flex items-center justify-center flex-col gap-4 transition-colors duration-300">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
      </div>
      <p className="text-xs font-bold text-text-secondary uppercase tracking-widest animate-pulse">
        Authenticating...
      </p>
    </div>
  );
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token, portal } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    dispatch(hydrateAuth());
    setIsReady(true);
  }, [dispatch]);

  const session = getAuthSession();
  const isLoggedIn = Boolean(
    isAuthenticated || token || session?.token
  );
  const activePortal: PortalType | null =
    session?.portal ?? portal ?? null;
  const publicPath = isPublicPath(pathname);

  useEffect(() => {
    if (!isReady) return;

    if (!isLoggedIn) {
      if (!publicPath) {
        router.replace(
          isSuperAdminPath(pathname)
            ? getLoginPathForPortal('super_admin')
            : getLoginPathForPortal('platform_admin')
        );
      }
      return;
    }

    if (!activePortal) return;

    const homePath = getHomePathForPortal(activePortal);

    if (publicPath) {
      router.replace(homePath);
      return;
    }

    if (activePortal === 'super_admin' && !isSuperAdminPath(pathname)) {
      router.replace(homePath);
      return;
    }

    if (activePortal === 'platform_admin' && isSuperAdminPath(pathname)) {
      router.replace(homePath);
    }
  }, [activePortal, isLoggedIn, isReady, pathname, publicPath, router]);

  if (!isReady) {
    return <AuthLoader />;
  }

  if (!isLoggedIn && !publicPath) {
    return <AuthLoader />;
  }

  if (isLoggedIn && publicPath) {
    return <AuthLoader />;
  }

  return <>{children}</>;
}
