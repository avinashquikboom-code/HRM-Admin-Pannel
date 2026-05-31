'use client';

import { useMemo } from 'react';
import {
  Building2,
  CreditCard,
  IndianRupee,
  MapPin,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import { useCompanyStats } from '@/hooks/useCompanyStats';
import { SUPER_ADMIN_PREFIX } from '@/lib/portals';
import { cn } from '@/utils/cn';
import SuperAdminHeader from '@/components/SuperAdminHeader';
import StatCard from '@/features/dashboard/components/StatCard';
import QuickAccessGrid, {
  type QuickAccessItem,
} from '@/features/dashboard/components/QuickAccessGrid';
import RecentSubscriptionsPanel, {
  SubscriptionAlertsCard,
  PlanMixCard,
} from '@/features/dashboard/components/RecentSubscriptionsPanel';
import DashboardGrowthChart from '@/features/dashboard/components/DashboardGrowthChart';
import DashboardActivityFeed, {
  defaultDashboardActivity,
} from '@/features/dashboard/components/DashboardActivityFeed';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const quickAccessItems: QuickAccessItem[] = [
  {
    title: 'Live Location',
    description: 'Track geofences and employee GPS',
    href: `${SUPER_ADMIN_PREFIX}/location`,
    icon: MapPin,
    tone: 'success',
  },
  {
    title: 'Subscriptions',
    description: 'Plans, billing, and renewals',
    href: `${SUPER_ADMIN_PREFIX}/subscriptions`,
    icon: CreditCard,
    tone: 'accent',
  },
  {
    title: 'Admin Rights',
    description: 'Control admin permissions',
    href: `${SUPER_ADMIN_PREFIX}/user-rights`,
    icon: ShieldCheck,
    tone: 'warning',
  },
  {
    title: 'Companies',
    description: 'Manage organizations and onboarding',
    href: `${SUPER_ADMIN_PREFIX}/companies`,
    icon: Building2,
    tone: 'primary',
  },
  {
    title: 'Settings',
    description: 'Platform configuration',
    href: `${SUPER_ADMIN_PREFIX}/settings`,
    icon: Settings,
    tone: 'primary',
  },
];

export default function SuperAdminDashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const { stats, isLoading, error, refetch } = useCompanyStats();

  const displayName = user?.name?.split(' ')[0] ?? 'Super Admin';

  const activeInvoices = stats?.recentInvoices ?? [];

  const pendingBillingCount = useMemo(
    () =>
      activeInvoices.filter(
        (inv) => inv.status === 'Pending' || inv.status === 'Overdue'
      ).length,
    [activeInvoices]
  );

  const heroHighlights = [
    {
      label: 'Revenue',
      value: isLoading
        ? '—'
        : `₹${((stats?.monthlyRevenue ?? 0) / 1000000).toFixed(1)}M`,
    },
    {
      label: 'Companies',
      value: isLoading ? '—' : String(stats?.totalEntities ?? 0),
    },
    {
      label: 'Pending',
      value: isLoading ? '—' : String(stats?.pendingVerification ?? 0),
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 pb-10"
    >
      <motion.div variants={itemVariants}>
        <SuperAdminHeader
          title={`${getGreeting()}, ${displayName}`}
          subtitle="Track live locations, subscriptions, admin access, and platform activity from one place."
          badgeText="Super HRM Control Center"
          badgeIcon={Sparkles}
          stats={heroHighlights.map(h => ({
            label: h.label,
            value: h.value,
            icon: h.label === 'Revenue' ? IndianRupee : 
                  h.label === 'Companies' ? Building2 : 
                  ShieldCheck
          }))}
        >
          <button 
            onClick={refetch}
            disabled={isLoading}
            className="flex items-center gap-2.5 px-5 py-3 bg-surface/80 hover:bg-surface border border-border rounded-2xl text-sm font-bold text-text-secondary hover:text-primary transition-all duration-300 hover:shadow-md active:scale-95 disabled:opacity-60"
          >
            <RefreshCw size={18} className={cn(isLoading && 'animate-spin')} />
            Refresh
          </button>
        </SuperAdminHeader>
      </motion.div>

      {error && (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-sm text-warning"
        >
          {error} — showing demo figures where available.
        </motion.div>
      )}

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        <StatCard
          label="Monthly revenue"
          value={
            isLoading
              ? '—'
              : `₹${((stats?.monthlyRevenue ?? 0) / 1000000).toFixed(1)}M`
          }
          sub="Platform billing this month"
          icon={IndianRupee}
          tone="primary"
          isLoading={isLoading}
        />
        <StatCard
          label="Total companies"
          value={isLoading ? '—' : String(stats?.totalEntities ?? 0)}
          sub="Registered tenant organizations"
          icon={Building2}
          tone="success"
          isLoading={isLoading}
        />
        <StatCard
          label="Seats in use"
          value={
            isLoading ? '—' : (stats?.globalSeats ?? 0).toLocaleString()
          }
          sub="Active employee seats"
          icon={Users}
          tone="accent"
          isLoading={isLoading}
        />
        <StatCard
          label="Pending verifications"
          value={isLoading ? '—' : String(stats?.pendingVerification ?? 0)}
          sub="Companies awaiting approval"
          icon={ShieldCheck}
          tone="warning"
          isLoading={isLoading}
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start"
      >
        <div className="xl:col-span-8 min-w-0">
          <DashboardGrowthChart data={stats?.growthHistory} />
        </div>
        <div className="xl:col-span-4 space-y-4 min-w-0">
          <SubscriptionAlertsCard pendingCount={pendingBillingCount} />
          <PlanMixCard plans={stats?.planMix} />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <QuickAccessGrid items={quickAccessItems} />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        <div className="lg:col-span-7 min-w-0">
          <RecentSubscriptionsPanel invoices={activeInvoices} />
        </div>
        <div className="lg:col-span-5 min-w-0">
          <DashboardActivityFeed items={stats?.recentActivity ?? defaultDashboardActivity} />
        </div>
      </motion.div>
    </motion.div>
  );
}
