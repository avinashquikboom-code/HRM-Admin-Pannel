'use client';

import Link from 'next/link';
import { ChevronRight, CreditCard } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SUPER_ADMIN_PREFIX } from '@/lib/portals';

interface InvoiceRow {
  id: string;
  company: string;
  plan: string;
  amount: string;
  status: string;
  date: string;
}

interface RecentSubscriptionsPanelProps {
  invoices: InvoiceRow[];
}

function statusStyle(status: string) {
  if (status === 'Paid') return 'bg-success/10 text-success';
  if (status === 'Overdue') return 'bg-error/10 text-error';
  return 'bg-warning/10 text-warning';
}

function planStyle(plan: string) {
  if (plan === 'Enterprise') return 'text-primary bg-primary/10';
  if (plan === 'Pro') return 'text-accent bg-accent/10';
  return 'text-text-secondary bg-surface-variant';
}

export default function RecentSubscriptionsPanel({
  invoices,
}: RecentSubscriptionsPanelProps) {
  return (
    <div className="rounded-3xl border border-border/60 bg-surface shadow-sm flex flex-col">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 bg-surface-variant/30">
        <div>
          <h3 className="heading-2">Recent billing</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Latest subscription invoices and renewals
          </p>
        </div>
        <Link
          href={`${SUPER_ADMIN_PREFIX}/subscriptions`}
          className="inline-flex items-center gap-1 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15 transition-colors shrink-0"
        >
          View all
          <ChevronRight size={14} />
        </Link>
      </div>

      <div className="overflow-x-auto rounded-b-3xl">
        <table className="w-full min-w-[480px] text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-text-secondary border-b border-border">
              <th className="px-5 py-3 font-bold">Invoice</th>
              <th className="px-5 py-3 font-bold">Plan</th>
              <th className="px-5 py-3 font-bold">Amount</th>
              <th className="px-5 py-3 font-bold text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-text-secondary">
                  No recent invoices available yet. Refresh to load the latest billing data.
                </td>
              </tr>
            ) : (
              invoices.map((invoice, index) => (
                <tr
                  key={invoice.id}
                  className={cn(
                    'border-b border-border/60 last:border-0 transition-colors hover:bg-surface-variant/25',
                    index % 2 === 1 && 'bg-surface-variant/15'
                  )}
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-text-primary text-sm">
                      {invoice.id}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {invoice.company}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        'inline-flex rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide',
                        planStyle(invoice.plan)
                      )}
                    >
                      {invoice.plan}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-text-primary tabular-nums">
                    {invoice.amount}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
                        statusStyle(invoice.status)
                      )}
                    >
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SubscriptionAlertsCard({
  pendingCount,
}: {
  pendingCount: number;
}) {
  return (
    <div className="rounded-3xl border border-accent/25 bg-gradient-to-br from-accent/10 via-surface to-surface p-5 shadow-sm flex flex-col">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-accent/15 p-3 text-accent shrink-0">
          <CreditCard size={20} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            Billing attention
          </p>
          <p className="mt-1 text-2xl font-black text-text-primary tabular-nums">
            {pendingCount}
          </p>
          <p className="mt-1 text-xs text-text-secondary leading-relaxed">
            {pendingCount > 0
              ? 'Invoices pending payment or overdue renewal.'
              : 'All subscription payments are up to date.'}
          </p>
        </div>
      </div>

      <Link
        href={`${SUPER_ADMIN_PREFIX}/subscriptions`}
        className={cn(
          'mt-5 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all',
          pendingCount > 0
            ? 'bg-accent text-secondary hover:opacity-90'
            : 'bg-surface-variant text-text-secondary hover:text-primary'
        )}
      >
        Open subscriptions
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}

interface PlanMixDataPoint {
  name: string;
  count: number;
  percent: number;
  color: string;
}

export function PlanMixCard({ plans }: { plans?: PlanMixDataPoint[] }) {
  const defaultPlans = [
    { name: 'Enterprise', count: 2, percent: 40, color: 'bg-primary' },
    { name: 'Pro', count: 2, percent: 40, color: 'bg-accent' },
    { name: 'Basic', count: 1, percent: 20, color: 'bg-muted' },
  ];

  const activePlans = plans && plans.length > 0 ? plans : defaultPlans;

  return (
    <div className="rounded-3xl border border-border/60 bg-surface p-5 shadow-sm">
      <h3 className="heading-2">Plan mix</h3>
      <p className="text-xs text-text-secondary mt-1 mb-5">
        Active subscription tiers on the platform
      </p>

      <div className="space-y-4">
        {activePlans.map((plan) => (
          <div key={plan.name}>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="font-medium text-text-primary">{plan.name}</span>
              <span className="text-text-secondary tabular-nums">
                {plan.count} · {plan.percent}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-surface-variant overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', plan.color)}
                style={{ width: `${plan.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
