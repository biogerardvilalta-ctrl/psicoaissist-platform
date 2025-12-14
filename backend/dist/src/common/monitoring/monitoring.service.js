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
var MonitoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MonitoringService = MonitoringService_1 = class MonitoringService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MonitoringService_1.name);
        this.requestsCount = 0;
        this.totalResponseTime = 0;
        this.errorCount = 0;
    }
    async logRequest(request) {
        try {
            this.requestsCount++;
            if (request.duration) {
                this.totalResponseTime += request.duration;
            }
            if (request.statusCode && request.statusCode >= 400) {
                this.errorCount++;
            }
            await this.prisma.auditLog.create({
                data: {
                    action: 'READ',
                    resourceType: 'HTTP_REQUEST',
                    resourceId: request.url || null,
                    userId: request.userId || null,
                    ipAddress: request.ip || '127.0.0.1',
                    userAgent: request.userAgent,
                    method: request.method,
                    url: request.url,
                    metadata: {
                        statusCode: request.statusCode,
                        duration: request.duration,
                        error: request.error,
                    },
                    isSuccess: !request.error && (request.statusCode || 0) < 400,
                    errorMessage: request.error,
                    createdAt: request.timestamp || new Date(),
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to log request', error);
        }
    }
    async getSystemMetrics() {
        try {
            const [activeUsers] = await Promise.all([
                this.getActiveUsersCount(),
            ]);
            const avgResponseTime = this.requestsCount > 0
                ? this.totalResponseTime / this.requestsCount
                : 0;
            const errorRate = this.requestsCount > 0
                ? (this.errorCount / this.requestsCount) * 100
                : 0;
            return {
                activeUsers,
                totalRequests: this.requestsCount,
                errorRate: Math.round(errorRate * 100) / 100,
                avgResponseTime: Math.round(avgResponseTime * 100) / 100,
                databaseConnections: await this.getDatabaseConnectionCount(),
                memoryUsage: process.memoryUsage(),
                uptime: process.uptime(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get system metrics', error);
            throw error;
        }
    }
    async getHealthStatus() {
        const checks = {};
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            checks.database = true;
        }
        catch {
            checks.database = false;
        }
        const memUsage = process.memoryUsage();
        checks.memory = memUsage.heapUsed < (2 * 1024 * 1024 * 1024 * 0.8);
        const errorRate = this.requestsCount > 0
            ? (this.errorCount / this.requestsCount) * 100
            : 0;
        checks.errorRate = errorRate < 5;
        const healthyChecks = Object.values(checks).filter(Boolean).length;
        const totalChecks = Object.keys(checks).length;
        let status = 'healthy';
        if (healthyChecks === 0) {
            status = 'unhealthy';
        }
        else if (healthyChecks < totalChecks) {
            status = 'degraded';
        }
        return {
            status,
            checks,
            timestamp: new Date(),
        };
    }
    resetMetrics() {
        this.requestsCount = 0;
        this.totalResponseTime = 0;
        this.errorCount = 0;
        this.logger.log('Metrics reset successfully');
    }
    async getActiveUsersCount() {
        try {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const count = await this.prisma.user.count({
                where: {
                    lastLogin: {
                        gte: oneHourAgo,
                    },
                    status: 'ACTIVE',
                },
            });
            return count;
        }
        catch (error) {
            this.logger.error('Failed to get active users count', error);
            return 0;
        }
    }
    async getDatabaseConnectionCount() {
        try {
            const result = await this.prisma.$queryRaw `
        SELECT count(*) as count FROM pg_stat_activity 
        WHERE datname = current_database()
      `;
            return Number(result[0]?.count || 0);
        }
        catch (error) {
            this.logger.error('Failed to get database connection count', error);
            return 0;
        }
    }
};
exports.MonitoringService = MonitoringService;
exports.MonitoringService = MonitoringService = MonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MonitoringService);
//# sourceMappingURL=monitoring.service.js.map