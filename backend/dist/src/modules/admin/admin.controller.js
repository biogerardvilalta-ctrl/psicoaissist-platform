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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const users_service_1 = require("../users/users.service");
const payments_service_1 = require("../payments/payments.service");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let AdminController = class AdminController {
    constructor(usersService, paymentsService, prisma) {
        this.usersService = usersService;
        this.paymentsService = paymentsService;
        this.prisma = prisma;
    }
    async getDashboardStats() {
        const [totalUsers, activeSubscriptions, totalRevenue, recentSignups] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.subscription.count({ where: { status: 'active' } }),
            this.calculateTotalRevenue(),
            this.prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    }
                }
            })
        ]);
        const subscriptionStats = await this.getSubscriptionStats();
        return {
            totalUsers,
            activeSubscriptions,
            totalRevenue,
            recentSignups,
            subscriptionStats,
        };
    }
    async getUsers(page = '1', limit = '10', search, plan, status) {
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) {
            where.status = status;
        }
        if (plan) {
            where.subscription = {
                planType: plan,
                status: 'active',
            };
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limitNum,
                include: {
                    subscription: true,
                    _count: {
                        select: {
                            clients: true,
                            sessions: true,
                            reports: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            users: users.map(user => ({
                ...user,
                passwordHash: undefined,
            })),
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        };
    }
    async getUserDetails(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                subscription: true,
                clients: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                },
                sessions: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                reports: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: {
                        clients: true,
                        sessions: true,
                        reports: true,
                    }
                }
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return {
            ...user,
            passwordHash: undefined,
        };
    }
    async updateUserStatus(id, body) {
        const user = await this.usersService.update(id, {
            status: body.status
        });
        await this.logAdminAction('USER_STATUS_CHANGE', {
            targetUserId: id,
            newStatus: body.status,
            reason: body.reason,
        });
        return user;
    }
    async deleteUser(id, body) {
        await this.usersService.remove(id);
        await this.logAdminAction('USER_DELETE', {
            targetUserId: id,
            reason: body.reason,
        });
        return { message: 'User deleted successfully' };
    }
    async getSubscriptions(page = '1', limit = '10', status, plan) {
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (plan) {
            where.planType = plan;
        }
        const [subscriptions, total] = await Promise.all([
            this.prisma.subscription.findMany({
                where,
                skip,
                take: limitNum,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.subscription.count({ where }),
        ]);
        return {
            subscriptions,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        };
    }
    async cancelSubscription(id, body) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { id },
            include: { user: true },
        });
        if (!subscription) {
            throw new Error('Subscription not found');
        }
        await this.paymentsService.cancelSubscription(subscription.user.id);
        await this.logAdminAction('SUBSCRIPTION_CANCEL', {
            subscriptionId: id,
            userId: subscription.userId,
            reason: body.reason,
        });
        return { message: 'Subscription cancelled successfully' };
    }
    async calculateTotalRevenue() {
        const subscriptions = await this.prisma.subscription.findMany({
            where: { status: 'active' },
        });
        const planPrices = {
            basic: 29,
            pro: 59,
            premium: 99,
        };
        return subscriptions.reduce((total, sub) => {
            const price = planPrices[sub.planType] || 0;
            return total + price;
        }, 0);
    }
    async getSubscriptionStats() {
        const stats = await this.prisma.subscription.groupBy({
            by: ['planType', 'status'],
            _count: true,
        });
        return stats.reduce((acc, stat) => {
            if (!acc[stat.planType]) {
                acc[stat.planType] = {};
            }
            acc[stat.planType][stat.status] = stat._count;
            return acc;
        }, {});
    }
    async logAdminAction(action, metadata) {
        console.log('Admin Action:', { action, metadata, timestamp: new Date() });
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('plan')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserDetails", null);
__decorate([
    (0, common_1.Patch)('users/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('subscriptions'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('plan')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSubscriptions", null);
__decorate([
    (0, common_1.Patch)('subscriptions/:id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "cancelSubscription", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        payments_service_1.PaymentsService,
        prisma_service_1.PrismaService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map