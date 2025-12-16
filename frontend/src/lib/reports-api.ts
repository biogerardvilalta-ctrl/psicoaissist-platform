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
}

export interface GenerateDraftData {
    clientId: string;
    reportType: ReportType;
    sessionIds: string[];
    additionalInstructions?: string;
}

export class ReportsAPI {
    private static readonly BASE_PATH = '/api/reports';

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

    static async generateDraft(data: GenerateDraftData): Promise<{ content: string }> {
        return httpClient.post<{ content: string }>(`${this.BASE_PATH}/generate-draft`, data);
    }
}
