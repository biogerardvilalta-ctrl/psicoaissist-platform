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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = require("stripe");
const stripe_config_1 = require("../../config/stripe.config");
let StripeService = StripeService_1 = class StripeService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(StripeService_1.name);
        this.isDemoMode = !this.config.secretKey ||
            this.config.secretKey === '' ||
            this.config.secretKey.trim() === '' ||
            this.config.secretKey.includes('sk_test_51234567890abcdef');
        if (!this.isDemoMode) {
            try {
                this.stripe = new stripe_1.default(this.config.secretKey, {
                    apiVersion: '2023-10-16',
                });
                this.logger.log('Stripe initialized successfully');
            }
            catch (error) {
                this.logger.error('Failed to initialize Stripe, switching to demo mode', error);
                this.isDemoMode = true;
            }
        }
        if (this.isDemoMode) {
            this.logger.log('StripeService: Running in DEMO mode');
        }
    }
    async createCustomer(email, name, metadata) {
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
    async createSubscription(customerId, priceId) {
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
    async createCheckoutSession(priceId, customerId, metadata) {
        if (this.isDemoMode) {
            return {
                id: 'cs_demo_' + Date.now(),
                url: 'https://checkout.stripe.com/demo-session-url',
                object: 'checkout.session',
                mode: 'subscription',
                customer: customerId || null,
                metadata: metadata || {},
                success_url: this.config.successUrl,
                cancel_url: this.config.cancelUrl,
            };
        }
        const sessionData = {
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
        }
        else {
            sessionData.customer_creation = 'always';
        }
        return this.stripe.checkout.sessions.create(sessionData);
    }
    async createPortalSession(customerId) {
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
    async cancelSubscription(subscriptionId) {
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
    async updateSubscription(subscriptionId, priceId) {
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
    async constructWebhookEvent(payload, signature) {
        if (this.isDemoMode) {
            return {
                id: 'evt_demo_' + Date.now(),
                type: 'customer.subscription.created',
                data: { object: payload },
                object: 'event',
            };
        }
        return this.stripe.webhooks.constructEvent(payload, signature, this.config.webhookSecret);
    }
    async getSubscription(subscriptionId) {
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
    async getCustomer(customerId) {
        if (this.isDemoMode) {
            return {
                id: customerId,
                email: 'demo@psychoai.com',
                name: 'Demo User',
                object: 'customer',
            };
        }
        return this.stripe.customers.retrieve(customerId);
    }
    async listSubscriptions(customerId) {
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
    getPlan(planName) {
        return this.config.plans[planName];
    }
    isInDemoMode() {
        return this.isDemoMode;
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(stripe_config_1.default.KEY)),
    __metadata("design:paramtypes", [void 0])
], StripeService);
//# sourceMappingURL=stripe.service.js.map