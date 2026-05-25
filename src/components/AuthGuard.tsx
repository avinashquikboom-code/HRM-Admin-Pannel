'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hydrateAuth } from '@/store/slices/authSlice';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useState } from 'react';

const PUBLIC_PATHS = ['/login', '/forgot-password'];

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
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    dispatch(hydrateAuth());
    setIsReady(true);
  }, [dispatch]);

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated && !isPublicPath) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && isPublicPath) {
      router.replace('/');
    }
  }, [isAuthenticated, isPublicPath, isReady, router]);

  if (!isReady) {
    return <AuthLoader />;
  }

  if (!isAuthenticated && !isPublicPath) {
    return <AuthLoader />;
  }

  if (isAuthenticated && isPublicPath) {
    return <AuthLoader />;
  }

  return <>{children}</>;
}
