'use client';

import { useSearchParams } from 'next/navigation';
import AuthLoginView from '@/features/auth/components/AuthLoginView';
import { portalFromLoginParam } from '@/lib/portals';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const initialPortal = portalFromLoginParam(searchParams.get('portal'));

  return <AuthLoginView initialPortal={initialPortal} />;
}
