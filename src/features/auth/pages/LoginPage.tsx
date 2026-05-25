"use client";

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '@/store/slices/authSlice';
import { loginRequest } from '@/services/authService';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

const LoginPage = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('admin@quickboom.com');
  const [password, setPassword] = useState('Password@123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await loginRequest({ email, password });
      dispatch(login(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/40">
            <span className="text-white font-black text-2xl tracking-tighter">HRM</span>
          </div>
          <h1 className="text-4xl font-black text-text-primary tracking-tight">Super Admin</h1>
          <p className="text-text-secondary mt-2 text-lg">Payroll & HRMS Ecosystem</p>
        </div>

        <div className="glass-card p-10 bg-surface/40 border-surface/50">
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
                  className="w-full pl-12 pr-4 py-4 bg-surface dark:bg-surface-variant border-none rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-primary/50 transition-all text-text-primary disabled:opacity-60"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-surface dark:bg-surface-variant border-none rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-primary/50 transition-all text-text-primary disabled:opacity-60"
                  placeholder="••••••••"
                />
              </div>
            </div>

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
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={22} />
                  Enter Dashboard
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-3 justify-center text-muted text-xs font-semibold uppercase tracking-widest">
            <div className="h-px w-10 bg-border"></div>
            <span>Secure Access</span>
            <div className="h-px w-10 bg-border"></div>
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <div className="flex items-center gap-2 text-success">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-bold">256-bit SSL</span>
            </div>
          </div>
        </div>

        <p className="text-center mt-10 text-text-secondary text-sm">
          Protected by HRM Security Systems. <a>Ecosystem Policy</a>
          <br/>
          &copy; 2024 All Rights Reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
