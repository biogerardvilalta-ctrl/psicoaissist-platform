import { httpClient } from './http-client';

export enum SessionStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
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
}

export interface CreateSessionData {
    clientId: string;
    startTime: string; // ISO Date
    endTime?: string;
    sessionType: SessionType;
    notes?: string;
}

export interface UpdateSessionData {
    startTime?: string;
    endTime?: string;
    status?: SessionStatus;
    notes?: string;
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
};
