import apiClient from '../api-client';
import type {
  CheckoutRequest,
  CheckoutResponse,
  ValidateCouponRequest,
  ValidateCouponResponse
} from '@/types/api';

export const stripeApi = {
  /**
   * Validate a coupon code and get pricing information
   */
  async validateCoupon(couponCode: string): Promise<ValidateCouponResponse> {
    const response = await apiClient.post<ValidateCouponResponse>(
      '/stripe/validate-coupon',
      { couponCode } satisfies ValidateCouponRequest
    );
    return response.data;
  },

  /**
   * Create Stripe checkout session
   */
  async createCheckoutSession(
    successUrl?: string,
    cancelUrl?: string,
    couponCode?: string
  ): Promise<string> {
    const response = await apiClient.post<CheckoutResponse>('/stripe/checkout', {
      successUrl,
      cancelUrl,
      couponCode,
    } satisfies CheckoutRequest);

    return response.data.url;
  },

  /**
   * Redirect to Stripe checkout
   */
  async redirectToCheckout(successUrl?: string, cancelUrl?: string, couponCode?: string): Promise<void> {
    const url = await this.createCheckoutSession(successUrl, cancelUrl, couponCode);
    window.location.href = url;
  },

  /**
   * Get customer portal URL (for managing subscription)
   */
  getCustomerPortalUrl(): string {
    const API_URL = import.meta.env.VITE_API_URL || 'https://tradvio-backend.ivanleejackson.workers.dev';
    return `${API_URL}/api/stripe/portal`;
  },
};
