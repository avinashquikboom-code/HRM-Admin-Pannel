import { Suspense } from 'react';
import LoginPage from '@/features/auth/pages/LoginPage';

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-sm text-text-secondary">Loading...</p>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPage />
    </Suspense>
  );
}
