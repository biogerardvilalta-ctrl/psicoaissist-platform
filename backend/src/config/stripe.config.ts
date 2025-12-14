import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_...',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_...',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...',
  successUrl: process.env.FRONTEND_URL + '/payment/success' || 'http://localhost:3000/payment/success',
  cancelUrl: process.env.FRONTEND_URL + '/payment/cancel' || 'http://localhost:3000/payment/cancel',
  plans: {
    basic: {
      priceId: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic',
      amount: 2900, // €29.00
      currency: 'eur',
      interval: 'month',
      name: 'Plan Básico',
      features: {
        maxClients: 25,
        transcriptionHours: 50,
        reportsPerMonth: 100,
        supportLevel: 'email'
      }
    },
    pro: {
      priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
      amount: 5900, // €59.00
      currency: 'eur',
      interval: 'month',
      name: 'Plan Pro',
      features: {
        maxClients: -1, // unlimited
        transcriptionHours: 200,
        reportsPerMonth: -1, // unlimited
        supportLevel: 'priority',
        advancedAnalytics: true,
        apiAccess: true
      }
    },
    premium: {
      priceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium',
      amount: 9900, // €99.00
      currency: 'eur',
      interval: 'month',
      name: 'Plan Premium',
      features: {
        maxClients: -1, // unlimited
        transcriptionHours: -1, // unlimited
        reportsPerMonth: -1, // unlimited
        supportLevel: 'phone',
        advancedAnalytics: true,
        apiAccess: true,
        customBranding: true,
        ssoIntegration: true,
        prioritySupport: true
      }
    }
  }
}));