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
const psychological_reports_config_1 = require("../../config/psychological-reports.config");
const pdf_service_1 = require("./pdf.service");
const audit_service_1 = require("../audit/audit.service");
const client_2 = require("@prisma/client");
let ReportsService = class ReportsService {
    constructor(prisma, encryption, aiService, pdfService, auditService) {
        this.prisma = prisma;
        this.encryption = encryption;
        this.aiService = aiService;
        this.pdfService = pdfService;
        this.auditService = auditService;
    }
    async create(userId, createReportDto) {
        console.log(`[ReportsService] Creating report for User: ${userId}`, createReportDto);
        const initialContent = createReportDto.content || '';
        const { keyId, encryptedData, iv, tag } = await this.encryption.encryptData({ content: initialContent }, userId);
        const packedData = Buffer.concat([
            Buffer.from(iv, 'base64'),
            Buffer.from(tag, 'base64'),
            encryptedData
        ]);
        const report = await this.prisma.report.create({
            data: {
                userId,
                clientId: createReportDto.clientId,
                sessionId: createReportDto.sessionId,
                title: createReportDto.title,
                reportType: createReportDto.reportType,
                status: createReportDto.status || client_1.ReportStatus.DRAFT,
                encryptedContent: packedData,
                encryptionKeyId: keyId,
                humanReviewConfirmed: createReportDto.humanReviewConfirmed || false,
            }
        });
        console.log(`[ReportsService] Report created successfully: ${report.id}`);
        await this.auditService.log({
            userId,
            action: client_2.AuditAction.CREATE,
            resourceType: 'REPORT',
            resourceId: report.id,
            details: `Creado informe: ${createReportDto.title} (Tipo: ${createReportDto.reportType})`
        });
        return report;
    }
    async findAll(userId) {
        console.log(`[ReportsService] Finding all reports for User: ${userId}`);
        const reports = await this.prisma.report.findMany({
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
        console.log(`[ReportsService] Found ${reports.length} reports`);
        return reports;
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
            if (report.encryptedContent && report.encryptedContent.length > 32) {
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
                else {
                    console.error(`Failed to decrypt report ${id}:`, result.error);
                    content = '(Error de desencriptación: Clave inválida o datos corruptos)';
                }
            }
            else {
                content = '(Sin contenido encriptado)';
            }
        }
        catch (error) {
            console.error('Error decrypting report:', error);
            content = `(Error procesando informe: ${error.message})`;
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
        if (updateReportDto.professionalSignature !== undefined)
            data.professionalSignature = updateReportDto.professionalSignature;
        if (updateReportDto.humanReviewConfirmed !== undefined)
            data.humanReviewConfirmed = updateReportDto.humanReviewConfirmed;
        if (updateReportDto.status) {
            data.status = updateReportDto.status;
            if (updateReportDto.status === client_1.ReportStatus.COMPLETED) {
                let isConfirmed = updateReportDto.humanReviewConfirmed === true || (report.humanReviewConfirmed === true && updateReportDto.humanReviewConfirmed !== false);
                if (report.reportType === client_1.ReportType.LEGAL) {
                    if (!isConfirmed) {
                        throw new common_1.BadRequestException('Els informes legal-forenses requereixen revisió humana obligatòria abans de finalitzar-se.');
                    }
                    if (updateReportDto.content) {
                        this.validateForensicContent(updateReportDto.content);
                    }
                }
                if (!isConfirmed) {
                    throw new common_1.BadRequestException('No se puede finalizar el informe sin validación humana confirmada/supervisada.');
                }
                const auditMeta = {
                    completedAt: new Date(),
                    completedByUserId: userId,
                    aiAssisted: report.aiGenerated,
                    aiModel: 'gpt-4o',
                    humanReviewConfirmed: true,
                    complianceChecked: true
                };
                const existingMeta = report.logMetadata || {};
                data.logMetadata = { ...existingMeta, ...auditMeta };
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
        const updatedReport = await this.prisma.report.update({
            where: { id },
            data
        });
        let detail = `Actualizado informe (ID: ${id})`;
        if (updateReportDto.status === client_1.ReportStatus.COMPLETED) {
            detail = `Finalizado informe (ID: ${id})`;
        }
        await this.auditService.log({
            userId,
            action: client_2.AuditAction.UPDATE,
            resourceType: 'REPORT',
            resourceId: id,
            details: detail
        });
        return updatedReport;
    }
    async remove(id, userId) {
        const result = await this.prisma.report.update({
            where: { id, userId },
            data: { status: 'DELETED' }
        });
        await this.auditService.log({
            userId,
            action: client_2.AuditAction.DELETE,
            resourceType: 'REPORT',
            resourceId: id,
            details: `Eliminado informe (ID: ${id})`
        });
        return result;
    }
    async generateDraft(userId, data) {
        console.log(`[ReportsService] Generating Draft for User: ${userId}, Client: ${data.clientId}, Sessions:`, data.sessionIds);
        const sessions = await this.prisma.session.findMany({
            where: {
                id: { in: data.sessionIds },
                userId
            },
            select: {
                startTime: true,
                encryptedNotes: true,
                encryptedTranscription: true,
                encryptionKeyId: true
            },
            orderBy: { startTime: 'asc' }
        });
        console.log(`[ReportsService] Found ${sessions.length} sessions`);
        if (!sessions.length) {
            throw new common_1.NotFoundException('No se encontraron sesiones para generar el informe.');
        }
        let notesSummary = "";
        let firstSessionNote = "";
        let totalCharCount = 0;
        for (let i = 0; i < sessions.length; i++) {
            const session = sessions[i];
            let sessionContent = "";
            if (session.encryptedNotes) {
                try {
                    const iv = session.encryptedNotes.subarray(0, 16).toString('base64');
                    const tag = session.encryptedNotes.subarray(16, 32).toString('base64');
                    const encryptedData = session.encryptedNotes.subarray(32);
                    const result = await this.encryption.decryptData({
                        encryptedData,
                        iv,
                        tag,
                        keyId: session.encryptionKeyId
                    });
                    if (result.success && result.data && result.data.notes) {
                        const noteText = result.data.notes;
                        sessionContent += `[Notas Clínicas]: ${noteText}\n`;
                        totalCharCount += noteText.length;
                        if (i === 0)
                            firstSessionNote = noteText;
                    }
                }
                catch (e) {
                    console.error("Failed to decrypt session note for draft", e);
                }
            }
            if (session.encryptedTranscription) {
                try {
                    const iv = session.encryptedTranscription.subarray(0, 16).toString('base64');
                    const tag = session.encryptedTranscription.subarray(16, 32).toString('base64');
                    const encryptedData = session.encryptedTranscription.subarray(32);
                    const result = await this.encryption.decryptData({
                        encryptedData,
                        iv,
                        tag,
                        keyId: session.encryptionKeyId
                    });
                    if (result.success && result.data && result.data.transcription) {
                        const trText = result.data.transcription;
                        sessionContent += `[Transcripción]: ${trText}\n`;
                        totalCharCount += trText.length;
                    }
                }
                catch (e) {
                    console.error("Failed to decrypt session transcription for draft", e);
                }
            }
            if (sessionContent) {
                notesSummary += `\n--- Sesión del ${session.startTime.toLocaleDateString()} ---\n${sessionContent}`;
            }
        }
        console.log(`[ReportsService] Notes Summary Length: ${notesSummary.length} chars (Total extracted: ${totalCharCount})`);
        const client = await this.prisma.client.findUnique({ where: { id: data.clientId } });
        let clientName = 'Paciente';
        if (client && client.encryptedPersonalData) {
            try {
                const iv = client.encryptedPersonalData.subarray(0, 16).toString('base64');
                const tag = client.encryptedPersonalData.subarray(16, 32).toString('base64');
                const encryptedData = client.encryptedPersonalData.subarray(32);
                const result = await this.encryption.decryptData({
                    encryptedData,
                    iv,
                    tag,
                    keyId: client.encryptionKeyId
                });
                if (result.success) {
                    clientName = `${result.data.firstName || ''} ${result.data.lastName || ''}`.trim();
                }
            }
            catch (e) {
                console.error("Failed to decrypt client name for AI draft", e);
            }
        }
        const period = `${sessions[0].startTime.toLocaleDateString()} - ${sessions[sessions.length - 1].startTime.toLocaleDateString()}`;
        if (totalCharCount < 200) {
            console.warn(`[ReportsService] Low content detected (${totalCharCount} chars). Injecting warning to AI.`);
            const lowContentWarning = " \n\n[SYSTEM WARNING]: The provided session data is extremely sparse (only a few sentences). DO NOT Hallucinate details. INSTEAD, structure the report saying that 'due to insufficient information, a complete analysis cannot be performed yet', and list only the very few objective facts available. Do not generate a full template if you don't have data.";
            data.additionalInstructions = (data.additionalInstructions || '') + lowContentWarning;
        }
        const config = psychological_reports_config_1.PSYCHOLOGICAL_REPORTS[data.reportType];
        if (!config) {
            throw new common_1.BadRequestException('Tipo de informe no válido');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { preferredLanguage: true }
        });
        console.log(`[ReportsService] Calling AI Service... Report Type: ${data.reportType}, Language: ${user?.preferredLanguage}`);
        const draftContent = await this.aiService.generateReportDraft({
            clientName,
            reportType: data.reportType,
            sections: config.sections,
            tone: config.tone,
            legalSensitivity: config.legalSensitivity,
            sessionCount: sessions.length,
            period,
            notesSummary,
            firstSessionNote: config.useFirstSession ? firstSessionNote : undefined,
            additionalInstructions: data.additionalInstructions,
            language: user?.preferredLanguage || 'es'
        });
        console.log(`[ReportsService] Draft generated. Length: ${draftContent.length}`);
        await this.auditService.log({
            userId,
            action: client_2.AuditAction.CREATE,
            resourceType: 'REPORT_DRAFT',
            details: `Generado borrador de informe ${data.reportType} con IA para Cliente ID: ${data.clientId}`
        });
        return { content: draftContent };
    }
    validateForensicContent(content) {
        const forbiddenPatterns = [
            /concloent/i,
            /definitivament/i,
            /causalitat directa/i,
            /innegablement/i,
            /la veritat és/i,
            /és culpable/i,
            /és innocent/i
        ];
        const violations = forbiddenPatterns.filter(pattern => pattern.test(content));
        if (violations.length > 0) {
            throw new common_1.BadRequestException(`El contingut conté expressions no permeses en informes forenses (violació de neutralitat): ${violations.join(', ')}`);
        }
    }
    async downloadPdf(id, userId) {
        const report = await this.findOne(id, userId);
        let clientName = "Paciente Confidencial";
        if (report.clientId) {
            const client = await this.prisma.client.findUnique({
                where: { id: report.clientId }
            });
            if (client && client.encryptedPersonalData) {
                try {
                    const iv = client.encryptedPersonalData.subarray(0, 16).toString('base64');
                    const tag = client.encryptedPersonalData.subarray(16, 32).toString('base64');
                    const encryptedData = client.encryptedPersonalData.subarray(32);
                    const result = await this.encryption.decryptData({
                        encryptedData,
                        iv,
                        tag,
                        keyId: client.encryptionKeyId
                    });
                    if (result.success) {
                        clientName = `${result.data.firstName} ${result.data.lastName}`;
                    }
                }
                catch (error) {
                    console.error('Error decrypting client data for PDF:', error);
                }
            }
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        const psychologistName = user ? `${user.firstName} ${user.lastName}` : 'Psicólogo';
        const professionalNumber = user?.professionalNumber || 'N/A';
        return this.pdfService.generateReportPdf({
            title: report.title,
            clientName: clientName,
            type: report.reportType,
            content: report.content,
            psychologistName,
            professionalNumber
        });
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService,
        ai_service_1.AiService,
        pdf_service_1.PdfService,
        audit_service_1.AuditService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map