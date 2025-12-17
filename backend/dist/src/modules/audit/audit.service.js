"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const encryption_service_1 = require("../encryption/encryption.service");
let AuditService = class AuditService {
    constructor(prisma, encryption) {
        this.prisma = prisma;
        this.encryption = encryption;
    }
    async log(data) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId: data.userId,
                    action: data.action,
                    resourceType: data.resourceType,
                    resourceId: data.resourceId,
                    ipAddress: data.ipAddress || 'SYSTEM',
                    isSuccess: data.isSuccess ?? true,
                    metadata: data.details ? { details: data.details } : undefined,
                },
            });
        }
        catch (e) {
            console.error('Failed to create audit log', e);
        }
    }
    async findAll(userId, limit = 20, offset = 0) {
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
    async enrichLogs(logs, userId) {
        const clientIds = new Set();
        const sessionIds = new Set();
        const reportIds = new Set();
        logs.forEach(log => {
            if (!log.resourceId)
                return;
            if (log.resourceType === 'CLIENT')
                clientIds.add(log.resourceId);
            if (log.resourceType === 'SESSION')
                sessionIds.add(log.resourceId);
            if (log.resourceType === 'REPORT')
                reportIds.add(log.resourceId);
        });
        const idToClientIdMap = new Map();
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
        clientIds.forEach(id => idToClientIdMap.set(id, id));
        const allClientIds = new Set(idToClientIdMap.values());
        const clientNames = new Map();
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
                        const result = await this.encryption.decryptData({
                            encryptedData,
                            iv,
                            tag,
                            keyId: client.encryptionKeyId
                        });
                        if (result.success && result.data) {
                            clientNames.set(client.id, `${result.data.firstName} ${result.data.lastName}`);
                        }
                    }
                }
                catch (e) {
                }
            }));
        }
        return logs.map(log => {
            const newLog = clone(log);
            if (newLog.metadata && newLog.metadata.details && typeof newLog.metadata.details === 'string') {
                let details = newLog.metadata.details;
                let clientId;
                if (log.resourceType === 'CLIENT')
                    clientId = log.resourceId;
                else
                    clientId = idToClientIdMap.get(log.resourceId);
                if (clientId && clientNames.has(clientId)) {
                    const name = clientNames.get(clientId);
                    details = details.replace(/\(ID: [a-zA-Z0-9-]+\)/g, `(${name})`);
                    newLog.metadata.details = details;
                }
            }
            return newLog;
        });
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService])
], AuditService);
function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
//# sourceMappingURL=audit.service.js.map