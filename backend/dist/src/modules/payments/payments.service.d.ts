import { PrismaService } from '../../common/prisma/prisma.service';
import { StripeService } from './stripe.service';
import { EmailService } from '../email/email.service';
import { CreateCheckoutSessionDto, CreateCustomerDto, UpdateSubscriptionDto } from './dto/payments.dto';
import Stripe from 'stripe';
export declare class PaymentsService {
    private prisma;
    private stripeService;
    private emailService;
    private readonly logger;
    constructor(prisma: PrismaService, stripeService: StripeService, emailService: EmailService);
    createCheckoutSession(createCheckoutDto: CreateCheckoutSessionDto, userId: string): Promise<{
        sessionId: string;
        url: string;
        plan: {
            name: any;
            amount: any;
            currency: any;
            interval: any;
        };
    }>;
    createCustomer(createCustomerDto: CreateCustomerDto): Promise<Stripe.Response<Stripe.Customer>>;
    createPortalSession(userId: string): Promise<{
        url: string;
    }>;
    updateSubscription(updateSubscriptionDto: UpdateSubscriptionDto, userId: string): Promise<{
        subscription: Stripe.Response<Stripe.Subscription>;
        plan: any;
    }>;
    cancelSubscription(userId: string): Promise<{
        subscription: Stripe.Response<Stripe.Subscription>;
    }>;
    handleWebhook(signature: string, payload: any): Promise<{
        received: boolean;
    }>;
    private handleCheckoutSessionCompleted;
    private handleSubscriptionCreated;
    private handleSubscriptionUpdated;
    private handleSubscriptionDeleted;
    private handleInvoicePaymentSucceeded;
    private handleInvoicePaymentFailed;
    private getPlanTypeFromSubscription;
    getSubscriptionStatus(userId: string): Promise<{
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
    getAvailablePlans(): {
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
    }[];
    private getPlanDisplayName;
}
