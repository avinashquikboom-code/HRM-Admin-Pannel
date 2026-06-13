'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface QuickAccessItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: 'primary' | 'success' | 'warning' | 'accent';
}

const toneStyles = {
  primary: {
    bar: 'bg-primary',
    icon: 'bg-primary/10 text-primary',
    hover: 'hover:border-primary/30 hover:bg-primary/[0.03]',
  },
  success: {
    bar: 'bg-success',
    icon: 'bg-success/10 text-success',
    hover: 'hover:border-success/30 hover:bg-success/[0.03]',
  },
  warning: {
    bar: 'bg-warning',
    icon: 'bg-warning/10 text-warning',
    hover: 'hover:border-warning/30 hover:bg-warning/[0.03]',
  },
  accent: {
    bar: 'bg-accent',
    icon: 'bg-accent/10 text-accent',
    hover: 'hover:border-accent/30 hover:bg-accent/[0.03]',
  },
};

interface QuickAccessGridProps {
  items: QuickAccessItem[];
}

export default function QuickAccessGrid({ items }: QuickAccessGridProps) {
  return (
    <div className="rounded-sm border border-border/60 bg-surface p-4 sm:p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="heading-2">Modules</h3>
        <p className="text-xs text-text-secondary mt-1">
          Open a Super Admin section
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {items.map((item) => {
          const styles = toneStyles[item.tone];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex min-h-[88px] items-start gap-3 rounded-sm border border-border/60 bg-surface-variant/30 p-4 transition-all',
                styles.hover
              )}
            >
              <span
                className={cn(
                  'absolute inset-y-0 left-0 w-1 rounded-r-full',
                  styles.bar
                )}
              />
              <div className={cn('rounded-sm p-2.5 shrink-0', styles.icon)}>
                <item.icon size={18} />
              </div>
              <div className="min-w-0 flex-1 pr-4">
                <p className="font-semibold text-sm text-text-primary group-hover:text-primary transition-colors">
                  {item.title}
                </p>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <ArrowUpRight
                size={16}
                className="absolute top-4 right-3 shrink-0 text-muted group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
