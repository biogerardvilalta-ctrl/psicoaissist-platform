
import { httpClient } from './http-client';

export interface AuditLog {
    id: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    method?: string;
    isSuccess: boolean;
    createdAt: string;
    user?: {
        email: string;
        firstName?: string;
        lastName?: string;
    };
    metadata?: any;
}

export interface AuditRespons {
    items: AuditLog[];
    total: number;
}

export class AuditAPI {
    private static readonly BASE_URL = '/api/v1/audit';

    static async getAll(limit: number = 50, offset: number = 0) {
        return httpClient.get<AuditRespons>(`${this.BASE_URL}?limit=${limit}&offset=${offset}`);
    }
}
