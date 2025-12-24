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
    startSimulation: async (difficulty: 'easy' | 'medium' | 'hard'): Promise<PatientProfile> => {
        // httpClient returns the data directly
        return await httpClient.post<PatientProfile>('/api/v1/simulator/start', { difficulty });
    },

    sendMessage: async (message: string, history: Array<{ role: 'user' | 'model'; parts: string }>, profile: PatientProfile) => {
        return await httpClient.post<{ response: string }>('/api/v1/simulator/chat', { message, history, profile });
    },

    evaluateSession: async (history: Array<{ role: 'user' | 'model'; parts: string }>) => {
        return await httpClient.post<{
            feedback: string;
            metrics: { empathy: number; intervention_effectiveness: number; professionalism: number }
        }>('/api/v1/simulator/evaluate', { history });
    }
};
