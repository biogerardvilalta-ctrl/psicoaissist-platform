import { httpClient } from '@/lib/http-client';

export interface PatientProfile {
    name: string;
    age: number;
    condition: string;
    traits: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    scenario: string;
}

export interface SimulationReport {
    id: string;
    createdAt: string;
    patientName: string;
    difficulty: string;
    empathyScore: number;
    effectivenessScore: number;
    professionalismScore: number;
    feedbackMarkdown: string;
}

export interface StatsData {
    count: number;
    avgEmpathy: number;
    evolution: Array<{ date: string; empathy: number; effectiveness: number }>;
    usage?: {
        used: number;
        limit: number;
        remaining: number;
        minutesUsed: number;
        minutesLimit: number;
        minutesRemaining: number;
        transcriptionUsed?: number;
        transcriptionLimit?: number;
        transcriptionRemaining?: number;
        plan: string;
        nextReset: string;
        clientsUsed?: number;
        clientsLimit?: number;
    };
}

export const simulatorService = {
    startSimulation: async (difficulty: 'easy' | 'medium' | 'hard', showNonVerbalCues: boolean = true): Promise<PatientProfile> => {
        // httpClient returns the data directly
        return await httpClient.post<PatientProfile>('/api/v1/simulator/start', { difficulty, showNonVerbalCues });
    },

    sendMessage: async (message: string, history: Array<{ role: 'user' | 'model'; parts: string }>, profile: PatientProfile) => {
        return await httpClient.post<{ response: string }>('/api/v1/simulator/chat', { message, history, profile });
    },

    evaluateSession: async (history: Array<{ role: 'user' | 'model'; parts: string }>, profile: PatientProfile, durationSeconds?: number) => {
        return await httpClient.post<{
            feedback: string;
            metrics: { empathy: number; intervention_effectiveness: number; professionalism: number }
        }>('/api/v1/simulator/evaluate', { history, profile, durationSeconds });
    },

    getReports: async (filters?: { period?: string; patientName?: string; date?: string }) => {
        const params = new URLSearchParams();
        if (filters?.period && filters.period !== 'all') params.append('period', filters.period);
        if (filters?.patientName) params.append('patientName', filters.patientName);
        if (filters?.date) params.append('date', filters.date);

        const queryString = params.toString() ? `?${params.toString()}` : '';
        return await httpClient.get<SimulationReport[]>(`/api/v1/simulator/reports${queryString}`);
    },

    getStats: async (period?: string) => {
        const params = new URLSearchParams();
        if (period && period !== 'all') params.append('period', period);

        const queryString = params.toString() ? `?${params.toString()}` : '';

        return await httpClient.get<StatsData>(`/api/v1/simulator/stats${queryString}`);
    }
};
