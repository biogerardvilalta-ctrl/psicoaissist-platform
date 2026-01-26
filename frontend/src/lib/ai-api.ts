
import { httpClient } from '@/lib/http-client';

export interface AiAnalysisResult {
    summary: string;
    sentiment?: string; // Optional if backend removes it or it's not in the new type
    suggestions?: string[]; // Legacy
    emotionalElements?: string[];
    narrativeIndicators?: string[];
    orientativeObservations?: string[];
    clinicalFollowUpSupport: {
        suggestions: string[];
        possibleLines: string[];
        modelReferences: string[];
    };
    discurs_pacient: {
        resum_descriptiu: string;
        fragments_relevants: string[];
    };
    temes_emergents_sessio: {
        regles_seleccio: any;
        temes_seleccionats: any[];
        temes_descartats: any[];
    };
    diagnostic_final: {
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
        disclaimer?: string;
        audit_session?: {
            ai_role: string;
            clinical_decision_making: boolean;
            real_time_recommendations: boolean;
            tests_suggested_only_at_session_end: boolean;
            max_topics_applied: number;
            max_tests_applied: number;
            decision_logic: {
                based_on: string[];
                excluded: string[];
            };
            professional_override_allowed: boolean;
            audit_trace_available: boolean;
            compliance: string[];
            timestamp: string;
            compliance_document?: {
                title: string;
                version: string;
                last_updated: string;
                scope: string[];
                available_to_professional: boolean;
                content_hash: string;
            };
        };
        clinical_report_text?: string;
    };
    aiSuggestions?: {
        ai_role: string;
        clinical_decision_making: boolean;
        real_time_recommendations: boolean;
        tests_suggested_only_at_session_end: boolean;
        max_topics_applied: number;
        max_tests_applied: number;
        decision_logic: {
            based_on: string[];
            excluded: string[];
        };
        professional_override_allowed: boolean;
        audit_trace_available: boolean;
        compliance: string[];
        timestamp: string;
    };
    clinical_report_text: string;
}

export const AiAPI = {
    analyzeSession: async (sessionId: string, notes: string): Promise<AiAnalysisResult> => {
        return await httpClient.post<AiAnalysisResult>(`/api/v1/ai/session/${sessionId}/analyze`, { notes });
    },

    getSuggestions: async (context: string): Promise<{ questions: string[]; considerations: string[]; indicators: { type: string; label: string }[] }> => {
        return await httpClient.post('/api/v1/ai/suggestions', { context });
    },

    transcribe: async (audioBlob: Blob, isLive?: boolean): Promise<{ text: string }> => {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'chunk.webm');

        // We use fetch directly here because httpClient might be configured for JSON
        const token = localStorage.getItem('psychoai_access_token') || sessionStorage.getItem('psychoai_access_token');
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/ai/transcribe`);
        if (isLive) {
            url.searchParams.append('isLive', 'true');
        }

        const response = await fetch(url.toString(), {
            method: 'POST',
            body: formData,
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });
        return response.json();
    }
};
