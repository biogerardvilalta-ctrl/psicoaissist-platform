import { ReportsService } from './reports.service';
import { CreateReportDto, UpdateReportDto } from './dto/reports.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    create(req: any, createReportDto: CreateReportDto): Promise<{
        id: string;
        title: string;
        reportType: import(".prisma/client").$Enums.ReportType;
        status: import(".prisma/client").$Enums.ReportStatus;
        version: number;
        encryptedContent: Buffer;
        encryptedMetadata: Buffer | null;
        templateId: string | null;
        aiGenerated: boolean;
        aiConfidence: number | null;
        encryptionKeyId: string;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
        clientId: string;
        userId: string;
        sessionId: string | null;
    }>;
    findAll(req: any): Promise<({
        client: {
            id: string;
        };
    } & {
        id: string;
        title: string;
        reportType: import(".prisma/client").$Enums.ReportType;
        status: import(".prisma/client").$Enums.ReportStatus;
        version: number;
        encryptedContent: Buffer;
        encryptedMetadata: Buffer | null;
        templateId: string | null;
        aiGenerated: boolean;
        aiConfidence: number | null;
        encryptionKeyId: string;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
        clientId: string;
        userId: string;
        sessionId: string | null;
    })[]>;
    findOne(req: any, id: string): Promise<{
        content: string;
        id: string;
        title: string;
        reportType: import(".prisma/client").$Enums.ReportType;
        status: import(".prisma/client").$Enums.ReportStatus;
        version: number;
        encryptedContent: Buffer;
        encryptedMetadata: Buffer | null;
        templateId: string | null;
        aiGenerated: boolean;
        aiConfidence: number | null;
        encryptionKeyId: string;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
        clientId: string;
        userId: string;
        sessionId: string | null;
    }>;
    update(req: any, id: string, updateReportDto: UpdateReportDto): Promise<{
        id: string;
        title: string;
        reportType: import(".prisma/client").$Enums.ReportType;
        status: import(".prisma/client").$Enums.ReportStatus;
        version: number;
        encryptedContent: Buffer;
        encryptedMetadata: Buffer | null;
        templateId: string | null;
        aiGenerated: boolean;
        aiConfidence: number | null;
        encryptionKeyId: string;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
        clientId: string;
        userId: string;
        sessionId: string | null;
    }>;
    generateDraft(req: any, generateReportDraftDto: any): Promise<{
        content: string;
    }>;
    remove(req: any, id: string): Promise<{
        id: string;
        title: string;
        reportType: import(".prisma/client").$Enums.ReportType;
        status: import(".prisma/client").$Enums.ReportStatus;
        version: number;
        encryptedContent: Buffer;
        encryptedMetadata: Buffer | null;
        templateId: string | null;
        aiGenerated: boolean;
        aiConfidence: number | null;
        encryptionKeyId: string;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
        clientId: string;
        userId: string;
        sessionId: string | null;
    }>;
}
