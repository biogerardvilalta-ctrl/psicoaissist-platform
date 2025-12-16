import { ReportType, ReportStatus } from '@prisma/client';
export declare class CreateReportDto {
    clientId: string;
    title: string;
    reportType: ReportType;
    sessionId?: string;
    content?: string;
    status?: ReportStatus;
}
export declare class UpdateReportDto {
    title?: string;
    status?: ReportStatus;
    content?: string;
    professionalSignature?: string;
    humanReviewConfirmed?: boolean;
}
export declare class GenerateReportDraftDto {
    clientId: string;
    reportType: ReportType;
    sessionIds: string[];
    additionalInstructions?: string;
}
