import { httpClient } from './http-client';
import type {
  Plan,
  CheckoutSession,
  CreateCheckoutSessionRequest,
  SubscriptionStatus
} from '@/types/payments';

export class PaymentsAPI {
  private static readonly BASE_URL = '/api/v1/payments';

  static async getPlans(): Promise<Plan[]> {
    const response = await httpClient.get(`${this.BASE_URL}/plans`);
    return response as Plan[];
  }

  static async createCheckoutSession(
    request: CreateCheckoutSessionRequest
  ): Promise<CheckoutSession> {
    const endpoint = `${this.BASE_URL}/create-checkout-session`;

    try {
      const response = await httpClient.post(endpoint, request);
      return response as CheckoutSession;
    } catch (error) {
      console.error('Error in PaymentsAPI.createCheckoutSession:', error);
      throw error;
    }
  }

  static async createInitialCheckoutSession(
    userId: string,
    plan: string,
    interval: string
  ): Promise<{ sessionId: string; url: string }> {
    const endpoint = `${this.BASE_URL}/checkout/initial`; // matches backend controller
    try {
      const response = await httpClient.post(endpoint, { userId, plan, interval });
      return response as { sessionId: string; url: string };
    } catch (error) {
      console.error('Error in PaymentsAPI.createInitialCheckoutSession:', error);
      throw error;
    }
  }

  static async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await httpClient.get(`${this.BASE_URL}/subscription-status`);
    return (response as any).data;
  }

  static async createPortalSession(): Promise<{ url: string }> {
    const response = await httpClient.post(`${this.BASE_URL}/create-portal-session`);
    return response as { url: string };
  }

  static async cancelSubscription(): Promise<void> {
    await httpClient.delete(`${this.BASE_URL}/subscription`);
  }

  static async updateSubscription(newPlan: string, subscriptionId: string, interval?: 'month' | 'year'): Promise<void> {
    await httpClient.patch(`${this.BASE_URL}/subscription`, {
      newPlan,
      subscriptionId,
      interval,
    });
  }
}