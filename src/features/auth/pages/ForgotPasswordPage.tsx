"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-sm flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-2xl shadow-primary/40">
            <span className="text-white font-semibold text-lg sm:text-xl tracking-tight">HRM</span>
          </div>
          <h1 className="heading-1">Identity Recovery</h1>
          <p className="text-page-desc mt-2">Reset your admin credentials securely</p>
        </div>

        <div className="glass-card p-6 sm:p-8 lg:p-10 bg-surface/40 border-surface/50 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="mb-8">
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Enter your verified work email address. If an account exists, we will send a cryptographic reset link to your inbox.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-micro font-black text-muted uppercase tracking-[0.2em] mb-2 ml-1">Work Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-surface dark:bg-surface-variant border-none rounded-sm shadow-inner outline-none focus:ring-2 focus:ring-primary/50 transition-all text-text-primary font-medium"
                        placeholder="admin@hrm.ai"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest text-xs rounded-sm shadow-xl shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-8 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      'Request Reset Link'
                    )}
                  </button>
                </form>

                <button 
                  onClick={() => router.push('/login')}
                  className="w-full py-4 text-xs font-black text-text-secondary uppercase tracking-widest flex items-center justify-center gap-2 hover:text-primary transition-colors mt-2"
                >
                  <ArrowLeft size={16} />
                  Back to Security Portal
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 text-success border border-success/20">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-xl font-black text-text-primary mb-3">Transmission Successful</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-8">
                  Security protocols initiated. Check your inbox for <b>{email}</b> to complete the identity verification process.
                </p>
                
                <button 
                  onClick={() => router.push('/login')}
                  className="w-full py-4 bg-surface-variant text-text-primary font-black uppercase tracking-widest text-xs rounded-sm hover:bg-border transition-all shadow-sm"
                >
                  Return to Login
                </button>
                
                <p className="mt-6 text-micro font-bold text-muted uppercase tracking-tighter">
                  Link expires in 15 minutes
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-10 flex justify-center gap-4 text-muted">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span className="text-label">End-to-End Encryption</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
