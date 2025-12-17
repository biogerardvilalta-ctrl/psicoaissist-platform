import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(req: any, limit: string, offset: string): Promise<{
        items: any[];
        total: number;
    }>;
}
