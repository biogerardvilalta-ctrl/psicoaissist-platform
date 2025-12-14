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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = require("stripe");
const stripe_config_1 = require("../../config/stripe.config");
let StripeService = class StripeService {
    constructor(config) {
        this.config = config;
        this.stripe = new stripe_1.default(this.config.secretKey, {
            apiVersion: '2023-10-16',
        });
    }
    async createCustomer(email, name, metadata) {
        return this.stripe.customers.create({
            email,
            name,
            metadata,
        });
    }
    async createSubscription(customerId, priceId) {
        return this.stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
        });
    }
    async createCheckoutSession(priceId, customerId, metadata) {
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
        return this.stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: this.config.cancelUrl,
        });
    }
    async cancelSubscription(subscriptionId) {
        return this.stripe.subscriptions.cancel(subscriptionId);
    }
    async updateSubscription(subscriptionId, priceId) {
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
        return this.stripe.webhooks.constructEvent(payload, signature, this.config.webhookSecret);
    }
    async getSubscription(subscriptionId) {
        return this.stripe.subscriptions.retrieve(subscriptionId);
    }
    async getCustomer(customerId) {
        return this.stripe.customers.retrieve(customerId);
    }
    async listSubscriptions(customerId) {
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
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(stripe_config_1.default.KEY)),
    __metadata("design:paramtypes", [void 0])
], StripeService);
//# sourceMappingURL=stripe.service.js.map