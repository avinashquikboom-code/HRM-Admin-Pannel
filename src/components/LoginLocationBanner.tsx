'use client';

import { useEffect, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { consumeLoginLocationBanner } from '@/lib/loginLocation';

export default function LoginLocationBanner() {
  const [location, setLocation] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const loginLocation = consumeLoginLocationBanner();
    if (loginLocation) {
      setLocation(loginLocation);
      setVisible(true);
      console.info('[HRM] Admin logged in from:', loginLocation);
    }
  }, []);

  if (!location) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-label text-primary">
                Current login location
              </p>
              <p className="truncate text-sm font-bold text-text-primary">{location}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="shrink-0 rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-surface-variant hover:text-text-primary"
            aria-label="Dismiss login location"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
