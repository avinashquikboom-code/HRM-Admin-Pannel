import React, { useEffect, useReducer, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
}) => {
  const [mounted, setMounted] = useState(false);
  // Force a re-render (to recompute the content-area rect) when the sidebar
  // collapses/expands or the window is resized.
  const [, forceTick] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const container = document.getElementById('app-content-area');

    // Keep the overlay aligned with responsive layout changes.
    const onChange = () => forceTick();
    const resizeObserver =
      container && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(onChange)
        : null;
    resizeObserver?.observe(container as Element);
    window.addEventListener('resize', onChange);

    // Prevent page scrolling while the modal is open.
    const prevContainerOverflow = container?.style.overflow;
    if (container) container.style.overflow = 'hidden';
    const prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', onChange);
      if (container) container.style.overflow = prevContainerOverflow ?? '';
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [isOpen]);

  if (!mounted) return null;

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  // Measure the content area synchronously during render so the modal is
  // pinned to it on the very first paint (no full-screen flash). Pinning to
  // the content area keeps the sidebar visible and undimmed. Falls back to
  // full-viewport if the container is not present.
  let overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0 };
  if (isOpen) {
    const container = document.getElementById('app-content-area');
    if (container) {
      const r = container.getBoundingClientRect();
      overlayStyle = {
        position: 'fixed',
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      };
    }
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          style={overlayStyle}
          className="z-[9999] flex items-end sm:items-center justify-center p-4"
        >
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-surface rounded-t-sm sm:rounded overflow-hidden border border-border"
          >
            <div className="p-5 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-sm bg-error/10 flex items-center justify-center text-error">
                  <AlertTriangle size={28} />
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="p-2 hover:bg-surface-variant rounded-sm text-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <X size={20} />
                </button>
              </div>

              <h2 className="text-lg font-semibold text-text-primary mb-2">{title}</h2>
              <div className="text-text-secondary leading-relaxed mb-8">
                {message}
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 py-4 bg-surface-variant text-text-primary font-bold rounded-sm hover:bg-border transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    if (!isLoading) onConfirm();
                  }}
                  disabled={isLoading}
                  className="flex-1 py-4 bg-error text-white font-bold rounded-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-error/40 via-error to-error/40" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ConfirmModal;
