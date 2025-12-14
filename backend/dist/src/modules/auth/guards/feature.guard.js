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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureGuard = exports.RequireFeature = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const plan_features_1 = require("../../payments/plan-features");
const RequireFeature = (feature) => {
    return (target, key, descriptor) => {
        if (descriptor) {
            Reflect.defineMetadata('required-feature', feature, descriptor.value);
        }
        else {
            Reflect.defineMetadata('required-feature', feature, target);
        }
    };
};
exports.RequireFeature = RequireFeature;
let FeatureGuard = class FeatureGuard {
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const requiredFeature = this.reflector.get('required-feature', context.getHandler());
        if (!requiredFeature) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.sub;
        if (!userId) {
            throw new common_1.ForbiddenException('Authentication required');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });
        if (!user) {
            throw new common_1.ForbiddenException('User not found');
        }
        if (!user.subscription || user.subscription.status !== 'active') {
            throw new common_1.ForbiddenException('Active subscription required');
        }
        const planFeatures = plan_features_1.PLAN_FEATURES[user.subscription.planType];
        if (!planFeatures) {
            throw new common_1.ForbiddenException('Invalid subscription plan');
        }
        switch (requiredFeature) {
            case 'advancedAnalytics':
                if (!planFeatures.advancedAnalytics) {
                    throw new common_1.ForbiddenException('Advanced analytics requires Pro or Premium plan');
                }
                break;
            case 'apiAccess':
                if (!planFeatures.apiAccess) {
                    throw new common_1.ForbiddenException('API access requires Pro or Premium plan');
                }
                break;
            case 'customBranding':
                if (!planFeatures.customBranding) {
                    throw new common_1.ForbiddenException('Custom branding requires Premium plan');
                }
                break;
            case 'ssoIntegration':
                if (!planFeatures.ssoIntegration) {
                    throw new common_1.ForbiddenException('SSO integration requires Premium plan');
                }
                break;
            case 'prioritySupport':
                if (!planFeatures.prioritySupport) {
                    throw new common_1.ForbiddenException('Priority support requires Premium plan');
                }
                break;
            default:
                return true;
        }
        return true;
    }
};
exports.FeatureGuard = FeatureGuard;
exports.FeatureGuard = FeatureGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], FeatureGuard);
//# sourceMappingURL=feature.guard.js.map