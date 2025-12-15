"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const stripe_service_1 = require("./stripe.service");
const email_service_1 = require("../email/email.service");
const payments_dto_1 = require("./dto/payments.dto");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(prisma, stripeService, emailService) {
        this.prisma = prisma;
        this.stripeService = stripeService;
        this.emailService = emailService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    async createCheckoutSession(createCheckoutDto, userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { subscription: true },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            if (user.subscription?.status === 'active') {
                throw new common_1.BadRequestException('User already has an active subscription');
            }
            const plan = this.stripeService.getPlan(createCheckoutDto.plan);
            if (!plan) {
                throw new common_1.BadRequestException('Invalid plan selected');
            }
            let stripeCustomerId = user.stripeCustomerId;
            if (!stripeCustomerId) {
                const customer = await this.stripeService.createCustomer(user.email, `${user.firstName} ${user.lastName}`, { userId: user.id });
                stripeCustomerId = customer.id;
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { stripeCustomerId },
                });
            }
            const session = await this.stripeService.createCheckoutSession(plan.priceId, stripeCustomerId, {
                userId: user.id,
                planType: createCheckoutDto.plan,
                ...createCheckoutDto.metadata,
            });
            return {
                sessionId: session.id,
                url: session.url,
                plan: {
                    name: plan.name,
                    amount: plan.amount,
                    currency: plan.currency,
                    interval: plan.interval,
                },
            };
        }
        catch (error) {
            this.logger.error('Error creating checkout session:', error);
            throw error;
        }
    }
    async createCustomer(createCustomerDto) {
        try {
            return await this.stripeService.createCustomer(createCustomerDto.email, createCustomerDto.name, createCustomerDto.metadata);
        }
        catch (error) {
            this.logger.error('Error creating customer:', error);
            throw error;
        }
    }
    async createPortalSession(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user?.stripeCustomerId) {
                throw new common_1.BadRequestException('User has no Stripe customer ID');
            }
            const session = await this.stripeService.createPortalSession(user.stripeCustomerId);
            return {
                url: session.url,
            };
        }
        catch (error) {
            this.logger.error('Error creating portal session:', error);
            throw error;
        }
    }
    async updateSubscription(updateSubscriptionDto, userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { subscription: true },
            });
            if (!user?.subscription) {
                throw new common_1.NotFoundException('No subscription found for user');
            }
            const newPlan = this.stripeService.getPlan(updateSubscriptionDto.newPlan);
            if (!newPlan) {
                throw new common_1.BadRequestException('Invalid plan selected');
            }
            const updatedSubscription = await this.stripeService.updateSubscription(user.subscription.stripeSubscriptionId, newPlan.priceId);
            await this.prisma.subscription.update({
                where: { id: user.subscription.id },
                data: {
                    planType: updateSubscriptionDto.newPlan,
                    updatedAt: new Date(),
                },
            });
            return {
                subscription: updatedSubscription,
                plan: newPlan,
            };
        }
        catch (error) {
            this.logger.error('Error updating subscription:', error);
            throw error;
        }
    }
    async cancelSubscription(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { subscription: true },
            });
            if (!user?.subscription) {
                throw new common_1.NotFoundException('No subscription found for user');
            }
            const canceledSubscription = await this.stripeService.cancelSubscription(user.subscription.stripeSubscriptionId);
            await this.prisma.subscription.update({
                where: { id: user.subscription.id },
                data: {
                    status: 'canceled',
                    canceledAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            return {
                subscription: canceledSubscription,
            };
        }
        catch (error) {
            this.logger.error('Error canceling subscription:', error);
            throw error;
        }
    }
    async handleWebhook(signature, payload) {
        try {
            const event = await this.stripeService.constructWebhookEvent(payload, signature);
            switch (event.type) {
                case 'checkout.session.completed':
                    await this.handleCheckoutSessionCompleted(event.data.object);
                    break;
                case 'customer.subscription.created':
                    await this.handleSubscriptionCreated(event.data.object);
                    break;
                case 'customer.subscription.updated':
                    await this.handleSubscriptionUpdated(event.data.object);
                    break;
                case 'customer.subscription.deleted':
                    await this.handleSubscriptionDeleted(event.data.object);
                    break;
                case 'invoice.payment_succeeded':
                    await this.handleInvoicePaymentSucceeded(event.data.object);
                    break;
                case 'invoice.payment_failed':
                    await this.handleInvoicePaymentFailed(event.data.object);
                    break;
                default:
                    this.logger.warn(`Unhandled event type: ${event.type}`);
            }
            return { received: true };
        }
        catch (error) {
            this.logger.error('Webhook processing error:', error);
            throw error;
        }
    }
    async handleCheckoutSessionCompleted(session) {
        const userId = session.metadata?.userId;
        const planType = session.metadata?.planType;
        if (!userId || !planType) {
            this.logger.error('Missing metadata in checkout session');
            return;
        }
        this.logger.log(`Checkout session completed for user ${userId} with plan ${planType}`);
    }
    async handleSubscriptionCreated(subscription) {
        const customer = subscription.customer;
        const user = await this.prisma.user.findFirst({
            where: { stripeCustomerId: customer },
        });
        if (!user) {
            this.logger.error(`User not found for customer ${customer}`);
            return;
        }
        const planType = this.getPlanTypeFromSubscription(subscription);
        await this.prisma.subscription.upsert({
            where: { userId: user.id },
            update: {
                stripeSubscriptionId: subscription.id,
                status: subscription.status,
                planType,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                updatedAt: new Date(),
            },
            create: {
                userId: user.id,
                stripeSubscriptionId: subscription.id,
                status: subscription.status,
                planType,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
        });
        this.logger.log(`Subscription created for user ${user.id}`);
        try {
            await this.emailService.sendSubscriptionConfirmation(user.email, this.getPlanDisplayName(planType));
        }
        catch (emailError) {
            this.logger.warn(`Failed to send subscription confirmation email to ${user.email}: ${emailError.message}`);
        }
    }
    async handleSubscriptionUpdated(subscription) {
        const customer = subscription.customer;
        const user = await this.prisma.user.findFirst({
            where: { stripeCustomerId: customer },
        });
        if (!user) {
            this.logger.error(`User not found for customer ${customer}`);
            return;
        }
        const planType = this.getPlanTypeFromSubscription(subscription);
        await this.prisma.subscription.update({
            where: { userId: user.id },
            data: {
                status: subscription.status,
                planType,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                updatedAt: new Date(),
            },
        });
        this.logger.log(`Subscription updated for user ${user.id}`);
    }
    async handleSubscriptionDeleted(subscription) {
        const customer = subscription.customer;
        const user = await this.prisma.user.findFirst({
            where: { stripeCustomerId: customer },
        });
        if (!user) {
            this.logger.error(`User not found for customer ${customer}`);
            return;
        }
        await this.prisma.subscription.update({
            where: { userId: user.id },
            data: {
                status: 'canceled',
                canceledAt: new Date(),
                updatedAt: new Date(),
            },
        });
        this.logger.log(`Subscription deleted for user ${user.id}`);
        try {
            await this.emailService.sendSubscriptionCancellation(user.email);
        }
        catch (emailError) {
            this.logger.warn(`Failed to send cancellation email to ${user.email}: ${emailError.message}`);
        }
    }
    async handleInvoicePaymentSucceeded(invoice) {
        this.logger.log(`Payment succeeded for invoice ${invoice.id}`);
    }
    async handleInvoicePaymentFailed(invoice) {
        this.logger.log(`Payment failed for invoice ${invoice.id}`);
    }
    getPlanTypeFromSubscription(subscription) {
        const plans = this.stripeService.getPlans();
        const priceId = subscription.items.data[0]?.price.id;
        for (const [planName, planConfig] of Object.entries(plans)) {
            if (planConfig.priceId === priceId) {
                return planName;
            }
        }
        return payments_dto_1.PlanType.BASIC;
    }
    async getSubscriptionStatus(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { subscription: true },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            if (!user.subscription) {
                return {
                    hasSubscription: false,
                    plan: null,
                    status: null,
                };
            }
            const plan = this.stripeService.getPlan(user.subscription.planType);
            return {
                hasSubscription: true,
                plan: {
                    type: user.subscription.planType,
                    name: plan?.name,
                    features: plan?.features,
                },
                status: user.subscription.status,
                currentPeriodStart: user.subscription.currentPeriodStart,
                currentPeriodEnd: user.subscription.currentPeriodEnd,
                canceledAt: user.subscription.canceledAt,
            };
        }
        catch (error) {
            this.logger.error('Error getting subscription status:', error);
            throw error;
        }
    }
    getAvailablePlans() {
        const plans = this.stripeService.getPlans();
        return Object.entries(plans).map(([key, plan]) => ({
            type: key,
            name: plan.name,
            amount: plan.amount,
            currency: plan.currency,
            interval: plan.interval,
            features: plan.features,
            priceId: plan.priceId,
        }));
    }
    async createCheckoutSessionDemo(createCheckoutDto, userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { subscription: true },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const demoPlans = {
                basic: { name: 'Plan Básico', amount: 2900, currency: 'eur', interval: 'month' },
                pro: { name: 'Plan Pro', amount: 5900, currency: 'eur', interval: 'month' },
                premium: { name: 'Plan Premium', amount: 9900, currency: 'eur', interval: 'month' }
            };
            const plan = demoPlans[createCheckoutDto.plan];
            if (!plan) {
                throw new common_1.BadRequestException('Invalid plan selected');
            }
            const mockSessionId = `cs_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const mockUrl = `http://localhost:3000/payment/success?session_id=${mockSessionId}&plan=${createCheckoutDto.plan}`;
            this.logger.log(`Demo checkout session created for user ${user.email} - plan ${createCheckoutDto.plan}`);
            return {
                sessionId: mockSessionId,
                url: mockUrl,
                plan: {
                    name: plan.name,
                    amount: plan.amount,
                    currency: plan.currency,
                    interval: plan.interval,
                },
            };
        }
        catch (error) {
            this.logger.error('Error creating demo checkout session:', error);
            throw error;
        }
    }
    getPlanDisplayName(planType) {
        const plans = this.stripeService.getPlans();
        return plans[planType]?.name || planType;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stripe_service_1.StripeService,
        email_service_1.EmailService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map