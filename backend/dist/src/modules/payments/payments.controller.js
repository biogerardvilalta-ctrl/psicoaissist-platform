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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const usage_limits_service_1 = require("./usage-limits.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const feature_guard_1 = require("../auth/guards/feature.guard");
const payments_dto_1 = require("./dto/payments.dto");
let PaymentsController = class PaymentsController {
    constructor(paymentsService, usageLimitsService) {
        this.paymentsService = paymentsService;
        this.usageLimitsService = usageLimitsService;
    }
    async getPlans() {
        return this.paymentsService.getAvailablePlans();
    }
    async testEndpoint() {
        return { message: 'Payments controller working!', timestamp: new Date().toISOString() };
    }
    async createCheckoutSessionDemo(createCheckoutDto) {
        console.log('Demo checkout session requested:', createCheckoutDto);
        const demoUserId = 'cmj66cjcg0000ojxfyrhpepoh';
        return this.paymentsService.createCheckoutSessionDemo(createCheckoutDto, demoUserId);
    }
    async createCheckoutSession(createCheckoutDto, req) {
        return this.paymentsService.createCheckoutSession(createCheckoutDto, req.user.sub);
    }
    async createCustomer(createCustomerDto) {
        return this.paymentsService.createCustomer(createCustomerDto);
    }
    async createPortalSession(req) {
        return this.paymentsService.createPortalSession(req.user.sub);
    }
    async updateSubscription(updateSubscriptionDto, req) {
        return this.paymentsService.updateSubscription(updateSubscriptionDto, req.user.sub);
    }
    async cancelSubscription(req) {
        return this.paymentsService.cancelSubscription(req.user.sub);
    }
    async getSubscriptionStatus(req) {
        return this.paymentsService.getSubscriptionStatus(req.user.sub);
    }
    async getUserUsage(req) {
        return this.usageLimitsService.getUserUsage(req.user.sub);
    }
    async getAdvancedAnalytics(req) {
        return { message: 'Advanced analytics data', userId: req.user.sub };
    }
    async handleWebhook(signature, req) {
        return this.paymentsService.handleWebhook(signature, req.rawBody || req.body);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Get)('plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPlans", null);
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "testEndpoint", null);
__decorate([
    (0, common_1.Post)('create-checkout-session-demo'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payments_dto_1.CreateCheckoutSessionDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createCheckoutSessionDemo", null);
__decorate([
    (0, common_1.Post)('create-checkout-session'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payments_dto_1.CreateCheckoutSessionDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createCheckoutSession", null);
__decorate([
    (0, common_1.Post)('create-customer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payments_dto_1.CreateCustomerDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createCustomer", null);
__decorate([
    (0, common_1.Post)('create-portal-session'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPortalSession", null);
__decorate([
    (0, common_1.Patch)('subscription'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payments_dto_1.UpdateSubscriptionDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "updateSubscription", null);
__decorate([
    (0, common_1.Delete)('subscription'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Get)('subscription-status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getSubscriptionStatus", null);
__decorate([
    (0, common_1.Get)('usage'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getUserUsage", null);
__decorate([
    (0, common_1.Get)('advanced-analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, feature_guard_1.FeatureGuard),
    (0, feature_guard_1.RequireFeature)('advancedAnalytics'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getAdvancedAnalytics", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)('stripe-signature')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWebhook", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        usage_limits_service_1.UsageLimitsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map