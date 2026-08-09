import { api } from '@/lib/api';

export interface FeatureAccess {
  id: string;
  featureName: string;
  isEnabled: boolean;
  validFromDate: string | null;
  validToDate: string | null;
  validFromTime: string | null;
  validToTime: string | null;
  reason: string | null;
}

export interface FeatureAccessRequest {
  id: string;
  employeeId: string;
  featureName: string;
  reason: string;
  requestedFromDate: string;
  requestedToDate: string;
  status: string;
  appliedOn: string;
  employee?: {
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
  };
}

export const featureAccessService = {
  getAllFeaturesForEmployee: async (employeeId: number | string): Promise<FeatureAccess[]> => {
    const res = await api.get(`/hr/features/access/${employeeId}`);
    return res.data?.features || [];
  },

  updateFeatureAccess: async (
    employeeId: number | string,
    featureName: string,
    data: {
      isEnabled: boolean;
      reason?: string;
      validFromDate?: string | null;
      validToDate?: string | null;
      validFromTime?: string | null;
      validToTime?: string | null;
    }
  ) => {
    const res = await api.patch(`/hr/features/access/${employeeId}/${featureName}`, data);
    return res.data;
  },

  getPendingRequests: async (): Promise<FeatureAccessRequest[]> => {
    const res = await api.get('/hr/features/access-requests');
    return res.data?.requests || [];
  },

  processRequest: async (
    requestId: string,
    status: 'APPROVED' | 'REJECTED',
    data?: {
      reviewNote?: string;
      validFromDate?: string | null;
      validToDate?: string | null;
      validFromTime?: string | null;
      validToTime?: string | null;
    }
  ) => {
    const res = await api.patch(`/hr/features/access-requests/${requestId}`, {
      status,
      ...data,
    });
    return res.data;
  }
};
