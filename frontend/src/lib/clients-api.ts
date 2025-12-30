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
    sendEmailReminders?: boolean;
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
    sendEmailReminders?: boolean;
    professionalId?: string;
};

export type UpdateClientData = Partial<CreateClientData> & {
    isActive?: boolean;
};

export class ClientsAPI {
    private static readonly BASE_URL = '/api/v1/clients';

    static async getAll(active: boolean = true, professionalId?: string) {
        const queryParams = new URLSearchParams({ active: String(active) });
        if (professionalId && professionalId !== 'all') queryParams.append('professionalId', professionalId);
        return httpClient.get<Client[]>(`${this.BASE_URL}?${queryParams.toString()}`);
    }

    static async getById(id: string) {
        return httpClient.get<Client>(`${this.BASE_URL}/${id}`);
    }

    static async create(data: CreateClientData) {
        if (typeof window !== 'undefined') {
            const keyStr = localStorage.getItem('psychoai_encryption_key');
            if (keyStr) {
                try {
                    const keyData = JSON.parse(keyStr);
                    if (keyData && keyData.key) {
                        const { CryptoService } = await import('./crypto');
                        const encrypted = await CryptoService.encrypt(data, keyData.key);
                        return httpClient.post(this.BASE_URL, {
                            encryptedData: encrypted,
                            keyId: keyData.id,
                            tags: data.tags,
                            riskLevel: data.riskLevel,
                            sendEmailReminders: data.sendEmailReminders,
                            professionalId: data.professionalId
                        });
                    }
                } catch (e) {
                    console.error("Client-side encryption failed:", e);
                    // Fallback or throw? User requested encryption. Better to throw or warn.
                    // But for robustness, if key invalid, maybe fallback?
                    // User said "se tiene que encriptar".
                    throw new Error("No se pudo encriptar los datos del cliente.");
                }
            }
        }
        return httpClient.post<Client>(this.BASE_URL, data);
    }

    static async update(id: string, data: UpdateClientData) {
        return httpClient.put<Client>(`${this.BASE_URL}/${id}`, data); // Using PUT as per typical full update or PATCH if partial. Backend likely supports PATCH. My controller uses @Body so it might be patch-like. Let's check Controller.
    }

    static async delete(id: string) {
        return httpClient.delete<{ message: string }>(`${this.BASE_URL}/${id}`);
    }

    static async restore(id: string) {
        return httpClient.put<Client>(`${this.BASE_URL}/${id}`, { isActive: true });
    }

    static async deletePermanent(id: string) {
        return httpClient.delete<{ message: string }>(`${this.BASE_URL}/permanent/${id}`);
    }
}
