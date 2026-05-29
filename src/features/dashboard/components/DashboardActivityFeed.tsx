'use client';

import {
  AlertCircle,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

const typeStyles = {
  success: 'border-success/20 bg-success/5',
  warning: 'border-warning/20 bg-warning/5',
  error: 'border-error/20 bg-error/5',
  info: 'border-primary/20 bg-primary/5',
};

const dotStyles = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-primary',
};

const typeIcons = {
  success: CheckCircle2,
  warning: AlertCircle,
  error: AlertCircle,
  info: Building2,
};

interface DashboardActivityFeedProps {
  items: ActivityItem[];
}

export default function DashboardActivityFeed({
  items,
}: DashboardActivityFeedProps) {
  return (
    <div className="rounded-3xl border border-border/60 bg-surface flex flex-col min-h-[360px] shadow-sm">
      <div className="px-5 py-4 border-b border-border bg-surface-variant/30 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="heading-2">Activity timeline</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Latest platform events
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Live
          </span>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto p-5 max-h-[520px] xl:max-h-none">
        <div className="pointer-events-none absolute left-[29px] top-5 bottom-5 w-px bg-border" />

        <div className="space-y-4">
          {items.map((item, index) => {
            const Icon = typeIcons[item.type];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className="relative flex gap-4 pl-1"
              >
                <div className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-surface bg-surface shadow-sm">
                  <span
                    className={cn('h-2.5 w-2.5 rounded-full', dotStyles[item.type])}
                  />
                </div>

                <div
                  className={cn(
                    'min-w-0 flex-1 rounded-2xl border p-4',
                    typeStyles[item.type]
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <Icon size={14} className="shrink-0 mt-0.5 opacity-70" />
                      <p className="text-sm font-semibold text-text-primary">
                        {item.title}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-text-secondary leading-relaxed pl-6">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const defaultDashboardActivity: ActivityItem[] = [
  {
    id: '1',
    title: 'New company onboarded',
    description: 'TechVibe Inc. was added with an Enterprise plan.',
    time: '2h ago',
    type: 'success',
  },
  {
    id: '2',
    title: 'Verification pending',
    description: 'EcoWare Solutions is awaiting document verification.',
    time: '5h ago',
    type: 'warning',
  },
  {
    id: '3',
    title: 'Subscription renewed',
    description: 'Innovate Digital renewed Enterprise subscription.',
    time: '1d ago',
    type: 'success',
  },
  {
    id: '4',
    title: 'Admin rights updated',
    description: 'Permissions changed for 2 platform administrators.',
    time: '2d ago',
    type: 'info',
  },
  {
    id: '5',
    title: 'Payment failed',
    description: 'Global Logistics renewal could not be processed.',
    time: '3d ago',
    type: 'error',
  },
];
