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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const encryption_service_1 = require("../encryption/encryption.service");
const ai_service_1 = require("../ai/ai.service");
const client_1 = require("@prisma/client");
let ReportsService = class ReportsService {
    constructor(prisma, encryption, aiService) {
        this.prisma = prisma;
        this.encryption = encryption;
        this.aiService = aiService;
    }
    async create(userId, createReportDto) {
        const initialContent = createReportDto.content || '';
        const { keyId, encryptedData, iv, tag } = await this.encryption.encryptData({ content: initialContent }, userId);
        const packedData = Buffer.concat([
            Buffer.from(iv, 'base64'),
            Buffer.from(tag, 'base64'),
            encryptedData
        ]);
        return this.prisma.report.create({
            data: {
                userId,
                clientId: createReportDto.clientId,
                sessionId: createReportDto.sessionId,
                title: createReportDto.title,
                reportType: createReportDto.reportType,
                status: client_1.ReportStatus.DRAFT,
                encryptedContent: packedData,
                encryptionKeyId: keyId,
            }
        });
    }
    async findAll(userId) {
        return this.prisma.report.findMany({
            where: {
                userId,
                status: { not: 'DELETED' }
            },
            include: {
                client: {
                    select: {
                        id: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOne(id, userId) {
        const report = await this.prisma.report.findFirst({
            where: { id, userId }
        });
        if (!report) {
            throw new common_1.NotFoundException('Informe no encontrado');
        }
        let content = '';
        try {
            const iv = report.encryptedContent.subarray(0, 16).toString('base64');
            const tag = report.encryptedContent.subarray(16, 32).toString('base64');
            const encryptedData = report.encryptedContent.subarray(32);
            const result = await this.encryption.decryptData({
                encryptedData,
                iv,
                tag,
                keyId: report.encryptionKeyId
            });
            if (result.success) {
                content = result.data.content;
            }
        }
        catch (error) {
            console.error('Error decrypting report:', error);
        }
        return { ...report, content };
    }
    async update(id, userId, updateReportDto) {
        const report = await this.prisma.report.findFirst({
            where: { id, userId }
        });
        if (!report) {
            throw new common_1.NotFoundException('Informe no encontrado');
        }
        const data = {};
        if (updateReportDto.title)
            data.title = updateReportDto.title;
        if (updateReportDto.status) {
            data.status = updateReportDto.status;
            if (updateReportDto.status === client_1.ReportStatus.COMPLETED) {
                data.completedAt = new Date();
            }
        }
        if (updateReportDto.content !== undefined) {
            const { keyId, encryptedData, iv, tag } = await this.encryption.encryptData({ content: updateReportDto.content }, userId);
            data.encryptedContent = Buffer.concat([
                Buffer.from(iv, 'base64'),
                Buffer.from(tag, 'base64'),
                encryptedData
            ]);
            data.encryptionKeyId = keyId;
        }
        return this.prisma.report.update({
            where: { id },
            data
        });
    }
    async remove(id, userId) {
        return this.prisma.report.update({
            where: { id, userId },
            data: { status: 'DELETED' }
        });
    }
    async generateDraft(userId, data) {
        const sessions = await this.prisma.session.findMany({
            where: {
                id: { in: data.sessionIds },
                userId
            },
            select: {
                startTime: true,
                encryptedNotes: true,
                encryptionKeyId: true
            },
            orderBy: { startTime: 'asc' }
        });
        if (!sessions.length) {
            throw new common_1.NotFoundException('No se encontraron sesiones para generar el informe.');
        }
        let notesSummary = "";
        for (const session of sessions) {
            if (session.encryptedNotes) {
                try {
                    const iv = session.encryptedNotes.subarray(0, 16).toString('base64');
                    const tag = session.encryptedNotes.subarray(16, 32).toString('base64');
                    const encryptedData = session.encryptedNotes.subarray(32);
                    const result = await this.encryption.decryptString({
                        encryptedData,
                        iv,
                        tag,
                        keyId: session.encryptionKeyId
                    });
                    if (result.success) {
                        notesSummary += `[${session.startTime.toLocaleDateString()}] ${result.data}\n`;
                    }
                }
                catch (e) {
                    console.error("Failed to decrypt session note for draft", e);
                }
            }
        }
        const client = await this.prisma.client.findUnique({ where: { id: data.clientId } });
        const period = `${sessions[0].startTime.toLocaleDateString()} - ${sessions[sessions.length - 1].startTime.toLocaleDateString()}`;
        const draftContent = await this.aiService.generateReportDraft({
            clientName: "Paciente",
            reportType: data.reportType,
            sessionCount: sessions.length,
            period,
            notesSummary
        });
        return { content: draftContent };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService,
        ai_service_1.AiService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map