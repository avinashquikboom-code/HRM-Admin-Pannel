import { api, getApiErrorMessage } from '@/lib/api';
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

export async function fetchSubscriptions(): Promise<Subscription[]> {
  try {
    const { data } = await api.get<{ subscriptions: Subscription[] }>(
      '/api/admin/subscriptions'
    );
    return data.subscriptions;
  } catch (error) {
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
    throw new Error(
      getApiErrorMessage(error, 'Failed to update pricing plan. Please try again.')
    );
  }
}
