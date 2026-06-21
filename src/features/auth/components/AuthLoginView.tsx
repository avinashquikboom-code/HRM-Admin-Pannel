'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Mail,
  LogIn,
  Loader2,
} from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { loginRequest } from '@/services/authService';
import PasswordInput from '@/components/PasswordInput';
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

const PORTAL_COPY: Record<
  LoginPortalType,
  { emailPlaceholder: string; buttonLabel: string }
> = {
  super_admin: {
    emailPlaceholder: 'Enter your work email',
    buttonLabel: 'Enter Super HRM',
  },
  platform_admin: {
    emailPlaceholder: 'Enter your work email',
    buttonLabel: 'Enter HRM Admin',
  },
};

const LOGIN_TAB_LABELS: Record<LoginPortalType, string> = {
  super_admin: 'Super HRM',
  platform_admin: 'HRM Admin',
};

const LOGIN_ACCENT = {
  blob: 'bg-primary/10',
  icon: 'bg-primary shadow-primary/40',
  tab: 'bg-primary text-always-white shadow-md',
  button: 'bg-primary hover:bg-primary-dark shadow-xl shadow-primary/30',
  ring: 'focus:ring-primary/50',
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
  const copy = PORTAL_COPY[portal];
  const styles = LOGIN_ACCENT;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [allowAutofill, setAllowAutofill] = useState(false);

  const switchPortal = (nextPortal: LoginPortalType) => {
    if (nextPortal === portal) return;
    setPortal(nextPortal);
    setEmail('');
    setPassword('');
    setError('');
    setAllowAutofill(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await loginRequest({ email, password }, portal);
      dispatch(login(response));
      console.log('✅ [LOGIN] User logged in:', response.user.email, 'role:', response.user.role);
      setEmail('');
      setPassword('');
      // Force full page reload to ensure fresh state
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
              'w-16 h-16 sm:w-20 sm:h-20 rounded-sm flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-2xl',
              styles.icon
            )}
          >
            <span className="font-semibold text-lg sm:text-xl tracking-tight text-always-white">
              HRM
            </span>
          </div>
          <h1 className="heading-1">{access.title}</h1>
          <p className="text-page-desc mt-2">{access.description}</p>
        </div>

        <div className="glass-card p-6 sm:p-8 lg:p-10 bg-surface/40 border-surface/50 rounded-none">
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-none bg-surface-variant mb-6">
            {LOGIN_PORTAL_ORDER.map((optionId) => (
              <button
                key={optionId}
                type="button"
                onClick={() => switchPortal(optionId)}
                className={cn(
                  'py-2.5 px-3 rounded-none text-xs sm:text-sm font-semibold transition-all',
                  portal === optionId
                    ? styles.tab
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {LOGIN_TAB_LABELS[optionId]}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
            autoComplete="off"
          >
            {error && (
              <div className="rounded-sm bg-error/10 border border-error/20 px-4 py-3 text-sm font-medium text-error">
                {error}
                {error.includes('Super Admin') && portal !== 'super_admin' && (
                  <button
                    type="button"
                    onClick={() => switchPortal('super_admin')}
                    className="ml-2 underline text-primary"
                  >
                    Switch to Super Admin
                  </button>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2 ml-1">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                <input
                  type="email"
                  name="hrm-login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setAllowAutofill(true)}
                  readOnly={!allowAutofill}
                  disabled={isLoading}
                  required={true}
                  className={cn(
                    'w-full pl-12 pr-4 py-3.5 bg-surface dark:bg-surface-variant border-none rounded-sm shadow-inner outline-none focus:ring-2 transition-all text-text-primary disabled:opacity-60 text-sm',
                    styles.ring
                  )}
                  placeholder={copy.emailPlaceholder}
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2 ml-1">
                Password
              </label>
              <PasswordInput
                name="hrm-login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setAllowAutofill(true)}
                readOnly={!allowAutofill}
                disabled={isLoading}
                required={true}
                placeholder="Enter your password"
                autoComplete="new-password"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ml-1">
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

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-3.5 font-semibold rounded-sm transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed text-sm text-always-white',
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
                  {copy.buttonLabel}
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
