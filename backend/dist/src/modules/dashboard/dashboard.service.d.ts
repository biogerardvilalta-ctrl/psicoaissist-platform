import { PrismaService } from '../../common/prisma/prisma.service';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getStats(userId: string): Promise<{
        activeClients: number;
        totalSessions: number;
        totalReports: number;
        clientTrend: {
            value: string;
            isPositive: boolean;
        };
        sessionTrend: {
            value: string;
            isPositive: boolean;
        };
        reportTrend: {
            value: string;
            isPositive: boolean;
        };
    }>;
}
