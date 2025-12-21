import { PrismaService } from '../../common/prisma/prisma.service';
import { ClientsService } from '../clients/clients.service';
import { EncryptionService } from '../encryption/encryption.service';
export declare class DashboardService {
    private readonly prisma;
    private readonly clientsService;
    private readonly encryption;
    constructor(prisma: PrismaService, clientsService: ClientsService, encryption: EncryptionService);
    private unpackEncryptedData;
    getStats(userId: string): Promise<{
        activeClients: number;
        totalSessions: number;
        totalReports: number;
        formattedHours: string;
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
        sessionTypes: {
            label: string;
            value: number;
            color: string;
        }[];
        techniques: {
            label: string;
            value: number;
            color: string;
        }[];
        tests: {
            label: string;
            value: number;
            color: string;
        }[];
        topThemes: {
            name: string;
            value: number;
        }[];
        sentimentTrend: {
            date: string;
            value: number;
        }[];
    }>;
    private getColorForType;
    private getColorForTechnique;
    private getRandomColor;
    private calculateTrend;
}
