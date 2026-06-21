import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-2xl' 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-secondary/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              'relative w-full bg-surface rounded-t-sm sm:rounded border border-border overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col',
              maxWidth
            )}
          >
            <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-border/50 flex items-center justify-between gap-4 shrink-0">
              <h3 className="text-lg sm:text-xl font-bold text-text-primary">{title}</h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-surface-variant rounded-sm transition-colors text-muted hover:text-text-primary shrink-0"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 overflow-y-auto no-scrollbar flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
