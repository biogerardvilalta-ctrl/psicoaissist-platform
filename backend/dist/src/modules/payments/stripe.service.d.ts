import { ConfigType } from '@nestjs/config';
import Stripe from 'stripe';
import stripeConfig from '../../config/stripe.config';
export declare class StripeService {
    private config;
    private stripe;
    constructor(config: ConfigType<typeof stripeConfig>);
    createCustomer(email: string, name: string, metadata?: Record<string, string>): Promise<Stripe.Response<Stripe.Customer>>;
    createSubscription(customerId: string, priceId: string): Promise<Stripe.Response<Stripe.Subscription>>;
    createCheckoutSession(priceId: string, customerId?: string, metadata?: Record<string, string>): Promise<Stripe.Response<Stripe.Checkout.Session>>;
    createPortalSession(customerId: string): Promise<Stripe.Response<Stripe.BillingPortal.Session>>;
    cancelSubscription(subscriptionId: string): Promise<Stripe.Response<Stripe.Subscription>>;
    updateSubscription(subscriptionId: string, priceId: string): Promise<Stripe.Response<Stripe.Subscription>>;
    constructWebhookEvent(payload: any, signature: string): Promise<Stripe.Event>;
    getSubscription(subscriptionId: string): Promise<Stripe.Response<Stripe.Subscription>>;
    getCustomer(customerId: string): Promise<Stripe.Response<Stripe.Customer | Stripe.DeletedCustomer>>;
    listSubscriptions(customerId: string): Promise<Stripe.Response<Stripe.ApiList<Stripe.Subscription>>>;
    getPlans(): {
        basic: {
            priceId: string;
            amount: number;
            currency: string;
            interval: string;
            name: string;
            features: {
                maxClients: number;
                transcriptionHours: number;
                reportsPerMonth: number;
                supportLevel: string;
            };
        };
        pro: {
            priceId: string;
            amount: number;
            currency: string;
            interval: string;
            name: string;
            features: {
                maxClients: number;
                transcriptionHours: number;
                reportsPerMonth: number;
                supportLevel: string;
                advancedAnalytics: boolean;
                apiAccess: boolean;
            };
        };
        premium: {
            priceId: string;
            amount: number;
            currency: string;
            interval: string;
            name: string;
            features: {
                maxClients: number;
                transcriptionHours: number;
                reportsPerMonth: number;
                supportLevel: string;
                advancedAnalytics: boolean;
                apiAccess: boolean;
                customBranding: boolean;
                ssoIntegration: boolean;
                prioritySupport: boolean;
            };
        };
    };
    getPlan(planName: string): any;
}
