
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditAction } from '@prisma/client';

import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class AuditService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly encryption: EncryptionService
    ) { }

    async log(data: {
        userId: string;
        action: AuditAction;
        resourceType: string;
        resourceId?: string;
        details?: string; // stored in metadata
        ipAddress?: string;
        isSuccess?: boolean;
        metadata?: any;
    }) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId: data.userId,
                    action: data.action,
                    resourceType: data.resourceType,
                    resourceId: data.resourceId,
                    ipAddress: data.ipAddress || 'SYSTEM',
                    isSuccess: data.isSuccess ?? true,
                    metadata: {
                        ...(data.metadata || {}),
                        details: data.details
                    },
                },
            });
        } catch (e) {
            console.error('Failed to create audit log', e);
            // Fail silently to not disrupt business flow
        }
    }

    async findAll(userId: string, limit: number = 20, offset: number = 0) {
        const [items, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            this.prisma.auditLog.count({ where: { userId } }),
        ]);

        const enrichedItems = await this.enrichLogs(items, userId);

        return { items: enrichedItems, total };
    }

    private async enrichLogs(logs: any[], userId: string) {
        // Collect Ids
        const clientIds = new Set<string>();
        const sessionIds = new Set<string>();
        const reportIds = new Set<string>();

        logs.forEach(log => {
            if (!log.resourceId) return;
            if (log.resourceType === 'CLIENT') clientIds.add(log.resourceId);
            if (log.resourceType === 'SESSION') sessionIds.add(log.resourceId);
            if (log.resourceType === 'REPORT') reportIds.add(log.resourceId);
        });

        const idToClientIdMap = new Map<string, string>(); // Generic ResourceId -> ClientId

        // Resolve Session/Report -> ClientId
        if (sessionIds.size > 0) {
            const sessions = await this.prisma.session.findMany({
                where: { id: { in: Array.from(sessionIds) } },
                select: { id: true, clientId: true }
            });
            sessions.forEach(s => idToClientIdMap.set(s.id, s.clientId));
        }

        if (reportIds.size > 0) {
            const reports = await this.prisma.report.findMany({
                where: { id: { in: Array.from(reportIds) } },
                select: { id: true, clientId: true }
            });
            reports.forEach(r => idToClientIdMap.set(r.id, r.clientId));
        }

        // Add direct client IDs
        clientIds.forEach(id => idToClientIdMap.set(id, id));

        // Gather all unique Client IDs needed
        const allClientIds = new Set<string>(idToClientIdMap.values());

        // Fetch Clients and Decrypt Names
        const clientNames = new Map<string, string>();
        if (allClientIds.size > 0) {
            const clients = await this.prisma.client.findMany({
                where: { id: { in: Array.from(allClientIds) } },
                select: { id: true, encryptedPersonalData: true, encryptionKeyId: true }
            });

            await Promise.all(clients.map(async (client) => {
                try {
                    if (client.encryptedPersonalData) {
                        const buffer = client.encryptedPersonalData;
                        const iv = buffer.subarray(0, 16).toString('base64');
                        const tag = buffer.subarray(16, 32).toString('base64');
                        const encryptedData = buffer.subarray(32);

                        const result = await this.encryption.decryptData<{ firstName: string; lastName: string }>({
                            encryptedData,
                            iv,
                            tag,
                            keyId: client.encryptionKeyId
                        });

                        if (result.success && result.data) {
                            clientNames.set(client.id, `${result.data.firstName} ${result.data.lastName}`);
                        }
                    }
                } catch (e) {
                    // Ignore decryption errors
                }
            }));
        }

        // Enrich Logs
        return logs.map(log => {
            const newLog = clone(log); // Simple clone or spread
            if (newLog.metadata && newLog.metadata.details && typeof newLog.metadata.details === 'string') {
                let details = newLog.metadata.details;

                // Check if we can resolve a name
                let clientId: string | undefined;
                if (log.resourceType === 'CLIENT') clientId = log.resourceId;
                else clientId = idToClientIdMap.get(log.resourceId);

                if (clientId && clientNames.has(clientId)) {
                    const name = clientNames.get(clientId);
                    // Replace (ID: uuid) with (Name)
                    // The format I used was: ... (ID: <uuid>)
                    // Regex replacement for UUIDs or CUIDs (alphanumeric)
                    details = details.replace(/\(ID: [a-zA-Z0-9-]+\)/g, `(${name})`);
                    newLog.metadata.details = details;
                }
            }
            return newLog;
        });
    }
}

function clone(obj: any) {
    return JSON.parse(JSON.stringify(obj));
}
