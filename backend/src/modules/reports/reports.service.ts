import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReportDto, UpdateReportDto } from './dto/reports.dto';
import { EncryptionService } from '../encryption/encryption.service';
import { AiService } from '../ai/ai.service';
import { ReportStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly encryption: EncryptionService,
        private readonly aiService: AiService
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
                status: ReportStatus.DRAFT,
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
            }
        } catch (error) {
            console.error('Error decrypting report:', error);
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
        if (updateReportDto.status) {
            data.status = updateReportDto.status;
            if (updateReportDto.status === ReportStatus.COMPLETED) {
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
                } catch (e) {
                    console.error("Failed to decrypt session note for draft", e);
                }
            }
        }

        // 3. Call AI Service
        // Fetch client name for context
        const client = await this.prisma.client.findUnique({ where: { id: data.clientId } });
        // Note: Name is encrypted in Client, might need to ask ClientsService or EncryptionService to decrypt it.
        // For now, simpler placeholder or assume we have it if we used ClientsService. 
        // Let's use "Paciente" generic or try decrypt if we have access.
        // But Clients naming is complex (encryptedPersonalData). 
        // Let's pass empty name and let Frontend fill it? Or better, just generic.

        const period = `${sessions[0].startTime.toLocaleDateString()} - ${sessions[sessions.length - 1].startTime.toLocaleDateString()}`;

        // Call AI Service
        const draftContent = await this.aiService.generateReportDraft({
            clientName: "Paciente", // Placeholder until client decryption is solved or passed from frontend
            reportType: data.reportType,
            sessionCount: sessions.length,
            period,
            notesSummary
        });

        return { content: draftContent };
    }
}
