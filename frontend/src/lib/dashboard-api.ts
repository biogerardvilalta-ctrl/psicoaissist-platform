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
    topThemes: { name: string; value: number }[];
    sentimentTrend: { date: string; value: number }[];
}

export class DashboardAPI {
    private static readonly BASE_URL = '/api/v1/dashboard';

    static async getStats(clientId?: string, professionalId?: string) {
        const params = new URLSearchParams();
        if (clientId) params.append('clientId', clientId);
        if (professionalId && professionalId !== 'all') params.append('professionalId', professionalId);

        const queryString = params.toString();
        const url = queryString ? `${this.BASE_URL}/stats?${queryString}` : `${this.BASE_URL}/stats`;
        return httpClient.get<DashboardStats>(url);
    }
}
