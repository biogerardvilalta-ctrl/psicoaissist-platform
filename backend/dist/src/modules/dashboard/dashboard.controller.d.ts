import { DashboardService } from './dashboard.service';
import { Request } from 'express';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(req: Request & {
        user: any;
    }): Promise<{
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
    }>;
}
