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
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import { useCompanyStats } from '@/hooks/useCompanyStats';
import { SUPER_ADMIN_PREFIX } from '@/lib/portals';
import DashboardHero from '@/features/dashboard/components/DashboardHero';
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
      label: 'Seats',
      value: isLoading
        ? '—'
        : (stats?.globalSeats ?? 0) >= 1000
          ? `${((stats?.globalSeats ?? 0) / 1000).toFixed(1)}k`
          : String(stats?.globalSeats ?? 0),
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
        <DashboardHero
          greeting={getGreeting()}
          displayName={displayName}
          isLoading={isLoading}
          onRefresh={refetch}
          highlights={heroHighlights}
        />
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
          label="Employee seats"
          value={
            isLoading ? '—' : (stats?.globalSeats ?? 0).toLocaleString()
          }
          sub="Used across all tenants"
          icon={Users}
          tone="success"
          isLoading={isLoading}
        />
        <StatCard
          label="Billing alerts"
          value={isLoading ? '—' : pendingBillingCount}
          sub={
            pendingBillingCount > 0
              ? 'Pending or overdue invoices'
              : 'All payments clear'
          }
          icon={CreditCard}
          tone="warning"
          badge={pendingBillingCount > 0 ? 'Action' : 'Clear'}
          badgeTone={pendingBillingCount > 0 ? 'warning' : 'success'}
          isLoading={isLoading}
        />
        <StatCard
          label="Platform growth"
          value={isLoading ? '—' : stats?.systemGrowth ?? '—'}
          sub="Compared to last month"
          icon={TrendingUp}
          tone="accent"
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
