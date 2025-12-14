import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import Stripe from 'stripe';
import stripeConfig from '../../config/stripe.config';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @Inject(stripeConfig.KEY)
    private config: ConfigType<typeof stripeConfig>,
  ) {
    this.stripe = new Stripe(this.config.secretKey, {
      apiVersion: '2023-10-16',
    });
  }

  async createCustomer(email: string, name: string, metadata?: Record<string, string>) {
    return this.stripe.customers.create({
      email,
      name,
      metadata,
    });
  }

  async createSubscription(customerId: string, priceId: string) {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async createCheckoutSession(priceId: string, customerId?: string, metadata?: Record<string, string>) {
    const sessionData: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: this.config.successUrl,
      cancel_url: this.config.cancelUrl,
      metadata,
    };

    if (customerId) {
      sessionData.customer = customerId;
    } else {
      sessionData.customer_creation = 'always';
    }

    return this.stripe.checkout.sessions.create(sessionData);
  }

  async createPortalSession(customerId: string) {
    return this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: this.config.cancelUrl,
    });
  }

  async cancelSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.cancel(subscriptionId);
  }

  async updateSubscription(subscriptionId: string, priceId: string) {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    
    return this.stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });
  }

  async constructWebhookEvent(payload: any, signature: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.config.webhookSecret,
    );
  }

  async getSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async getCustomer(customerId: string) {
    return this.stripe.customers.retrieve(customerId);
  }

  async listSubscriptions(customerId: string) {
    return this.stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
    });
  }

  getPlans() {
    return this.config.plans;
  }

  getPlan(planName: string) {
    return this.config.plans[planName];
  }
}