import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) { }

    async getStats(userId: string) {
        const [clientsCount, sessionsCount, reportsCount] = await Promise.all([
            this.prisma.client.count({ where: { userId, isActive: true } }),
            this.prisma.session.count({ where: { userId } }),
            this.prisma.report.count({ where: { userId } }),
        ]);

        return {
            activeClients: clientsCount,
            totalSessions: sessionsCount,
            totalReports: reportsCount,
            // Mock data for trends until we have historical data
            clientTrend: { value: "+1", isPositive: true },
            sessionTrend: { value: "+5%", isPositive: true },
            reportTrend: { value: "+2", isPositive: true },
        };
    }
}
