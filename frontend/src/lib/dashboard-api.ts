import { httpClient } from './http-client';

export interface DashboardStats {
    activeClients: number;
    clientTrend: { value: string; isPositive: boolean };
    topThemes: Array<{ topic: string; frequency: number }>;
    sentimentTrend: Array<{ date: string; value: number }>;

    // Additional backend stats
    totalSessions?: number;
    sessionTrend?: { value: string; isPositive: boolean };
    sessionTypes?: Array<{ name: string; value: number }>;
    tests?: Array<{ name: string; value: number }>;
    techniques?: Array<{ name: string; value: number }>;
    alerts?: Array<{ type: 'WARNING' | 'INFO' | 'CRITICAL'; message: string }>;
}

export class DashboardAPI {
    private static BASE_URL = '/api/v1/dashboard';

    static async getStats(startDate?: string, professionalId?: string): Promise<DashboardStats> {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (professionalId && professionalId !== 'all') params.append('professionalId', professionalId);

        return httpClient.get<DashboardStats>(`${this.BASE_URL}/stats?${params.toString()}`);
    }
}
