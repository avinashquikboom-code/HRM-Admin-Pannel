'use client';

import { Building2, MapPin, Radio, Users } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '@/utils/cn';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

interface LocationStatsBarProps {
  activeStaff: number;
  inOfficeCount: number;
  breachesCount: number;
  officeCount: number;
  isLive: boolean;
}

export default function LocationStatsBar({
  activeStaff,
  inOfficeCount,
  breachesCount,
  officeCount,
  isLive,
}: LocationStatsBarProps) {
  const stats = [
    {
      label: 'Tracked employees',
      value: activeStaff,
      sub: 'With active GPS signal',
      icon: Users,
      tone: 'primary' as const,
    },
    {
      label: 'In office',
      value: inOfficeCount,
      sub: 'Inside geofence',
      icon: Building2,
      tone: 'success' as const,
    },
    {
      label: 'Outside geofence',
      value: breachesCount,
      sub: breachesCount > 0 ? 'Needs attention' : 'All clear',
      icon: MapPin,
      tone: 'warning' as const,
    },
    {
      label: 'Offices',
      value: officeCount,
      sub: isLive ? 'Live updates on' : 'Updates paused',
      icon: Radio,
      tone: isLive ? ('accent' as const) : ('muted' as const),
    },
  ];

  const toneStyles = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    accent: 'bg-accent/10 text-accent',
    muted: 'bg-muted/10 text-muted',
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={itemVariants}
          className="glass-card p-5 flex items-start gap-4"
        >
          <div
            className={cn(
              'p-3 rounded-sm shrink-0',
              toneStyles[stat.tone]
            )}
          >
            <stat.icon size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="text-2xl font-black text-text-primary mt-1 tabular-nums">
              {stat.value}
            </p>
            <p className="text-xs text-muted mt-0.5 truncate">{stat.sub}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
