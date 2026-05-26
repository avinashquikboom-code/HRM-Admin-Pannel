"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, UserPlus, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PasswordInput from '@/components/PasswordInput';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/services/authService';

const ROLES = ['EMPLOYEE', 'ADMIN', 'HR', 'MANAGER'] as const;

const RegisterUserPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('EMPLOYEE');
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
      setSuccess(result.message);
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
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Register User</h1>
          <p className="text-text-secondary mt-1">
            Create a new account in the HRM ecosystem using your admin credentials.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-10"
      >
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
                placeholder="user@company.com"
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
              placeholder="Enter your password"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text-primary mb-2 ml-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-4 bg-surface-variant border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 transition-all text-text-primary font-medium disabled:opacity-60"
            >
              {ROLES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
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
            <span className="text-[10px] font-bold">Uses shared admin token</span>
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
