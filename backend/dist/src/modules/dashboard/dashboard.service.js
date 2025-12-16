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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const clients_service_1 = require("../clients/clients.service");
let DashboardService = class DashboardService {
    constructor(prisma, clientsService) {
        this.prisma = prisma;
        this.clientsService = clientsService;
    }
    async getStats(userId) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
        const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
        const startOfPreviousMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfPreviousMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
        const [allClients, newClientsThisMonth, totalSessions, currentMonthSessions, previousMonthSessions, totalReports, currentMonthReports, previousMonthReports] = await Promise.all([
            this.clientsService.findAll(userId),
            this.prisma.client.count({ where: { userId, isActive: true, createdAt: { gte: startOfCurrentMonth } } }),
            this.prisma.session.count({ where: { userId, status: 'COMPLETED' } }),
            this.prisma.session.count({ where: { userId, status: 'COMPLETED', startTime: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } } }),
            this.prisma.session.count({ where: { userId, status: 'COMPLETED', startTime: { gte: startOfPreviousMonth, lte: endOfPreviousMonth } } }),
            this.prisma.report.count({ where: { userId, status: { not: 'DELETED' } } }),
            this.prisma.report.count({ where: { userId, status: { not: 'DELETED' }, createdAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } } }),
            this.prisma.report.count({ where: { userId, status: { not: 'DELETED' }, createdAt: { gte: startOfPreviousMonth, lte: endOfPreviousMonth } } }),
        ]);
        const activeClientsCount = allClients.length;
        const previousActiveClients = Math.max(0, activeClientsCount - newClientsThisMonth);
        return {
            activeClients: activeClientsCount,
            totalSessions,
            totalReports,
            clientTrend: this.calculateTrend(newClientsThisMonth, previousActiveClients),
            sessionTrend: this.calculateTrend(currentMonthSessions, previousMonthSessions),
            reportTrend: this.calculateTrend(currentMonthReports, previousMonthReports),
        };
    }
    calculateTrend(current, previous) {
        if (previous === 0) {
            return {
                value: current > 0 ? `+${current}` : "0",
                isPositive: current >= 0
            };
        }
        const numericTrend = ((current - previous) / previous) * 100;
        const roundedTrend = Math.round(numericTrend);
        const sign = roundedTrend > 0 ? "+" : "";
        return {
            value: `${sign}${roundedTrend}%`,
            isPositive: roundedTrend >= 0
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        clients_service_1.ClientsService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map