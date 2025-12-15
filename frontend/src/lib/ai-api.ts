
import { httpClient } from '@/lib/http-client';

export interface AiAnalysisResult {
    summary: string;
    sentiment: string;
    suggestions: string[];
}

export const AiAPI = {
    analyzeSession: async (sessionId: string, notes: string): Promise<AiAnalysisResult> => {
        return await httpClient.post<{ summary: string; sentiment: string; suggestions: string[] }>(`/api/v1/ai/session/${sessionId}/analyze`, { notes });
    },

    getSuggestions: async (context: string): Promise<{ suggestions: string[]; indicators: { type: string; label: string }[] }> => {
        return await httpClient.post('/api/v1/ai/suggestions', { context });
    },

    transcribe: async (audioBlob: Blob): Promise<{ text: string }> => {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'chunk.webm');

        // We use fetch directly here because httpClient might be configured for JSON
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/ai/transcribe`, {
            method: 'POST',
            body: formData,
        });
        return response.json();
    }
};
