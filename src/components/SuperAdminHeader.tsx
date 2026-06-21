'use client';

import { motion, Variants } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Sparkles, type LucideIcon } from 'lucide-react';

interface SuperAdminHeaderProps {
  title: string;
  subtitle: string;
  badgeText?: string;
  badgeIcon?: LucideIcon;
  stats?: Array<{
    label: string;
    value: string;
    icon: LucideIcon;
  }>;
  children?: React.ReactNode;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function SuperAdminHeader({
  title,
  subtitle,
  badgeText,
  badgeIcon: BadgeIcon = Sparkles,
  stats,
  children
}: SuperAdminHeaderProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="relative overflow-hidden rounded-sm border border-border/50 dark:border-white/10 bg-surface dark:bg-gradient-to-br dark:from-slate-900/90 dark:to-slate-950/95 backdrop-blur-xl p-8 md:p-10 shadow-sm dark:shadow-2xl"
    >
      <div className="absolute -top-12 -right-12 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -left-12 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
        <div>
          {badgeText && (
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-2 text-xs font-black uppercase tracking-widest text-primary">
              <BadgeIcon size={14} />
              {badgeText}
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-text-primary animate-text-reveal leading-tight">
            {title}
          </h1>
          <p className="text-page-desc mt-3 max-w-2xl">
            {subtitle}
          </p>
          {children && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {children}
            </div>
          )}
        </div>
        {stats && (
          <div className="grid grid-cols-1 min-[450px]:grid-cols-2 gap-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-sm border border-border bg-surface-variant p-4">
                <item.icon size={20} className="mb-4 text-primary" />
                <p className="text-xl sm:text-2xl font-black text-text-primary tracking-tight break-all">{item.value}</p>
                <p className="mt-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-text-secondary">{item.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
