import apiClient from '../api-client';

export interface SubscriberStats {
  totalUsers: number;
  activeSubscribers: number;
  canceledSubscribers: number;
  pastDueSubscribers: number;
}

export interface StripeData {
  subscriptionId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: string;
  interval: string;
}

export interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  subscriptionStatus: string | null;
  createdAt: string;
  updatedAt: string;
  canceledAt: string | null;
  stripe: StripeData | null;
}

export interface SubscribersResponse {
  stats: SubscriberStats;
  users: Subscriber[];
}

export const adminApi = {
  /**
   * Get all subscribers (admin only)
   */
  async getSubscribers(): Promise<SubscribersResponse> {
    const response = await apiClient.get<SubscribersResponse>('/admin/subscribers');
    return response.data;
  },
};
