export declare class AiService {
    private genAI;
    constructor();
    private filterContent;
    generateSessionAnalysis(sessionId: string, notes: string, transcription: string, isMinor?: boolean, language?: string): Promise<{
        summary: string;
        sentimentScore?: number;
        emotionalElements: string[];
        narrativeIndicators: string[];
        orientativeObservations: string[];
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
                        why_this_test_was_suggested: {
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
        disclaimer: string;
        audit_session: {
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
        audit_minors?: {
            minor_context: boolean;
            language_adapted: boolean;
            developmental_focus: boolean;
            non_diagnostic_language: boolean;
            tests_age_appropriate: boolean;
            guardian_decision_required: boolean;
        };
    }>;
    private validateAuditFlags;
    getLiveSuggestions(context: string): Promise<{
        questions: string[];
        considerations: string[];
        indicators: {
            type: string;
            label: string;
        }[];
    }>;
    generateReportDraft(data: {
        clientName: string;
        reportType: string;
        sections: string[];
        tone: string;
        legalSensitivity: string;
        sessionCount: number;
        period: string;
        notesSummary: string;
        firstSessionNote?: string;
        additionalInstructions?: string;
        languageProfile?: string;
        language?: string;
    }): Promise<string>;
}
