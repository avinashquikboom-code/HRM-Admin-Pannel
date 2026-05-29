'use client';

import { cn } from '@/utils/cn';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  tone?: 'primary' | 'success' | 'warning' | 'accent';
  badge?: string;
  badgeTone?: 'success' | 'warning';
  isLoading?: boolean;
  className?: string;
}

const toneMap = {
  primary: {
    icon: 'bg-primary/10 text-primary',
    glow: 'bg-primary/20',
    ring: 'group-hover:border-primary/30',
  },
  success: {
    icon: 'bg-success/10 text-success',
    glow: 'bg-success/20',
    ring: 'group-hover:border-success/30',
  },
  warning: {
    icon: 'bg-warning/10 text-warning',
    glow: 'bg-warning/20',
    ring: 'group-hover:border-warning/30',
  },
  accent: {
    icon: 'bg-accent/10 text-accent',
    glow: 'bg-accent/20',
    ring: 'group-hover:border-accent/30',
  },
};

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'primary',
  badge,
  badgeTone = 'success',
  isLoading,
  className,
}: StatCardProps) {
  const styles = toneMap[tone];

  return (
    <div
      className={cn(
        'group relative isolate min-h-[152px] rounded-3xl border border-border/60 bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-premium',
        styles.ring,
        isLoading && 'animate-pulse',
        className
      )}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-6 -top-6 z-0 h-24 w-24 rounded-full blur-2xl opacity-60',
          styles.glow
        )}
      />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className={cn('rounded-2xl p-3 shrink-0', styles.icon)}>
          <Icon size={20} />
        </div>
        {badge && (
          <span
            className={cn(
              'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
              badgeTone === 'warning'
                ? 'bg-warning/10 text-warning'
                : 'bg-success/10 text-success'
            )}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="relative z-10 mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary break-words">
          {label}
        </p>
        <p className="mt-1 text-2xl sm:text-3xl font-black tabular-nums text-text-primary break-words">
          {value}
        </p>
        {sub && (
          <p className="mt-1 text-xs text-muted leading-relaxed break-words">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
