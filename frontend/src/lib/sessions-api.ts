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
    COUPLE = 'COUPLE',
    FAMILY = 'FAMILY'
}

export interface Session {
    id: string;
    clientId: string;
    userId: string;
    startTime: string; // ISO Date
    endTime?: string;
    status: SessionStatus;
    sessionType: SessionType;
    notes?: string;
    clientName?: string;
    aiMetadata?: {
        summary: string;
        emotionalElements: string[];
        narrativeIndicators: string[];
        orientativeObservations: string[];
        clinicalFollowUpSupport: {
            suggestions: string[];
            possibleLines: string[];
            modelReferences: string[];
        };
        discurs_pacient?: {
            resum_descriptiu: string;
            fragments_relevants: string[];
        };
        temes_emergents_sessio?: {
            regles_seleccio: any;
            temes_seleccionats: any[];
            temes_descartats: any[];
        };
        diagnostic_final?: {
            nota_general: string;
            tests_sugerits_final: {
                regles: any;
                suggeriments: Array<{
                    tema: string;
                    categoria: string;
                    tests: Array<{
                        codi: string;
                        nom: string;
                        objectiu_general: string;
                        why_this_test_was_suggested?: {
                            based_on: string[];
                            tema_associat: string;
                            descripcio_orientativa: string;
                            font: string;
                            decisio_automatica: boolean;
                        };
                    }>;
                }>;
            };
        };
        disclaimer?: string;
    };
    aiSuggestions?: string[];
    isMinor?: boolean;
}

export interface CreateSessionData {
    clientId: string;
    startTime: string; // ISO Date
    endTime?: string;
    sessionType: SessionType;
    notes?: string;
    isMinor?: boolean;
}

export interface UpdateSessionData {
    startTime?: string;
    endTime?: string;
    status?: SessionStatus;
    notes?: string;
    consentSigned?: boolean;
    consentVersion?: string;
    isMinor?: boolean;
}

export const SessionsAPI = {
    getAll: async (): Promise<Session[]> => {
        return httpClient.get<Session[]>('/api/v1/sessions');
    },

    getById: async (id: string): Promise<Session> => {
        return httpClient.get<Session>(`/api/v1/sessions/${id}`);
    },

    create: async (data: CreateSessionData): Promise<Session> => {
        return httpClient.post<Session>('/api/v1/sessions', data);
    },

    update: async (id: string, data: UpdateSessionData): Promise<Session> => {
        return httpClient.patch<Session>(`/api/v1/sessions/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return httpClient.delete<void>(`/api/v1/sessions/${id}`);
    },

    getByDateRange: async (start: Date, end: Date): Promise<Session[]> => {
        const startStr = start.toISOString();
        const endStr = end.toISOString();
        return httpClient.get<Session[]>(`/api/v1/sessions/calendar?start=${startStr}&end=${endStr}`);
    },
};
