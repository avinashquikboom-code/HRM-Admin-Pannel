'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Mail,
  LogIn,
  ShieldCheck,
  Loader2,
  LayoutDashboard,
} from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { loginRequest } from '@/services/authService';
import PasswordInput from '@/components/PasswordInput';
import {
  DEFAULT_PLATFORM_DEV_EMAIL,
  DEFAULT_PLATFORM_DEV_PASSWORD,
  SUPER_ADMIN_DEV_EMAIL,
  SUPER_ADMIN_DEV_PASSWORD,
} from '@/lib/devAuth';
import { getHomePathForPortal, type PortalType } from '@/lib/portals';
import {
  ROLE_ACCESS,
  LOGIN_PORTAL_ORDER,
  type LoginPortalType,
} from '@/lib/roleAccess';
import { cn } from '@/utils/cn';

interface AuthLoginViewProps {
  initialPortal?: PortalType;
}

const PORTAL_DEMO: Record<
  LoginPortalType,
  { email: string; password: string; placeholder: string; buttonLabel: string }
> = {
  super_admin: {
    email: SUPER_ADMIN_DEV_EMAIL,
    password: SUPER_ADMIN_DEV_PASSWORD,
    placeholder: 'superadmin@hrm.com',
    buttonLabel: 'Enter Super Admin',
  },
  platform_admin: {
    email: DEFAULT_PLATFORM_DEV_EMAIL,
    password: DEFAULT_PLATFORM_DEV_PASSWORD,
    placeholder: 'hr@quickboom.com',
    buttonLabel: 'Enter Admin Panel',
  },
};

const PORTAL_ICONS: Record<LoginPortalType, typeof ShieldCheck> = {
  super_admin: ShieldCheck,
  platform_admin: LayoutDashboard,
};

const ACCENT_STYLES = {
  secondary: {
    blob: 'bg-secondary/10',
    icon: 'bg-secondary shadow-secondary/30',
    tab: 'bg-secondary text-white shadow-md',
    demo: 'bg-secondary/5 border-secondary/15',
    button: 'bg-secondary hover:opacity-90 shadow-xl shadow-secondary/20',
    ring: 'focus:ring-secondary/50',
  },
  primary: {
    blob: 'bg-primary/10',
    icon: 'bg-primary shadow-primary/40',
    tab: 'bg-primary text-white shadow-md',
    demo: 'bg-primary/5 border-primary/15',
    button: 'bg-primary hover:bg-primary-dark shadow-xl shadow-primary/30',
    ring: 'focus:ring-primary/50',
  },
};

function toLoginPortal(portal: PortalType): LoginPortalType {
  return portal === 'super_admin' ? 'super_admin' : 'platform_admin';
}

export default function AuthLoginView({
  initialPortal = 'platform_admin',
}: AuthLoginViewProps) {
  const dispatch = useAppDispatch();
  const [portal, setPortal] = useState<LoginPortalType>(
    toLoginPortal(initialPortal)
  );
  const access = ROLE_ACCESS[portal];
  const demo = PORTAL_DEMO[portal];
  const styles = ACCENT_STYLES[access.accent as 'primary' | 'secondary'];
  const PortalIcon = PORTAL_ICONS[portal];

  const [email, setEmail] = useState(demo.email);
  const [password, setPassword] = useState(demo.password);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const switchPortal = (nextPortal: LoginPortalType) => {
    if (nextPortal === portal) return;
    const nextDemo = PORTAL_DEMO[nextPortal];
    setPortal(nextPortal);
    setEmail(nextDemo.email);
    setPassword(nextDemo.password);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await loginRequest({ email, password }, portal);
      dispatch(login(response));
      window.location.href = getHomePathForPortal(portal);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 relative overflow-hidden">
      <div className={cn('absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px]', styles.blob)} />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-6 sm:mb-8">
          <div
            className={cn(
              'w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-2xl',
              styles.icon
            )}
          >
            {portal === 'platform_admin' ? (
              <span className="text-white font-semibold text-lg sm:text-xl tracking-tight">
                HRM
              </span>
            ) : (
              <PortalIcon className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
            )}
          </div>
          <h1 className="heading-1">{access.title}</h1>
          <p className="text-page-desc mt-2">{access.description}</p>
        </div>

        <div className="glass-card p-6 sm:p-8 lg:p-10 bg-surface/40 border-surface/50">
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-surface-variant mb-6">
            {LOGIN_PORTAL_ORDER.map((optionId) => {
              const option = ROLE_ACCESS[optionId];
              const optionStyles = ACCENT_STYLES[option.accent as 'primary' | 'secondary'];
              return (
                <button
                  key={optionId}
                  type="button"
                  onClick={() => switchPortal(optionId)}
                  className={cn(
                    'py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all',
                    portal === optionId
                      ? optionStyles.tab
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  {option.label === 'Admin' ? 'Admin Panel' : option.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="rounded-2xl bg-error/10 border border-error/20 px-4 py-3 text-sm font-medium text-error">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2 ml-1">
                {portal === 'super_admin' ? 'Super Admin Email' : 'Work Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className={cn(
                    'w-full pl-12 pr-4 py-3.5 bg-surface dark:bg-surface-variant border-none rounded-2xl shadow-inner outline-none focus:ring-2 transition-all text-text-primary disabled:opacity-60 text-sm',
                    styles.ring
                  )}
                  placeholder={demo.placeholder}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2 ml-1">
                Password
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            {portal === 'platform_admin' && (
              <div className="flex items-center justify-between ml-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-text-secondary font-medium">
                    Keep me signed in
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-bold text-primary hover:text-primary-dark transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-3.5 font-semibold rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed text-sm text-white',
                styles.button
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  {demo.buttonLabel}
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
