import { api, getApiErrorMessage } from '@/lib/api';
import { isDevAuthSession } from '@/lib/devAuth';

export interface Subscription {
  id: string;
  invoiceId: string;
  company: string;
  plan: string;
  amount: string;
  status: string;
  date: string;
  activeSeats: number;
  billingCycle: string;
  isActive: boolean;
  joiningDate: string;
}

export interface PricingPlan {
  id: number;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  seatsLabel: string;
  description: string;
  features: string[];
  updatedAt?: string;
}

// ---- Demo fallback data ----

const DEMO_SUBSCRIPTIONS: Subscription[] = [
  {
    id: '1',
    invoiceId: 'INV-2026-001',
    company: 'TechVibe Inc.',
    plan: 'Enterprise',
    amount: '₹1,24,000',
    status: 'Paid',
    date: new Date().toISOString(),
    activeSeats: 45,
    billingCycle: 'yearly',
    isActive: true,
    joiningDate: '28 Apr 2026',
  },
  {
    id: '2',
    invoiceId: 'INV-2026-002',
    company: 'Global Logistics',
    plan: 'Pro',
    amount: '₹4,500',
    status: 'Pending',
    date: new Date().toISOString(),
    activeSeats: 120,
    billingCycle: 'monthly',
    isActive: true,
    joiningDate: '30 Apr 2026',
  },
  {
    id: '3',
    invoiceId: 'INV-2026-003',
    company: 'EcoWare Solutions',
    plan: 'Basic',
    amount: '₹12,000',
    status: 'Overdue',
    date: new Date().toISOString(),
    activeSeats: 20,
    billingCycle: 'yearly',
    isActive: true,
    joiningDate: '01 May 2026',
  },
  {
    id: '4',
    invoiceId: 'INV-2026-004',
    company: 'Innovate Digital',
    plan: 'Pro',
    amount: '₹4,500',
    status: 'Paid',
    date: new Date().toISOString(),
    activeSeats: 83,
    billingCycle: 'monthly',
    isActive: true,
    joiningDate: '02 May 2026',
  },
  {
    id: '5',
    invoiceId: 'INV-2026-005',
    company: 'Blue Sky Media',
    plan: 'Pro',
    amount: '₹4,500',
    status: 'Paid',
    date: new Date().toISOString(),
    activeSeats: 35,
    billingCycle: 'monthly',
    isActive: true,
    joiningDate: '03 May 2026',
  },
];

const DEMO_PRICING_PLANS: PricingPlan[] = [
  {
    id: 1,
    name: 'Basic',
    monthlyPrice: 1200,
    yearlyPrice: 12000,
    seatsLabel: 'Up to 50 active seats',
    description: 'Essential features for growing startups.',
    features: ['Standard dashboard analytics', 'Up to 5 geofences', 'Email support', '1-year logs retention'],
  },
  {
    id: 2,
    name: 'Pro',
    monthlyPrice: 4500,
    yearlyPrice: 45000,
    seatsLabel: 'Up to 250 active seats',
    description: 'Advanced controls for professional enterprises.',
    features: ['Real-time live location tracking', 'Unlimited geofencing alerts', '24/7 priority support', 'Custom report building', 'SSO & Multi-admin access'],
  },
  {
    id: 3,
    name: 'Enterprise',
    monthlyPrice: 12400,
    yearlyPrice: 124000,
    seatsLabel: 'Unlimited seats & servers',
    description: 'State-of-the-art power for global organizations.',
    features: ['Dedicated account architect', 'Custom backend API pipelines', 'Tailored hardware integrations', 'Unlimited logs & backups', 'Whiteglove data onboarding'],
  },
];

// ---- API Functions ----

export async function fetchSubscriptions(): Promise<Subscription[]> {
  try {
    const { data } = await api.get<{ subscriptions: Subscription[] }>(
      '/api/admin/subscriptions'
    );
    return data.subscriptions;
  } catch (error) {
    if (isDevAuthSession()) {
      return [...DEMO_SUBSCRIPTIONS];
    }
    throw new Error(
      getApiErrorMessage(error, 'Failed to fetch subscriptions. Please try again.')
    );
  }
}

export async function updateSubscription(
  officeId: string,
  payload: {
    plan?: string;
    billingCycle?: string;
    invoiceStatus?: string;
  }
): Promise<{ message: string; subscription: any }> {
  try {
    const { data } = await api.put<{ message: string; subscription: any }>(
      `/api/admin/subscriptions/${officeId}`,
      payload
    );
    return data;
  } catch (error) {
    if (isDevAuthSession()) {
      const idx = DEMO_SUBSCRIPTIONS.findIndex(s => s.id === officeId);
      if (idx !== -1) {
        DEMO_SUBSCRIPTIONS[idx] = {
          ...DEMO_SUBSCRIPTIONS[idx],
          plan: payload.plan !== undefined ? payload.plan : DEMO_SUBSCRIPTIONS[idx].plan,
          billingCycle: payload.billingCycle !== undefined ? payload.billingCycle : DEMO_SUBSCRIPTIONS[idx].billingCycle,
          status: payload.invoiceStatus !== undefined ? payload.invoiceStatus : DEMO_SUBSCRIPTIONS[idx].status,
        };
        return {
          message: 'Subscription updated successfully (Demo Mode)!',
          subscription: DEMO_SUBSCRIPTIONS[idx],
        };
      }
    }
    throw new Error(
      getApiErrorMessage(error, 'Failed to update subscription. Please try again.')
    );
  }
}

export async function fetchPricingPlans(): Promise<PricingPlan[]> {
  try {
    const { data } = await api.get<{ pricingPlans: PricingPlan[] }>(
      '/api/admin/pricing-plans'
    );
    return data.pricingPlans;
  } catch (error) {
    if (isDevAuthSession()) {
      return [...DEMO_PRICING_PLANS];
    }
    throw new Error(
      getApiErrorMessage(error, 'Failed to fetch pricing plans. Please try again.')
    );
  }
}

export async function updatePricingPlan(
  planId: number,
  payload: {
    monthlyPrice?: number;
    yearlyPrice?: number;
    seatsLabel?: string;
    description?: string;
    features?: string[];
  }
): Promise<{ message: string; pricingPlan: PricingPlan }> {
  try {
    const { data } = await api.put<{ message: string; pricingPlan: PricingPlan }>(
      `/api/admin/pricing-plans/${planId}`,
      payload
    );
    return data;
  } catch (error) {
    if (isDevAuthSession()) {
      const idx = DEMO_PRICING_PLANS.findIndex(p => p.id === planId);
      if (idx !== -1) {
        DEMO_PRICING_PLANS[idx] = { ...DEMO_PRICING_PLANS[idx], ...payload };
        return {
          message: `${DEMO_PRICING_PLANS[idx].name} pricing updated (Demo Mode)!`,
          pricingPlan: { ...DEMO_PRICING_PLANS[idx] },
        };
      }
    }
    throw new Error(
      getApiErrorMessage(error, 'Failed to update pricing plan. Please try again.')
    );
  }
}
