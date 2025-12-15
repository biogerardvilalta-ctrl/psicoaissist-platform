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
    console.log('📡 PaymentsAPI.createCheckoutSession llamado con:', request);
    
    // Usar endpoint demo temporalmente hasta que tengamos auth real
    const endpoint = `${this.BASE_URL}/create-checkout-session-demo`;
    console.log('🌐 URL destino:', endpoint);
    
    try {
      const response = await httpClient.post(endpoint, request);
      console.log('✅ Respuesta recibida:', response);
      return response as CheckoutSession;
    } catch (error) {
      console.error('❌ Error en PaymentsAPI.createCheckoutSession:', error);
      throw error;
    }
  }

  static async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await httpClient.get(`${this.BASE_URL}/subscription-status`);
    return (response as any).data;
  }

  static async createPortalSession(): Promise<{ url: string }> {
    const response = await httpClient.post(`${this.BASE_URL}/create-portal-session`);
    return (response as any).data;
  }

  static async cancelSubscription(): Promise<void> {
    await httpClient.delete(`${this.BASE_URL}/subscription`);
  }

  static async updateSubscription(newPlan: string, subscriptionId: string): Promise<void> {
    await httpClient.patch(`${this.BASE_URL}/subscription`, {
      newPlan,
      subscriptionId,
    });
  }
}