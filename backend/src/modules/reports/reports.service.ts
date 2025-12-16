import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReportDto, UpdateReportDto } from './dto/reports.dto';
import { EncryptionService } from '../encryption/encryption.service';
import { AiService } from '../ai/ai.service';
import { ReportStatus } from '@prisma/client';

import { PdfService } from './pdf.service';

@Injectable()
export class ReportsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly encryption: EncryptionService,
        private readonly aiService: AiService,
        private readonly pdfService: PdfService
    ) { }

    async create(userId: string, createReportDto: CreateReportDto) {
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

        return this.prisma.report.create({
            data: {
                userId,
                clientId: createReportDto.clientId,
                sessionId: createReportDto.sessionId,
                title: createReportDto.title,
                reportType: createReportDto.reportType,
                status: createReportDto.status || ReportStatus.DRAFT,
                encryptedContent: packedData,
                encryptionKeyId: keyId,
            }
        });
    }

    async findAll(userId: string) {
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
                const isConfirmed = updateReportDto.humanReviewConfirmed === true || ((report as any).humanReviewConfirmed === true && updateReportDto.humanReviewConfirmed !== false);

                if (!isConfirmed) {
                    throw new BadRequestException('No se puede finalizar el informe sin validación humana confirmada/supervisada.');
                }
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

        return this.prisma.report.update({
            where: { id },
            data
        });
    }

    async remove(id: string, userId: string) {
        // Soft delete
        return this.prisma.report.update({
            where: { id, userId },
            data: { status: 'DELETED' }
        });
    }

    async generateDraft(userId: string, data: any) { // Type as GenerateReportDraftDto
        // 1. Fetch sessions
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
            throw new NotFoundException('No se encontraron sesiones para generar el informe.');
        }

        // 2. Decrypt notes and aggregate
        let notesSummary = "";
        let firstSessionNote = "";

        for (let i = 0; i < sessions.length; i++) {
            const session = sessions[i];
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
                        notesSummary += `[${session.startTime.toLocaleDateString()}] ${noteText}\n`;

                        // Capture first session note for "Reason for Consultation" context
                        if (i === 0) {
                            firstSessionNote = noteText;
                        }
                    }
                } catch (e) {
                    console.error("Failed to decrypt session note for draft", e);
                }
            }
        }

        // 3. Call AI Service
        const client = await this.prisma.client.findUnique({ where: { id: data.clientId } });
        const period = `${sessions[0].startTime.toLocaleDateString()} - ${sessions[sessions.length - 1].startTime.toLocaleDateString()}`;

        // Call AI Service
        const draftContent = await this.aiService.generateReportDraft({
            clientName: "Paciente",
            reportType: data.reportType,
            sessionCount: sessions.length,
            period,
            notesSummary,
            firstSessionNote // Pass these specific notes
        });
        return { content: draftContent };
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

        return this.pdfService.generateReportPdf({
            title: report.title,
            clientName: clientName,
            type: report.reportType,
            content: report.content
        });
    }
}
