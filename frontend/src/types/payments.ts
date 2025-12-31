export interface Plan {
  type: string;
  name: string;
  amount: number;
  currency: string;
  interval: string;
  features: PlanFeatures;
  priceId: string;
}

export interface PlanFeatures {
  maxClients: number;
  transcriptionHours: number;
  reportsPerMonth: number;
  supportLevel: string;
  advancedAnalytics?: boolean;
  apiAccess?: boolean;
  customBranding?: boolean;
  ssoIntegration?: boolean;
  prioritySupport?: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  status: string;
  planType: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
  plan: {
    name: string;
    amount: number;
    currency: string;
    interval: string;
  };
}

export interface CreateCheckoutSessionRequest {
  plan: 'basic' | 'pro' | 'team' | 'premium';
  interval?: 'month' | 'year';
  customerId?: string;
  metadata?: Record<string, string>;
  addOns?: string[];
}

export interface SubscriptionStatus {
  hasSubscription: boolean;
  plan: {
    type: string;
    name: string;
    features: PlanFeatures;
  } | null;
  status: string | null;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  canceledAt?: Date;
}