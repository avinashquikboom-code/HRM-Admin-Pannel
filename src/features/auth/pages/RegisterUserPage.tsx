"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, UserPlus, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PasswordInput from '@/components/PasswordInput';
import { useRouter } from 'next/navigation';
import { registerUser, type RegisterRole } from '@/services/authService';
import { getAuthSession } from '@/lib/authStorage';
import { isDevAuthSession } from '@/lib/devAuth';
import { UserRightsPreview } from '@/components/UserRightsControl';
import type { PortalType } from '@/lib/portals';

const ROLES: RegisterRole[] = ['EMPLOYEE', 'HR'];

const REGISTER_ROLE_PORTAL: Record<RegisterRole, PortalType> = {
  EMPLOYEE: 'employee',
  HR: 'platform_admin',
};

const RegisterUserPage = () => {
  const router = useRouter();
  const adminSession = getAuthSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RegisterRole>('EMPLOYEE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const result = await registerUser({ email, password, role });
      setSuccess(`${result.message} — ${result.user.email} (${result.user.role})`);
      setEmail('');
      setPassword('');
      setRole('EMPLOYEE');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="p-3 bg-surface border border-border rounded-2xl text-text-secondary hover:text-primary transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="heading-1 tracking-tight">Register User</h1>
          <p className="text-page-desc mt-1">
            Create a new account using your admin token from shared auth storage.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 sm:p-8 lg:p-10"
      >
        <div className="mb-6 rounded-2xl border border-border bg-surface-variant/40 px-4 py-3 text-xs font-mono text-text-secondary space-y-1">
          <p>
            <span className="font-bold text-primary">POST</span>{' '}
            /api/auth/register
          </p>
          <p>{'{ email, password, role: "EMPLOYEE" | "HR" }'}</p>
          <p>Authorization: Bearer &lt;admin-token-from-hrm_auth&gt;</p>
        </div>

        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          {isDevAuthSession() ? (
            <p className="font-medium text-warning">
              Offline demo mode is active. Sign in with the real backend to register users.
            </p>
          ) : adminSession ? (
            <p className="font-medium text-text-primary">
              Using admin token for{' '}
              <span className="font-bold text-primary">{adminSession.user.email}</span>
            </p>
          ) : (
            <p className="font-medium text-error">
              No admin token found.{' '}
              <Link href="/login" className="font-bold underline">
                Sign in first
              </Link>
            </p>
          )}
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {error && (
            <div className="rounded-2xl bg-error/10 border border-error/20 px-4 py-3 text-sm font-medium text-error">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-2xl bg-success/10 border border-success/20 px-4 py-3 text-sm font-medium text-success">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-text-primary mb-2 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full pl-12 pr-4 py-4 bg-surface-variant border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 transition-all text-text-primary disabled:opacity-60"
                placeholder="newuser@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-text-primary mb-2 ml-1">Password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={8}
              inputClassName="bg-surface-variant shadow-none"
              placeholder="Password@123"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text-primary mb-2 ml-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as RegisterRole)}
              disabled={isLoading}
              className="w-full px-4 py-4 bg-surface-variant border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 transition-all text-text-primary font-medium disabled:opacity-60"
            >
              {ROLES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <div className="mt-4">
              <UserRightsPreview portal={REGISTER_ROLE_PORTAL[role]} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isDevAuthSession() || !adminSession}
            className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <UserPlus size={22} />
                Register User
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-3 justify-center text-muted text-xs font-semibold uppercase tracking-widest">
          <div className="h-px w-10 bg-border"></div>
          <span>Admin Protected</span>
          <div className="h-px w-10 bg-border"></div>
        </div>

        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2 text-success">
            <ShieldCheck size={16} />
            <span className="text-micro font-bold">Bearer token from hrm_auth + cookie</span>
          </div>
        </div>
      </motion.div>

      <p className="text-center text-text-secondary text-sm">
        Already have an account?{' '}
        <Link href="/employees" className="font-bold text-primary hover:text-primary-dark">
          View employees
        </Link>
      </p>
    </div>
  );
};

export default RegisterUserPage;
