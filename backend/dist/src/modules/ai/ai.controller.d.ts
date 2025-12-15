import { AiService } from './ai.service';
import { TranscriptionService } from './transcription.service';
export declare class AiController {
    private readonly aiService;
    private readonly transcriptionService;
    constructor(aiService: AiService, transcriptionService: TranscriptionService);
    analyzeSession(sessionId: string, notes: string): Promise<{
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
    getSuggestions(context: string): Promise<{
        suggestions: string[];
        indicators: {
            type: string;
            label: string;
        }[];
    }>;
    transcribeAudio(file: Express.Multer.File): Promise<{
        text: string;
    }>;
}
