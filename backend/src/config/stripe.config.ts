import { registerAs } from '@nestjs/config';

import { PLAN_FEATURES } from '../modules/payments/plan-features';

export default registerAs('stripe', () => ({
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_...',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_...',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...',
  successUrl: (process.env.FRONTEND_URL || 'http://localhost:3000') + '/payment/success',
  cancelUrl: (process.env.FRONTEND_URL || 'http://localhost:3000') + '/payment/cancel',
  plans: {
    basic: {
      priceId: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic',
      priceIdAnnual: process.env.STRIPE_BASIC_ANNUAL_PRICE_ID || 'price_basic_annual',
      amount: 2900, // €29.00
      amountAnnual: 29000, // €290.00
      currency: 'eur',
      interval: 'month',
      name: 'Plan Básico',
      features: PLAN_FEATURES.basic
    },
    pro: {
      priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
      priceIdAnnual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || 'price_pro_annual',
      amount: 5900, // €59.00
      amountAnnual: 59000, // €590.00
      currency: 'eur',
      interval: 'month',
      name: 'Plan Pro',
      features: PLAN_FEATURES.pro
    },
    business: {
      priceId: process.env.STRIPE_BUSINESS_PRICE_ID || 'price_business',
      priceIdAnnual: process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID || 'price_business_annual',
      amount: 12900, // €129.00
      amountAnnual: 129000, // €1290.00
      currency: 'eur',
      interval: 'month',
      name: 'Plan Business',
      features: PLAN_FEATURES.business
    },
    premium: {
      priceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium',
      priceIdAnnual: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID || 'price_premium_annual',
      amount: 9900, // €99.00
      amountAnnual: 99000, // €990.00
      currency: 'eur',
      interval: 'month',
      name: 'Plan Premium',
      features: PLAN_FEATURES.premium
    },
    premium_plus: {
      priceId: process.env.STRIPE_PREMIUM_PLUS_PRICE_ID || 'price_premium_plus',
      priceIdAnnual: process.env.STRIPE_PREMIUM_PLUS_ANNUAL_PRICE_ID || 'price_premium_plus_annual',
      amount: 9900, // €99.00
      amountAnnual: 99000, // €990.00
      currency: 'eur',
      interval: 'month',
      name: 'Plan Premium Plus',
      features: PLAN_FEATURES.premium_plus
    },
    minutes_pack: {
      priceId: process.env.STRIPE_PRICE_MINUTES_PACK || 'price_minutes_pack',
      amount: 1500,
      currency: 'eur',
      interval: null, // One-time
      name: 'Pack 500 Minutos',
      features: null
    },
    simulator_pack: {
      priceId: process.env.STRIPE_PRICE_SIMULATOR_PACK || 'price_simulator_pack',
      amount: 1500,
      currency: 'eur',
      interval: null, // One-time
      name: 'Pack 10 Casos Clínicos',
      features: null
    },
    agenda_manager_pack: {
      priceId: process.env.STRIPE_PRICE_AGENDA_MANAGER_PACK || 'price_agenda_manager_pack',
      amount: 1500,
      currency: 'eur',
      interval: 'month', // Recurring Add-on
      name: 'Pack Agenda Manager',
      features: null
    }
  }
}));