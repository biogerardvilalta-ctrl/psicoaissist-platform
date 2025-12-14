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
exports.UsageLimitsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const plan_features_1 = require("./plan-features");
let UsageLimitsService = class UsageLimitsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkClientLimit(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscription: true,
                _count: {
                    select: {
                        clients: {
                            where: {
                                isActive: true
                            }
                        }
                    }
                }
            },
        });
        if (!user?.subscription || user.subscription.status !== 'active') {
            throw new common_1.ForbiddenException('Active subscription required');
        }
        const planFeatures = plan_features_1.PLAN_FEATURES[user.subscription.planType];
        if (!planFeatures) {
            throw new common_1.ForbiddenException('Invalid subscription plan');
        }
        if (planFeatures.maxClients !== plan_features_1.PlanLimits.UNLIMITED) {
            if (user._count.clients >= planFeatures.maxClients) {
                throw new common_1.ForbiddenException(`Client limit reached. Your ${user.subscription.planType} plan allows up to ${planFeatures.maxClients} clients.`);
            }
        }
    }
    async checkTranscriptionLimit(userId, hoursToAdd = 1) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });
        if (!user?.subscription || user.subscription.status !== 'active') {
            throw new common_1.ForbiddenException('Active subscription required');
        }
        const planFeatures = plan_features_1.PLAN_FEATURES[user.subscription.planType];
        if (!planFeatures) {
            throw new common_1.ForbiddenException('Invalid subscription plan');
        }
        if (planFeatures.transcriptionHours !== plan_features_1.PlanLimits.UNLIMITED) {
            console.log(`Checking transcription limit for user ${userId}: ${hoursToAdd} hours requested`);
        }
    }
    async checkReportsLimit(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscription: true,
                _count: {
                    select: {
                        reports: {
                            where: {
                                createdAt: {
                                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                                }
                            }
                        }
                    }
                }
            },
        });
        if (!user?.subscription || user.subscription.status !== 'active') {
            throw new common_1.ForbiddenException('Active subscription required');
        }
        const planFeatures = plan_features_1.PLAN_FEATURES[user.subscription.planType];
        if (!planFeatures) {
            throw new common_1.ForbiddenException('Invalid subscription plan');
        }
        if (planFeatures.reportsPerMonth !== plan_features_1.PlanLimits.UNLIMITED) {
            if (user._count.reports >= planFeatures.reportsPerMonth) {
                throw new common_1.ForbiddenException(`Monthly report limit reached. Your ${user.subscription.planType} plan allows up to ${planFeatures.reportsPerMonth} reports per month.`);
            }
        }
    }
    async getUserUsage(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscription: true,
                _count: {
                    select: {
                        clients: {
                            where: { isActive: true }
                        },
                        reports: {
                            where: {
                                createdAt: {
                                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                                }
                            }
                        }
                    }
                }
            },
        });
        if (!user?.subscription) {
            return null;
        }
        const planFeatures = plan_features_1.PLAN_FEATURES[user.subscription.planType];
        if (!planFeatures) {
            return null;
        }
        return {
            planType: user.subscription.planType,
            planFeatures,
            currentUsage: {
                clients: user._count.clients,
                reportsThisMonth: user._count.reports,
                transcriptionHours: 0,
            },
            limits: {
                clients: planFeatures.maxClients,
                reportsPerMonth: planFeatures.reportsPerMonth,
                transcriptionHours: planFeatures.transcriptionHours,
            },
        };
    }
};
exports.UsageLimitsService = UsageLimitsService;
exports.UsageLimitsService = UsageLimitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsageLimitsService);
//# sourceMappingURL=usage-limits.service.js.map