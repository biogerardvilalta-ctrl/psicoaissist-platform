import { TranscriptionService, AnalysisType } from '@prisma/client';
export declare class UploadAudioDto {
    sessionId?: string;
    title?: string;
}
export declare class CreateTranscriptionDto {
    audioFileId: string;
    service?: TranscriptionService;
    language?: string;
    sessionId?: string;
}
export declare class UpdateTranscriptionDto {
    content?: string;
    isEdited?: boolean;
}
export declare class CreateAnalysisDto {
    transcriptionId: string;
    analysisType: AnalysisType;
    aiService?: string;
    model?: string;
}
export declare class TranscriptionQueryDto {
    sessionId?: string;
    status?: string;
    limit?: number;
    offset?: number;
}
