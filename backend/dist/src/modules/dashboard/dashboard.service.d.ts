import { PrismaService } from '../../common/prisma/prisma.service';
import { ClientsService } from '../clients/clients.service';
export declare class DashboardService {
    private readonly prisma;
    private readonly clientsService;
    constructor(prisma: PrismaService, clientsService: ClientsService);
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
    private calculateTrend;
}
