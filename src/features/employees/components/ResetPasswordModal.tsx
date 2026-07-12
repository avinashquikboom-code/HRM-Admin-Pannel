"use client";

import { useState } from 'react';
import { X, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { resetEmployeePassword } from '@/services/employeeService';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    user?: {
      id: number;
      email: string;
      role: string;
      isActive: boolean;
    } | null;
  } | null;
  onSuccess: () => void;
}

const ResetPasswordModal = ({ isOpen, onClose, employee, onSuccess }: ResetPasswordModalProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [isTemporary, setIsTemporary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!employee?.id) {
      setError('Employee ID not found');
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetEmployeePassword(employee.id, {
        newPassword,
        isTemporary,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setIsTemporary(false);
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                    <Lock size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Reset Password</h3>
                    <p className="text-xs text-slate-400">
                      {employee?.firstName} {employee?.lastName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-4 py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <CheckCircle size={32} className="text-emerald-450" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">Password Reset Successful</p>
                      <p className="text-sm text-slate-400 mt-1">
                        {isTemporary ? 'Temporary password has been set' : 'Password has been updated'}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                        <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-rose-400">{error}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-lg outline-none focus:border-primary/50 transition-colors text-sm text-white placeholder-slate-500"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isTemporary"
                        checked={isTemporary}
                        onChange={(e) => setIsTemporary(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-slate-950/50 text-primary focus:ring-primary/50"
                        disabled={isLoading}
                      />
                      <label
                        htmlFor="isTemporary"
                        className="text-sm text-slate-300 cursor-pointer select-none"
                      >
                        Mark as temporary password (user must change on next login)
                      </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || !newPassword}
                        className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ResetPasswordModal;
