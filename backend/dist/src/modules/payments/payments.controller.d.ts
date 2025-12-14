import { RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { UsageLimitsService } from './usage-limits.service';
import { CreateCheckoutSessionDto, CreateCustomerDto, UpdateSubscriptionDto } from './dto/payments.dto';
import { Request } from 'express';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly usageLimitsService;
    constructor(paymentsService: PaymentsService, usageLimitsService: UsageLimitsService);
    getPlans(): Promise<{
        type: string;
        name: string;
        amount: number;
        currency: string;
        interval: string;
        features: {
            maxClients: number;
            transcriptionHours: number;
            reportsPerMonth: number;
            supportLevel: string;
        } | {
            maxClients: number;
            transcriptionHours: number;
            reportsPerMonth: number;
            supportLevel: string;
            advancedAnalytics: boolean;
            apiAccess: boolean;
        } | {
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
        priceId: string;
    }[]>;
    testEndpoint(): Promise<{
        message: string;
        timestamp: string;
    }>;
    createCheckoutSessionDemo(createCheckoutDto: CreateCheckoutSessionDto): Promise<{
        sessionId: string;
        url: string;
        plan: {
            name: any;
            amount: any;
            currency: any;
            interval: any;
        };
    }>;
    createCheckoutSession(createCheckoutDto: CreateCheckoutSessionDto, req: any): Promise<{
        sessionId: string;
        url: string;
        plan: {
            name: any;
            amount: any;
            currency: any;
            interval: any;
        };
    }>;
    createCustomer(createCustomerDto: CreateCustomerDto): Promise<import("stripe").Stripe.Response<import("stripe").Stripe.Customer>>;
    createPortalSession(req: any): Promise<{
        url: string;
    }>;
    updateSubscription(updateSubscriptionDto: UpdateSubscriptionDto, req: any): Promise<{
        subscription: import("stripe").Stripe.Response<import("stripe").Stripe.Subscription>;
        plan: any;
    }>;
    cancelSubscription(req: any): Promise<{
        subscription: import("stripe").Stripe.Response<import("stripe").Stripe.Subscription>;
    }>;
    getSubscriptionStatus(req: any): Promise<{
        hasSubscription: boolean;
        plan: any;
        status: any;
        currentPeriodStart?: undefined;
        currentPeriodEnd?: undefined;
        canceledAt?: undefined;
    } | {
        hasSubscription: boolean;
        plan: {
            type: string;
            name: any;
            features: any;
        };
        status: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        canceledAt: Date;
    }>;
    getUserUsage(req: any): Promise<{
        planType: string;
        planFeatures: import("./plan-features").PlanFeatures;
        currentUsage: {
            clients: number;
            reportsThisMonth: number;
            transcriptionHours: number;
        };
        limits: {
            clients: number;
            reportsPerMonth: number;
            transcriptionHours: number;
        };
    }>;
    getAdvancedAnalytics(req: any): Promise<{
        message: string;
        userId: any;
    }>;
    handleWebhook(signature: string, req: RawBodyRequest<Request>): Promise<{
        received: boolean;
    }>;
}
