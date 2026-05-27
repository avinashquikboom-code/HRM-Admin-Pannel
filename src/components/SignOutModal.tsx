import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, AlertTriangle } from 'lucide-react';

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const SignOutModal: React.FC<SignOutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background-dark/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-surface rounded-t-[28px] sm:rounded-[32px] shadow-2xl overflow-hidden border border-border"
          >
            <div className="p-5 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center text-error">
                  <AlertTriangle size={28} />
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-surface-variant rounded-xl text-muted transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <h2 className="text-lg font-semibold text-text-primary mb-2">Sign Out?</h2>
              <p className="text-text-secondary leading-relaxed mb-8">
                Are you sure you want to sign out of your account? You'll need to log back in to access your dashboard.
              </p>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 bg-surface-variant text-text-primary font-bold rounded-2xl hover:bg-border transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 py-4 bg-error text-white font-bold rounded-2xl shadow-lg shadow-error/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Bottom Accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-error/40 via-error to-error/40" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SignOutModal;
