import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ClientsService } from '../clients/clients.service';

@Injectable()
export class DashboardService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly clientsService: ClientsService
    ) { }

    async getStats(userId: string) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Calculate start/end of current month
        const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
        const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

        // Calculate start/end of previous month
        const startOfPreviousMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfPreviousMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

        // Fetch counts
        const [
            // activeClients handled separately via ClientsService to ensure consistency with filters (e.g. valid encryption)
            allClients,
            newClientsThisMonth,

            totalSessions,
            currentMonthSessions,
            previousMonthSessions,

            totalReports,
            currentMonthReports,
            previousMonthReports
        ] = await Promise.all([
            // Clients (Total Active via Service)
            this.clientsService.findAll(userId),
            // New Clients this month (Raw DB count is acceptable for trend estimation)
            this.prisma.client.count({ where: { userId, isActive: true, createdAt: { gte: startOfCurrentMonth } } }),

            // Sessions (Only COMPLETED)
            this.prisma.session.count({ where: { userId, status: 'COMPLETED' } }),
            this.prisma.session.count({ where: { userId, status: 'COMPLETED', startTime: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } } }),
            this.prisma.session.count({ where: { userId, status: 'COMPLETED', startTime: { gte: startOfPreviousMonth, lte: endOfPreviousMonth } } }),

            // Reports (Exclude DELETED)
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
            clientTrend: this.calculateTrend(newClientsThisMonth, previousActiveClients), // Trend represents new growth vs base
            sessionTrend: this.calculateTrend(currentMonthSessions, previousMonthSessions),
            reportTrend: this.calculateTrend(currentMonthReports, previousMonthReports),
        };
    }

    private calculateTrend(current: number, previous: number): { value: string; isPositive: boolean } {
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
}
