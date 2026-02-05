import { httpClient } from './http-client';

export enum ReportType {
    INITIAL_EVALUATION = 'INITIAL_EVALUATION',
    PROGRESS = 'PROGRESS',
    DISCHARGE = 'DISCHARGE',
    REFERRAL = 'REFERRAL',
    LEGAL = 'LEGAL',
    INSURANCE = 'INSURANCE',
    CUSTOM = 'CUSTOM',
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
    [ReportType.INITIAL_EVALUATION]: 'Evaluación Inicial',
    [ReportType.PROGRESS]: 'Evolución',
    [ReportType.DISCHARGE]: 'Alta Clínica',
    [ReportType.REFERRAL]: 'Derivación',
    [ReportType.LEGAL]: 'Legal / Forense',
    [ReportType.INSURANCE]: 'Informe para Seguros',
    [ReportType.CUSTOM]: 'Personalizado',
};

export enum ReportStatus {
    DRAFT = 'DRAFT',
    IN_REVIEW = 'IN_REVIEW',
    COMPLETED = 'COMPLETED',
    ARCHIVED = 'ARCHIVED',
}

export interface Report {
    id: string;
    title: string;
    reportType: ReportType;
    status: ReportStatus;
    clientId: string;
    client?: {
        id: string;
        // Names might be encrypted or fetched separately, handling simply for now
        firstName?: string;
        lastName?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateReportData {
    clientId: string;
    title: string;
    reportType: ReportType;
    sessionId?: string;
    content?: string;
    status?: ReportStatus;
    humanReviewConfirmed?: boolean;
}

export interface GenerateDraftData {
    clientId: string;
    reportType: ReportType;
    sessionIds: string[];
    additionalInstructions?: string;
    language?: string;
}

export class ReportsAPI {
    private static readonly BASE_PATH = '/api/v1/reports';

    static async getAll(): Promise<Report[]> {
        return httpClient.get<Report[]>(this.BASE_PATH);
    }

    static async getById(id: string): Promise<Report & { content: string }> {
        return httpClient.get<Report & { content: string }>(`${this.BASE_PATH}/${id}`);
    }

    static async create(data: CreateReportData): Promise<Report> {
        return httpClient.post<Report>(this.BASE_PATH, data);
    }

    static async update(id: string, data: Partial<CreateReportData> & { status?: ReportStatus }): Promise<Report> {
        return httpClient.patch<Report>(`${this.BASE_PATH}/${id}`, data);
    }

    static async delete(id: string): Promise<void> {
        return httpClient.delete(`${this.BASE_PATH}/${id}`);
    }

    static async download(id: string): Promise<Blob> {
        return httpClient.get<Blob>(`${this.BASE_PATH}/${id}/download`, {
            responseType: 'blob'
        } as RequestInit);
    }

    static async downloadWord(id: string): Promise<Blob> {
        return httpClient.get<Blob>(`${this.BASE_PATH}/${id}/download/word`, {
            responseType: 'blob'
        } as RequestInit);
    }

    static async generateDraft(data: GenerateDraftData): Promise<{ content: string }> {
        return httpClient.post<{ content: string }>(`${this.BASE_PATH}/generate-draft`, data);
    }

    static async exportAllPdfs(): Promise<Blob> {
        return httpClient.get<Blob>(`${this.BASE_PATH}/export/all`, {
            responseType: 'blob'
        } as any);
    }
}
