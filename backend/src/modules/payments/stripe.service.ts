import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import Stripe from 'stripe';
import stripeConfig from '../../config/stripe.config';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private isDemoMode: boolean;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    @Inject(stripeConfig.KEY)
    private config: ConfigType<typeof stripeConfig>,
  ) {
    // Activar modo demo si no hay clave válida de Stripe
    this.isDemoMode = !this.config.secretKey ||
      this.config.secretKey === '' ||
      this.config.secretKey.trim() === '' ||
      this.config.secretKey.includes('sk_test_51234567890abcdef');

    if (!this.isDemoMode) {
      try {
        this.stripe = new Stripe(this.config.secretKey, {
          apiVersion: '2023-10-16',
        });
        const maskedKey = this.config.secretKey.substring(0, 8) + '...';
        this.logger.log(`Stripe initialized successfully with key: ${maskedKey}`);
      } catch (error) {
        this.logger.error('Failed to initialize Stripe, switching to demo mode', error);
        this.isDemoMode = true;
      }
    }

    if (this.isDemoMode) {
      this.logger.log('StripeService: Running in DEMO mode');
    }
  }

  async createCustomer(email: string, name: string, metadata?: Record<string, string>) {
    if (this.isDemoMode) {
      return {
        id: 'cus_demo_' + Date.now(),
        email,
        name,
        metadata: metadata || {},
        created: Math.floor(Date.now() / 1000),
        object: 'customer',
      };
    }
    return this.stripe.customers.create({
      email,
      name,
      metadata,
    });
  }

  async createSubscription(customerId: string, priceId: string) {
    if (this.isDemoMode) {
      return {
        id: 'sub_demo_' + Date.now(),
        customer: customerId,
        status: 'active',
        items: {
          data: [{ price: { id: priceId } }]
        },
        created: Math.floor(Date.now() / 1000),
        object: 'subscription',
      };
    }
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async createCheckoutSession(priceId: string, customerId?: string, metadata?: Record<string, string>, mode: Stripe.Checkout.SessionCreateParams.Mode = 'subscription') {
    if (this.isDemoMode) {
      return {
        id: 'cs_demo_' + Date.now(),
        url: 'https://checkout.stripe.com/demo-session-url',
        object: 'checkout.session',
        mode: mode,
        customer: customerId || null,
        metadata: metadata || {},
        success_url: this.config.successUrl,
        cancel_url: this.config.cancelUrl,
      };
    }

    const sessionData: Stripe.Checkout.SessionCreateParams = {
      mode: mode,
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
    if (this.isDemoMode) {
      return {
        id: 'bps_demo_' + Date.now(),
        url: 'https://billing.stripe.com/demo-portal-url',
        object: 'billing_portal.session',
        customer: customerId,
        return_url: this.config.cancelUrl,
      };
    }
    return this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: this.config.cancelUrl,
    });
  }

  async cancelSubscription(subscriptionId: string) {
    if (this.isDemoMode) {
      return {
        id: subscriptionId,
        status: 'canceled',
        canceled_at: Math.floor(Date.now() / 1000),
        object: 'subscription',
      };
    }
    return this.stripe.subscriptions.cancel(subscriptionId);
  }

  async updateSubscription(subscriptionId: string, priceId: string) {
    if (this.isDemoMode) {
      return {
        id: subscriptionId,
        items: {
          data: [{ id: 'si_demo', price: { id: priceId } }]
        },
        object: 'subscription',
      };
    }
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

  async addSubscriptionItem(subscriptionId: string, priceId: string) {
    if (this.isDemoMode) {
      return {
        id: 'si_demo_' + Date.now(),
        object: 'subscription_item',
        subscription: subscriptionId,
        price: { id: priceId },
      };
    }
    return this.stripe.subscriptionItems.create({
      subscription: subscriptionId,
      price: priceId,
      proration_behavior: 'create_prorations',
    });
  }

  async constructWebhookEvent(payload: any, signature: string) {
    if (this.isDemoMode) {
      return {
        id: 'evt_demo_' + Date.now(),
        type: 'customer.subscription.created',
        data: { object: payload },
        object: 'event',
      };
    }
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.config.webhookSecret,
    );
  }

  async getSubscription(subscriptionId: string) {
    if (this.isDemoMode) {
      return {
        id: subscriptionId,
        status: 'active',
        customer: 'cus_demo',
        items: {
          data: [{ price: { id: 'price_demo', nickname: 'Demo Plan' } }]
        },
        object: 'subscription',
      };
    }
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async getCustomer(customerId: string) {
    if (this.isDemoMode) {
      return {
        id: customerId,
        email: 'demo@psicoaissist.com',
        name: 'Demo User',
        object: 'customer',
      };
    }
    return this.stripe.customers.retrieve(customerId);
  }

  async listSubscriptions(customerId: string) {
    if (this.isDemoMode) {
      return {
        data: [{
          id: 'sub_demo',
          customer: customerId,
          status: 'active',
          items: {
            data: [{ price: { id: 'price_demo', nickname: 'Demo Plan' } }]
          },
          object: 'subscription',
        }],
        object: 'list',
      };
    }
    return this.stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
    });
  }

  getPlans() {
    return this.config.plans;
  }

  getPlan(planName: string, interval: 'month' | 'year' = 'month') {
    const plan = this.config.plans[planName];
    if (!plan) return null;

    if (interval === 'year') {
      return {
        ...plan,
        priceId: plan.priceIdAnnual || plan.priceId,
        amount: plan.amountAnnual || plan.amount * 12,
        interval: 'year',
      };
    }

    return plan;
  }

  // Método para verificar si está en modo demo
  isInDemoMode(): boolean {
    return this.isDemoMode;
  }
}