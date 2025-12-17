import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditAction } from '@prisma/client';
import { EncryptionService } from '../encryption/encryption.service';
export declare class AuditService {
    private readonly prisma;
    private readonly encryption;
    constructor(prisma: PrismaService, encryption: EncryptionService);
    log(data: {
        userId: string;
        action: AuditAction;
        resourceType: string;
        resourceId?: string;
        details?: string;
        ipAddress?: string;
        isSuccess?: boolean;
    }): Promise<void>;
    findAll(userId: string, limit?: number, offset?: number): Promise<{
        items: any[];
        total: number;
    }>;
    private enrichLogs;
}
