'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Key, 
  X, 
  Save, 
  Lock, 
  ShieldCheck, 
  Loader2, 
  Check 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PasswordInput from '@/components/PasswordInput';
import { updateAdminPassword } from '@/services/profileService';
import { cn } from '@/utils/cn';

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface UpdatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({ isOpen, onClose }) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPasswordValue = watch('newPassword') || '';

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!newPasswordValue) return { score: 0, label: 'No Password', color: 'bg-border' };
    
    let score = 0;
    if (newPasswordValue.length >= 8) score++;
    if (/[0-9]/.test(newPasswordValue)) score++;
    if (/[A-Z]/.test(newPasswordValue)) score++;
    if (/[^A-Za-z0-9]/.test(newPasswordValue)) score++;

    switch (score) {
      case 1:
        return { score, label: 'Weak', color: 'bg-error', textColor: 'text-error' };
      case 2:
        return { score, label: 'Fair', color: 'bg-warning', textColor: 'text-warning' };
      case 3:
        return { score, label: 'Good', color: 'bg-primary/80', textColor: 'text-primary' };
      case 4:
        return { score, label: 'Strong', color: 'bg-success', textColor: 'text-success' };
      default:
        return { score: 0, label: 'Weak', color: 'bg-error', textColor: 'text-error' };
    }
  };

  const strength = getPasswordStrength();

  const handleClose = () => {
    reset();
    setSubmitError('');
    setSuccessMessage('');
    onClose();
  };

  const onSubmit = async (data: PasswordFormData) => {
    setSubmitError('');
    setSuccessMessage('');
    
    try {
      const result = await updateAdminPassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      setSuccessMessage(result.message || 'Password updated successfully!');
      reset();
      
      // Auto close after brief delay
      setTimeout(() => {
        handleClose();
      }, 1800);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to update password.'
      );
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 overflow-y-auto">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-background-dark/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-surface rounded-t-sm sm:rounded overflow-hidden border border-border"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-6">
              
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Key size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-text-primary uppercase tracking-wide">Update Password</h2>
                    <p className="text-xs text-text-secondary">Modify your login credentials securely.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 hover:bg-surface-variant rounded-sm text-muted hover:text-text-primary transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status Alerts */}
              {submitError && (
                <div className="rounded-sm bg-error/10 border border-error/20 px-4 py-3 text-xs font-bold text-error flex items-center gap-2">
                  <X size={14} className="shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {successMessage && (
                <div className="rounded-sm bg-success/10 border border-success/20 px-4 py-3 text-xs font-bold text-success flex items-center gap-2">
                  <Check size={14} className="shrink-0" />
                  <span>{successMessage} Closing modal...</span>
                </div>
              )}

              {/* Inputs */}
              <div className="space-y-4">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">
                    Current Password
                  </label>
                  <PasswordInput
                    placeholder="Enter current password"
                    disabled={isSubmitting || successMessage !== ''}
                    inputClassName={cn(errors.currentPassword && "ring-2 ring-error/50")}
                    {...register('currentPassword')}
                  />
                  {errors.currentPassword && (
                    <p className="text-[10px] text-error font-black uppercase tracking-wider ml-1">
                      {errors.currentPassword.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">
                    New Password
                  </label>
                  <PasswordInput
                    placeholder="Enter new password (min. 8 chars)"
                    disabled={isSubmitting || successMessage !== ''}
                    inputClassName={cn(errors.newPassword && "ring-2 ring-error/50")}
                    {...register('newPassword')}
                  />

                  {/* Strength Bar */}
                  {newPasswordValue && (
                    <div className="space-y-1 pt-0.5">
                      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider">
                        <span className="text-text-secondary">Strength:</span>
                        <span className={strength.textColor}>{strength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-border/40 rounded-full overflow-hidden flex gap-0.5">
                        <div className={cn("h-full transition-all duration-300", strength.score >= 1 ? strength.color : "bg-transparent", "flex-1")} />
                        <div className={cn("h-full transition-all duration-300", strength.score >= 2 ? strength.color : "bg-transparent", "flex-1")} />
                        <div className={cn("h-full transition-all duration-300", strength.score >= 3 ? strength.color : "bg-transparent", "flex-1")} />
                        <div className={cn("h-full transition-all duration-300", strength.score >= 4 ? strength.color : "bg-transparent", "flex-1")} />
                      </div>
                    </div>
                  )}

                  {errors.newPassword && (
                    <p className="text-[10px] text-error font-black uppercase tracking-wider ml-1">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">
                    Confirm New Password
                  </label>
                  <PasswordInput
                    placeholder="Confirm your new password"
                    disabled={isSubmitting || successMessage !== ''}
                    inputClassName={cn(errors.confirmPassword && "ring-2 ring-error/50")}
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <p className="text-[10px] text-error font-black uppercase tracking-wider ml-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Requirement Indicators List */}
              <div className="p-4 rounded-sm bg-surface-variant/40 border border-border/40">
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2.5 ml-1">Requirements Checklist</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <div className={cn(
                      "w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border",
                      newPasswordValue.length >= 8 ? "bg-success/15 border-success/30 text-success" : "border-border/60 text-muted"
                    )}>
                      {newPasswordValue.length >= 8 && <Check size={8} />}
                    </div>
                    <span>Min 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <div className={cn(
                      "w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border",
                      /[0-9]/.test(newPasswordValue) ? "bg-success/15 border-success/30 text-success" : "border-border/60 text-muted"
                    )}>
                      {/[0-9]/.test(newPasswordValue) && <Check size={8} />}
                    </div>
                    <span>1 numeric digit</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <div className={cn(
                      "w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border",
                      /[A-Z]/.test(newPasswordValue) ? "bg-success/15 border-success/30 text-success" : "border-border/60 text-muted"
                    )}>
                      {/[A-Z]/.test(newPasswordValue) && <Check size={8} />}
                    </div>
                    <span>1 uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <div className={cn(
                      "w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border",
                      /[^A-Za-z0-9]/.test(newPasswordValue) ? "bg-success/15 border-success/30 text-success" : "border-border/60 text-muted"
                    )}>
                      {/[^A-Za-z0-9]/.test(newPasswordValue) && <Check size={8} />}
                    </div>
                    <span>1 special character</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-surface-variant text-text-primary font-bold rounded-sm hover:bg-border transition-all active:scale-95 text-center text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || successMessage !== ''}
                  className="flex-1 py-4 btn-primary shadow-xl shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Save Password
                </button>
              </div>

            </form>

            {/* Bottom Accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default UpdatePasswordModal;
