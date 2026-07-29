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
    trend?: string;
    trendUp?: boolean;
    badge?: string;
    color?: string;
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
      className="relative overflow-hidden rounded-2xl border border-border/60 dark:border-white/10 bg-surface/90 dark:bg-slate-900/90 backdrop-blur-2xl p-6 md:p-8 shadow-lg dark:shadow-2xl transition-all duration-300"
    >
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -left-12 w-80 h-80 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="relative z-10 space-y-3.5">
          {badgeText && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/15 via-emerald-500/10 to-teal-500/15 border border-primary/30 text-primary text-[10.5px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-sm backdrop-blur-md">
              <BadgeIcon size={13} className="animate-pulse text-primary" />
              <span>{badgeText}</span>
            </div>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-text-primary tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-xs md:text-sm text-text-secondary font-medium max-w-xl leading-relaxed">
            {subtitle}
          </p>
          {children && (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {children}
            </div>
          )}
        </div>
        {stats && (
          <div className="relative z-10 shrink-0 grid grid-cols-1 min-[450px]:grid-cols-2 gap-3.5 bg-surface-variant/40 dark:bg-slate-950/40 border border-border/50 dark:border-white/10 p-4 md:p-5 rounded-2xl backdrop-blur-2xl shadow-inner">
            {stats.map((item) => (
              <div 
                key={item.label} 
                className="group relative overflow-hidden flex flex-col justify-between bg-surface/70 hover:bg-surface dark:bg-white/[0.04] dark:hover:bg-white/[0.08] p-4 rounded-xl border border-border/50 dark:border-white/10 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider flex items-center gap-1.5 truncate">
                    <span className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                      <item.icon size={13} />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {item.badge}
                    </span>
                  )}
                  {item.trend && (
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      item.trendUp !== false 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      {item.trend}
                    </span>
                  )}
                </div>
                <div className="text-xl md:text-2xl font-black text-text-primary tracking-tight font-mono mt-1">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
