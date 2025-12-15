import { httpClient, createApiResponse, createPaginatedResponse } from './http-client';

export interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    formattedPhone?: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    tags: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastSessionAt?: string;
    diagnosis?: string;
    notes?: string;
    emergencyContact?: string;
}

export type CreateClientData = {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    emergencyContact?: string;
    diagnosis?: string;
    notes?: string;
    riskLevel?: Client['riskLevel'];
    tags?: string[];
};

export type UpdateClientData = Partial<CreateClientData> & {
    isActive?: boolean;
};

export class ClientsAPI {
    private static readonly BASE_URL = '/api/v1/clients';

    static async getAll() {
        return httpClient.get<Client[]>(this.BASE_URL);
    }

    static async getById(id: string) {
        return httpClient.get<Client>(`${this.BASE_URL}/${id}`);
    }

    static async create(data: CreateClientData) {
        return httpClient.post<Client>(this.BASE_URL, data);
    }

    static async update(id: string, data: UpdateClientData) {
        return httpClient.put<Client>(`${this.BASE_URL}/${id}`, data); // Using PUT as per typical full update or PATCH if partial. Backend likely supports PATCH. My controller uses @Body so it might be patch-like. Let's check Controller.
    }

    static async delete(id: string) {
        return httpClient.delete<{ message: string }>(`${this.BASE_URL}/${id}`);
    }
}
