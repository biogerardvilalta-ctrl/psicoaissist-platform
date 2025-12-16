import { httpClient } from './http-client';

export interface DashboardStats {
    activeClients: number;
    totalSessions: number;
    totalReports: number;
    formattedHours: string;
    clientTrend: { value: string; isPositive: boolean };
    sessionTrend: { value: string; isPositive: boolean };
    reportTrend: { value: string; isPositive: boolean };
    sessionTypes: { label: string; value: number; color: string }[];
    techniques: { label: string; value: number; color: string }[];
    tests: { label: string; value: number; color: string }[];
}

export class DashboardAPI {
    private static readonly BASE_URL = '/api/v1/dashboard';

    static async getStats() {
        return httpClient.get<DashboardStats>(`${this.BASE_URL}/stats`);
    }
}
