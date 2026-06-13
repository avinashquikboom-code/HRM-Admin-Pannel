'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface SettingsToggleProps {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export default function SettingsToggle({
  title,
  description,
  enabled,
  onChange,
}: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-sm border border-border/60 bg-surface-variant/30 px-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative h-8 w-14 shrink-0 rounded-full transition-colors',
          enabled ? 'bg-primary' : 'bg-border'
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-sm"
          animate={{ x: enabled ? 24 : 0 }}
        />
      </button>
    </div>
  );
}
