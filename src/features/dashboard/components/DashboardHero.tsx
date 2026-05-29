'use client';

import Link from 'next/link';
import { MapPin, RefreshCw, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SUPER_ADMIN_PREFIX } from '@/lib/portals';

interface DashboardHeroProps {
  greeting: string;
  displayName: string;
  isLoading: boolean;
  onRefresh: () => void;
  highlights: { label: string; value: string }[];
}

export default function DashboardHero({
  greeting,
  displayName,
  isLoading,
  onRefresh,
  highlights,
}: DashboardHeroProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary via-primary-dark to-secondary p-6 sm:p-8 text-white shadow-premium">
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles size={12} />
            Super HRM Control Center
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">
            {greeting}, {displayName}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/75 leading-relaxed">
            Track live locations, subscriptions, admin access, and platform
            activity from one place. Today is {today}.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={`${SUPER_ADMIN_PREFIX}/location`}
              className="inline-flex items-center gap-2 rounded-2xl bg-white text-primary px-4 py-2.5 text-sm font-semibold shadow-lg hover:bg-white/95 transition-all"
            >
              <MapPin size={16} />
              Live location
            </Link>
            <Link
              href={`${SUPER_ADMIN_PREFIX}/subscriptions`}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur-sm hover:bg-white/15 transition-all"
            >
              Subscriptions
            </Link>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur-sm hover:bg-white/15 transition-all disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={cn(isLoading && 'animate-spin')}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 min-w-0 xl:min-w-[360px]">
          {highlights.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                {item.label}
              </p>
              <p className="mt-1 text-lg sm:text-xl font-bold tabular-nums break-words">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
