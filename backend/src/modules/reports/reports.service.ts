import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReportDto, UpdateReportDto } from './dto/reports.dto';
import { EncryptionService } from '../encryption/encryption.service';
import { AiService } from '../ai/ai.service';
import { ReportStatus, ReportType } from '@prisma/client';
import { PSYCHOLOGICAL_REPORTS } from '../../config/psychological-reports.config';

import { PdfService } from './pdf.service';
import { WordService } from './word.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '@prisma/client';
import { UsageLimitsService } from '../payments/usage-limits.service';
import * as archiver from 'archiver';

@Injectable()
export class ReportsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly encryption: EncryptionService,
        private readonly aiService: AiService,
        private readonly pdfService: PdfService,
        private readonly wordService: WordService,
        private readonly auditService: AuditService,
        private readonly usageLimitsService: UsageLimitsService,
    ) { }

    async create(userId: string, createReportDto: CreateReportDto) {
        // Enforce Plan Limits
        await this.usageLimitsService.checkReportsLimit(userId);

        console.log(`[ReportsService] Creating report for User: ${userId}`, createReportDto);
        // Prepare content for encryption
        const initialContent = createReportDto.content || '';

        // Encrypt content using user's active key
        // Note: In a real flow we get the keyId from EncryptionService
        const { keyId, encryptedData, iv, tag } = await this.encryption.encryptData(
            { content: initialContent },
            userId
        );

        // Combine IV + Tag + Data for storage
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
                status: createReportDto.status || ReportStatus.DRAFT,
                encryptedContent: packedData,
                encryptionKeyId: keyId,
                humanReviewConfirmed: createReportDto.humanReviewConfirmed || false,
            }
        });
        console.log(`[ReportsService] Report created successfully: ${report.id}`);

        await this.auditService.log({
            userId,
            action: AuditAction.CREATE,
            resourceType: 'REPORT',
            resourceId: report.id,
            details: `Creado informe: ${createReportDto.title} (Tipo: ${createReportDto.reportType})`
        });

        return report;
    }

    async findAll(userId: string) {
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

    async findOne(id: string, userId: string) {
        const report = await this.prisma.report.findFirst({
            where: { id, userId }
        });

        if (!report) {
            throw new NotFoundException('Informe no encontrado');
        }

        // Decrypt content
        let content = '';
        try {
            if (report.encryptedContent && report.encryptedContent.length > 32) {
                const iv = report.encryptedContent.subarray(0, 16).toString('base64');
                const tag = report.encryptedContent.subarray(16, 32).toString('base64');
                const encryptedData = report.encryptedContent.subarray(32);

                const result = await this.encryption.decryptData<{ content: string }>({
                    encryptedData,
                    iv,
                    tag,
                    keyId: report.encryptionKeyId
                });

                if (result.success) {
                    content = result.data.content;
                } else {
                    console.error(`Failed to decrypt report ${id}:`, result.error);
                    content = '(Error de desencriptación: Clave inválida o datos corruptos)';
                }
            } else {
                content = '(Sin contenido encriptado)';
            }
        } catch (error) {
            console.error('Error decrypting report:', error);
            content = `(Error procesando informe: ${error.message})`;
        }

        return { ...report, content };
    }

    async update(id: string, userId: string, updateReportDto: UpdateReportDto) {
        const report = await this.prisma.report.findFirst({
            where: { id, userId }
        });

        if (!report) {
            throw new NotFoundException('Informe no encontrado');
        }

        const data: any = {};
        if (updateReportDto.title) data.title = updateReportDto.title;
        if (updateReportDto.professionalSignature !== undefined) data.professionalSignature = updateReportDto.professionalSignature;
        if (updateReportDto.humanReviewConfirmed !== undefined) data.humanReviewConfirmed = updateReportDto.humanReviewConfirmed;

        if (updateReportDto.status) {
            data.status = updateReportDto.status;
            if (updateReportDto.status === ReportStatus.COMPLETED) {
                // Validation: Cannot complete without human review
                let isConfirmed = updateReportDto.humanReviewConfirmed === true || ((report as any).humanReviewConfirmed === true && updateReportDto.humanReviewConfirmed !== false);

                // STRICT: Forensic reports require explicit confirmation
                if (report.reportType === ReportType.LEGAL) {
                    if (!isConfirmed) {
                        throw new BadRequestException('Els informes legal-forenses requereixen revisió humana obligatòria abans de finalitzar-se.');
                    }

                    // STRICT: Semantic content validation
                    if (updateReportDto.content) {
                        this.validateForensicContent(updateReportDto.content);
                    }
                }

                if (!isConfirmed) {
                    throw new BadRequestException('No se puede finalizar el informe sin validación humana confirmada/supervisada.');
                }

                // Add Audit Metadata on completion
                const auditMeta = {
                    completedAt: new Date(),
                    completedByUserId: userId,
                    aiAssisted: report.aiGenerated,
                    aiModel: 'gpt-4o', // or current model
                    humanReviewConfirmed: true,
                    complianceChecked: true
                };

                // Merge into existing logMetadata or create new
                const existingMeta = (report.logMetadata as any) || {};
                data.logMetadata = { ...existingMeta, ...auditMeta };

                data.completedAt = new Date();
            }
        }

        if (updateReportDto.content !== undefined) {
            const { keyId, encryptedData, iv, tag } = await this.encryption.encryptData(
                { content: updateReportDto.content },
                userId
            );

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

        // Log specific status changes or general update
        let detail = `Actualizado informe (ID: ${id})`;
        if (updateReportDto.status === ReportStatus.COMPLETED) {
            detail = `Finalizado informe (ID: ${id})`;
        }

        await this.auditService.log({
            userId,
            action: AuditAction.UPDATE,
            resourceType: 'REPORT',
            resourceId: id,
            details: detail
        });

        return updatedReport;
    }

    async remove(id: string, userId: string) {
        // Soft delete
        const result = await this.prisma.report.update({
            where: { id, userId },
            data: { status: 'DELETED' }
        });

        await this.auditService.log({
            userId,
            action: AuditAction.DELETE,
            resourceType: 'REPORT',
            resourceId: id,
            details: `Eliminado informe (ID: ${id})`
        });

        return result;
    }

    async generateDraft(userId: string, data: any) { // Type as GenerateReportDraftDto
        // Enforce Plan Limits (Check for Reports Count or Fair Use)
        await this.usageLimitsService.checkReportsLimit(userId);

        console.log(`[ReportsService] Generating Draft for User: ${userId}, Client: ${data.clientId}, Sessions:`, data.sessionIds);

        // 1. Fetch sessions
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
            throw new NotFoundException('No se encontraron sesiones para generar el informe.');
        }

        // 2. Decrypt notes and aggregate
        let notesSummary = "";
        let firstSessionNote = "";
        let totalCharCount = 0;

        for (let i = 0; i < sessions.length; i++) {
            const session = sessions[i];
            let sessionContent = "";

            // Decrypt Notes
            if (session.encryptedNotes) {
                try {
                    const iv = session.encryptedNotes.subarray(0, 16).toString('base64');
                    const tag = session.encryptedNotes.subarray(16, 32).toString('base64');
                    const encryptedData = session.encryptedNotes.subarray(32);

                    const result = await this.encryption.decryptData<{ notes: string }>({
                        encryptedData,
                        iv,
                        tag,
                        keyId: session.encryptionKeyId
                    });

                    if (result.success && result.data && result.data.notes) {
                        const noteText = result.data.notes;
                        sessionContent += `[Notas Clínicas]: ${noteText}\n`;
                        totalCharCount += noteText.length;

                        // Capture first session note for "Reason for Consultation" context
                        if (i === 0) firstSessionNote = noteText;
                    }
                } catch (e) {
                    console.error("Failed to decrypt session note for draft", e);
                }
            }

            // Decrypt Transcription
            if (session.encryptedTranscription) {
                try {
                    const iv = session.encryptedTranscription.subarray(0, 16).toString('base64');
                    const tag = session.encryptedTranscription.subarray(16, 32).toString('base64');
                    const encryptedData = session.encryptedTranscription.subarray(32);

                    const result = await this.encryption.decryptData<{ transcription: string }>({
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
                } catch (e) {
                    console.error("Failed to decrypt session transcription for draft", e);
                }
            }

            if (sessionContent) {
                notesSummary += `\n--- Sesión del ${session.startTime.toLocaleDateString()} ---\n${sessionContent}`;
            }
        }

        console.log(`[ReportsService] Notes Summary Length: ${notesSummary.length} chars (Total extracted: ${totalCharCount})`);

        // 3. Call AI Service
        const client = await this.prisma.client.findUnique({ where: { id: data.clientId } });
        let clientName = 'Paciente';

        // Decrypt Client Name
        if (client && client.encryptedPersonalData) {
            try {
                const iv = client.encryptedPersonalData.subarray(0, 16).toString('base64');
                const tag = client.encryptedPersonalData.subarray(16, 32).toString('base64');
                const encryptedData = client.encryptedPersonalData.subarray(32);

                const result = await this.encryption.decryptData<{ firstName: string; lastName: string }>({
                    encryptedData,
                    iv,
                    tag,
                    keyId: client.encryptionKeyId
                });

                if (result.success) {
                    clientName = `${result.data.firstName || ''} ${result.data.lastName || ''}`.trim();
                }
            } catch (e) {
                console.error("Failed to decrypt client name for AI draft", e);
            }
        }

        const period = `${sessions[0].startTime.toLocaleDateString()} - ${sessions[sessions.length - 1].startTime.toLocaleDateString()}`;

        // WARN: Check for low content
        if (totalCharCount < 200) {
            console.warn(`[ReportsService] Low content detected (${totalCharCount} chars). Injecting warning to AI.`);
            const lowContentWarning = " \n\n[SYSTEM WARNING]: The provided session data is extremely sparse (only a few sentences). DO NOT Hallucinate details. INSTEAD, structure the report saying that 'due to insufficient information, a complete analysis cannot be performed yet', and list only the very few objective facts available. Do not generate a full template if you don't have data.";
            data.additionalInstructions = (data.additionalInstructions || '') + lowContentWarning;
        }

        // Call AI Service
        const config = PSYCHOLOGICAL_REPORTS[data.reportType];

        if (!config) {
            throw new BadRequestException('Tipo de informe no válido');
        }

        // Fetch user language preference
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
            language: user?.preferredLanguage || 'es' // Pass user language
        });

        console.log(`[ReportsService] Draft generated. Length: ${draftContent.length}`);

        await this.auditService.log({
            userId,
            action: AuditAction.CREATE, // Virtual creation
            resourceType: 'REPORT_DRAFT',
            details: `Generado borrador de informe ${data.reportType} con IA para Cliente ID: ${data.clientId}`
        });

        return { content: draftContent };
    }

    private validateForensicContent(content: string) {
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
            throw new BadRequestException(`El contingut conté expressions no permeses en informes forenses (violació de neutralitat): ${violations.join(', ')}`);
        }
    }

    async downloadPdf(id: string, userId: string): Promise<Buffer> {
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

                    const result = await this.encryption.decryptData<{ firstName: string; lastName: string }>({
                        encryptedData,
                        iv,
                        tag,
                        keyId: client.encryptionKeyId
                    });

                    if (result.success) {
                        clientName = `${result.data.firstName} ${result.data.lastName}`;
                    }
                } catch (error) {
                    console.error('Error decrypting client data for PDF:', error);
                }
            }
        }

        // Fetch Psychologist (User) details
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
            professionalNumber,
            branding: (user as any)?.brandingConfig || {}
        });
    }

    async downloadDocx(id: string, userId: string): Promise<Buffer> {
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

                    const result = await this.encryption.decryptData<{ firstName: string; lastName: string }>({
                        encryptedData,
                        iv,
                        tag,
                        keyId: client.encryptionKeyId
                    });

                    if (result.success) {
                        clientName = `${result.data.firstName} ${result.data.lastName}`;
                    }
                } catch (error) {
                    console.error('Error decrypting client data for Word:', error);
                }
            }
        }

        // Fetch Psychologist (User) details
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        const psychologistName = user ? `${user.firstName} ${user.lastName}` : 'Psicólogo';
        const professionalNumber = user?.professionalNumber || 'N/A';

        return this.wordService.generateReportDocx({
            title: report.title,
            clientName: clientName,
            type: report.reportType,
            content: report.content,
            psychologistName,
            professionalNumber,
            branding: (user as any)?.brandingConfig || {}
        });
    }

    async exportAllPdfs(userId: string): Promise<any> { // Returns a stream or buffer, handled by controller
        const reports = await this.findAll(userId);

        if (!reports.length) {
            throw new NotFoundException('No hay informes para exportar.');
        }

        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        // We will collect buffers here, but archiver usually pipes to a writable stream.
        // Since we want to return a buffer or stream to the controller to send to client:
        // Option 1: Pass the Response object to this service (bad practice usually)
        // Option 2: Collect chunks into a buffer (easiest for small-medium concurrent usage)

        const chunks: Buffer[] = [];

        return new Promise((resolve, reject) => {
            archive.on('data', (chunk) => chunks.push(chunk));
            archive.on('error', (err) => reject(err));
            archive.on('end', () => {
                const resultBuffer = Buffer.concat(chunks);
                resolve(resultBuffer);
            });

            (async () => {
                try {
                    for (const report of reports) {
                        try {
                            // We reuse downloadPdf. 
                            // Optimization: findAll fetches partial data? 
                            // downloadPdf fetches 'findOne' which decrypts. 
                            // It might be slightly inefficient to re-fetch but ensures logic consistency (decryption, etc).
                            const pdfBuffer = await this.downloadPdf(report.id, userId);
                            const filename = `informe-${report.id.substring(0, 8)}.pdf`;
                            // Or better: sanitize title
                            // const sanitizedTitle = report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                            // const filename = `${sanitizedTitle}-${report.id.substring(0,8)}.pdf`;

                            archive.append(pdfBuffer, { name: filename });
                        } catch (e) {
                            console.error(`Failed to generate PDF for report ${report.id} in bulk export`, e);
                            // Skip or add error text file? Skip properly.
                        }
                    }
                    await archive.finalize();
                } catch (e) {
                    reject(e);
                }
            })();
        });
    }
}
