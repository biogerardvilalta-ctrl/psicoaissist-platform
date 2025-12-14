"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const payments_controller_1 = require("./payments.controller");
const payments_service_1 = require("./payments.service");
const stripe_service_1 = require("./stripe.service");
const usage_limits_service_1 = require("./usage-limits.service");
const prisma_module_1 = require("../../common/prisma/prisma.module");
const email_module_1 = require("../email/email.module");
const stripe_config_1 = require("../../config/stripe.config");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forFeature(stripe_config_1.default),
            prisma_module_1.PrismaModule,
            email_module_1.EmailModule,
        ],
        controllers: [payments_controller_1.PaymentsController],
        providers: [payments_service_1.PaymentsService, stripe_service_1.StripeService, usage_limits_service_1.UsageLimitsService],
        exports: [payments_service_1.PaymentsService, stripe_service_1.StripeService, usage_limits_service_1.UsageLimitsService],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map