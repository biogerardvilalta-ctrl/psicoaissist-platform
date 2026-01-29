import { httpClient } from './http-client';

export enum SessionStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    NO_SHOW = 'NO_SHOW'
}

export enum SessionType {
    INDIVIDUAL = 'INDIVIDUAL',
    GROUP = 'GROUP',
    FAMILY = 'FAMILY',
    COUPLE = 'COUPLE',
    CONSULTATION = 'CONSULTATION',
    EMERGENCY = 'EMERGENCY'
}

export interface Session {
    id: string;
    clientId: string;
    clientName?: string; // Often joined
    startTime: string;
    endTime?: string;
    duration?: number;
    status: SessionStatus | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    sessionType: string;
    notesSummary?: string; // Optional preview
    notes?: string;
    transcription?: string;
    methodology?: string;
    isMinor?: boolean;
    aiMetadata?: {
        sentimentScore?: number;
        summary?: string;
        emotionalElements?: string[];
        narrativeIndicators?: string[];
        orientativeObservations?: string[];
        clinicalFollowUpSupport?: {
            suggestions?: string[];
            possibleLines?: string[];
            modelReferences?: string[];
        };
        diagnostic_final?: {
            nota_general?: string;
            tests_sugerits_final?: {
                suggeriments: Array<{
                    tema: string;
                    categoria: string;
                    tests: Array<{
                        codi: string;
                        nom: string;
                        objectiu_general: string;
                    }>;
                }>;
                regles?: {
                    font?: string;
                    criteri_seleccio?: string;
                };
            };
        };
        disclaimer?: string;
    };
    videoCallToken?: string;
}

export class SessionsAPI {
    private static readonly BASE_PATH = '/api/v1/sessions';

    static async getAll(filters?: { clientId?: string; status?: string; from?: string; to?: string; professionalId?: string }): Promise<Session[]> {
        const params = new URLSearchParams();
        if (filters?.clientId) params.append('clientId', filters.clientId);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.from) params.append('from', filters.from);
        if (filters?.to) params.append('to', filters.to);
        if (filters?.professionalId && filters.professionalId !== 'all') params.append('professionalId', filters.professionalId);

        return httpClient.get<Session[]>(`${this.BASE_PATH}?${params.toString()}`);
    }

    static async getById(id: string): Promise<Session> {
        return httpClient.get<Session>(`${this.BASE_PATH}/${id}`);
    }

    static async create(data: { clientId: string; startTime: string; sessionType: string; notes?: string; professionalId?: string }): Promise<Session> {
        return httpClient.post<Session>(this.BASE_PATH, data);
    }

    static async update(id: string, data: Partial<Session>): Promise<Session> {
        return httpClient.patch<Session>(`${this.BASE_PATH}/${id}`, data);
    }

    static async delete(id: string): Promise<void> {
        return httpClient.delete<void>(`${this.BASE_PATH}/${id}`);
    }

    static async getAvailability(date: string, professionalId?: string): Promise<{ date: string; slots: string[] }> {
        let url = `${this.BASE_PATH}/availability?date=${date}`;
        if (professionalId) {
            url += `&professionalId=${professionalId}`;
        }
        return httpClient.get<{ date: string; slots: string[] }>(url);
    }

    static async createVideoCall(id: string): Promise<{ token: string; link: string }> {
        return httpClient.post<{ token: string; link: string }>(`${this.BASE_PATH}/${id}/video-call`, {});
    }
}
