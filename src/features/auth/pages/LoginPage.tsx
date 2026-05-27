"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { loginRequest } from '@/services/authService';
import { motion } from 'framer-motion';
import { Mail, LogIn, ShieldCheck, Loader2 } from 'lucide-react';
import PasswordInput from '@/components/PasswordInput';
import {
  DEFAULT_PLATFORM_DEV_EMAIL,
  DEFAULT_PLATFORM_DEV_PASSWORD,
} from '@/lib/devAuth';
import { PLATFORM_HOME } from '@/lib/portals';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState(DEFAULT_PLATFORM_DEV_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PLATFORM_DEV_PASSWORD);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await loginRequest(
        { email, password },
        'platform_admin'
      );
      dispatch(login(response));
      window.location.href = PLATFORM_HOME;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-2xl shadow-primary/40">
            <span className="text-white font-semibold text-lg sm:text-xl tracking-tight">HRM</span>
          </div>
          <h1 className="heading-1">Admin Panel Login</h1>
          <p className="text-page-desc mt-2">HR, payroll, attendance & operations</p>
        </div>

        <div className="glass-card p-6 sm:p-8 lg:p-10 bg-surface/40 border-surface/50">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="rounded-2xl bg-error/10 border border-error/20 px-4 py-3 text-sm font-medium text-error">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2 ml-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-surface dark:bg-surface-variant border-none rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-primary/50 transition-all text-text-primary disabled:opacity-60 text-sm"
                  placeholder="hr@quickboom.com"
                  autoComplete="email"
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
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <p className="text-xs text-text-secondary ml-1">
              Offline demo: {DEFAULT_PLATFORM_DEV_EMAIL} / {DEFAULT_PLATFORM_DEV_PASSWORD}
            </p>

            <div className="flex items-center justify-between ml-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                <span className="text-sm text-text-secondary font-medium">Keep me signed in</span>
              </label>
              <Link href="/forgot-password" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors">Forgot Password?</Link>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Enter Admin Panel
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center space-y-3">
            <Link
              href="/super-admin/login"
              className="text-sm font-medium text-secondary hover:text-primary transition-colors"
            >
              Super Admin login instead
            </Link>
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <div className="flex items-center gap-2 text-success">
              <ShieldCheck size={16} />
              <span className="text-micro font-bold">256-bit SSL</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
