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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const monitoring_service_1 = require("../monitoring/monitoring.service");
let HealthController = class HealthController {
    constructor(monitoringService) {
        this.monitoringService = monitoringService;
    }
    async healthCheck() {
        const health = await this.monitoringService.getHealthStatus();
        return {
            status: health.status,
            timestamp: health.timestamp,
            checks: health.checks,
        };
    }
    async getMetrics() {
        const metrics = await this.monitoringService.getSystemMetrics();
        return {
            metrics,
            timestamp: new Date(),
        };
    }
    async getStatus() {
        const [health, metrics] = await Promise.all([
            this.monitoringService.getHealthStatus(),
            this.monitoringService.getSystemMetrics(),
        ]);
        return {
            health: health.status,
            uptime: metrics.uptime,
            memory: {
                used: Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024),
                total: Math.round(metrics.memoryUsage.heapTotal / 1024 / 1024),
                percentage: Math.round((metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100),
            },
            performance: {
                totalRequests: metrics.totalRequests,
                avgResponseTime: metrics.avgResponseTime,
                errorRate: metrics.errorRate,
            },
            users: {
                active: metrics.activeUsers,
            },
            database: {
                connections: metrics.databaseConnections,
            },
            timestamp: new Date(),
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Health check endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System health status' }),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "healthCheck", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'System metrics for monitoring' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System performance metrics' }),
    (0, common_1.Get)('metrics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getMetrics", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Detailed system status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comprehensive system status' }),
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getStatus", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [monitoring_service_1.MonitoringService])
], HealthController);
//# sourceMappingURL=health.controller.js.map