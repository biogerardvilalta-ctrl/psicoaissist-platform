import { httpClient } from '@/lib/http-client';

export interface PatientProfile {
    name: string;
    age: number;
    condition: string;
    traits: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    scenario: string;
}

export const simulatorService = {
    startSimulation: async (difficulty: 'easy' | 'medium' | 'hard', showNonVerbalCues: boolean = true): Promise<PatientProfile> => {
        // httpClient returns the data directly
        return await httpClient.post<PatientProfile>('/api/v1/simulator/start', { difficulty, showNonVerbalCues });
    },

    sendMessage: async (message: string, history: Array<{ role: 'user' | 'model'; parts: string }>, profile: PatientProfile) => {
        return await httpClient.post<{ response: string }>('/api/v1/simulator/chat', { message, history, profile });
    },

    evaluateSession: async (history: Array<{ role: 'user' | 'model'; parts: string }>, profile: PatientProfile) => {
        return await httpClient.post<{
            feedback: string;
            metrics: { empathy: number; intervention_effectiveness: number; professionalism: number }
        }>('/api/v1/simulator/evaluate', { history, profile });
    },

    getReports: async () => {
        return await httpClient.get<Array<{
            id: string,
            createdAt: string,
            patientName: string,
            difficulty: string,
            empathyScore: number,
            effectivenessScore: number,
            professionalismScore: number
        }>>('/api/v1/simulator/reports');
    },

    getStats: async () => {
        return await httpClient.get<{
            count: number,
            avgEmpathy: number,
            evolution: Array<{ date: string, empathy: number, effectiveness: number }>
        }>('/api/v1/simulator/stats');
    }
};
