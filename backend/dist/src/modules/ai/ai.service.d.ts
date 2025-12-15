export declare class AiService {
    generateSessionAnalysis(sessionId: string, notes: string): Promise<{
        summary: string;
        sentiment: string;
        suggestions: string[];
        clinicalImpressions?: string[];
        detectedIndicators?: {
            type: string;
            label: string;
        }[];
        riskLevel?: string;
    }>;
    getLiveSuggestions(context: string): Promise<{
        suggestions: string[];
        indicators: {
            type: string;
            label: string;
        }[];
    }>;
}
