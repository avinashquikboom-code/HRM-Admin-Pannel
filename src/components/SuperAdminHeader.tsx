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

      <div className="relative z-10 grid grid-cols-1 gap-4 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
        <div className="relative z-10 space-y-3">
          {badgeText && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-emerald-500/10 border border-primary/30 text-primary text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-inner">
              <BadgeIcon size={12} className="animate-pulse" />
              {badgeText}
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-black text-text-primary tracking-tight leading-none animate-text-reveal">
            {title}
          </h1>
          <p className="text-xs md:text-sm text-text-secondary font-medium max-w-xl leading-relaxed mt-1">
            {subtitle}
          </p>
          {children && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {children}
            </div>
          )}
        </div>
        {stats && (
          <div className="relative z-10 shrink-0 grid grid-cols-1 min-[450px]:grid-cols-2 gap-4 bg-surface-variant/40 dark:bg-slate-900/50 border border-border/50 dark:border-white/5 p-5 rounded-[1.5rem] backdrop-blur-2xl shadow-sm dark:shadow-2xl">
            {stats.map((item) => (
              <div key={item.label} className="flex flex-col items-start bg-surface-variant/50 hover:bg-surface-variant/80 dark:bg-white/5 dark:hover:bg-white/10 p-4 rounded-xl border border-border/50 dark:border-white/10 transition-all duration-300">
                <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <item.icon size={12} className="text-primary" />
                  {item.label}
                </span>
                <span className="text-2xl font-black text-text-primary tracking-wider font-mono">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
