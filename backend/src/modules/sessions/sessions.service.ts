
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';
import { CreateSessionDto, UpdateSessionDto, SessionStatus, SessionType } from './dto/sessions.dto';
import { AiService } from '../ai/ai.service';

interface EncryptedSessionData {
    notes?: string;
}

import { AuditService } from '../audit/audit.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class SessionsService {
    constructor(
        private prisma: PrismaService,
        private encryption: EncryptionService,
        private aiService: AiService,
        private auditService: AuditService,
    ) { }

    // ... (keep private methods)



    private packEncryptedData(data: { iv: string; tag: string; encryptedData: Buffer }): Buffer {
        const iv = Buffer.from(data.iv, 'base64'); // 16 bytes
        const tag = Buffer.from(data.tag, 'base64'); // 16 bytes
        return Buffer.concat([iv, tag, data.encryptedData]);
    }

    private unpackEncryptedData(buffer: Buffer, keyId: string) {
        const iv = buffer.subarray(0, 16).toString('base64');
        const tag = buffer.subarray(16, 32).toString('base64');
        const encryptedData = buffer.subarray(32);
        return { iv, tag, encryptedData, keyId };
    }

    async create(userId: string, createSessionDto: CreateSessionDto) {
        // 1. Verify client exists and belongs to user
        const client = await this.prisma.client.findFirst({
            where: { id: createSessionDto.clientId, userId },
        });

        if (!client) {
            throw new NotFoundException('Client not found');
        }

        // Encrypt notes
        let encryptedNotesBuffer: Buffer | undefined;
        let keyId: string | undefined;

        if (createSessionDto.notes) {
            const encrypted = await this.encryption.encryptData({ notes: createSessionDto.notes }, userId);
            encryptedNotesBuffer = this.packEncryptedData(encrypted);
            keyId = encrypted.keyId;
        }

        // Fetch user preferences for default duration
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { defaultDuration: true }
        });
        const durationMinutes = user?.defaultDuration || 60;

        // 3. Create Session
        const startDate = new Date(createSessionDto.startTime);
        let endDate = createSessionDto.endTime ? new Date(createSessionDto.endTime) : undefined;

        if (!endDate) {
            endDate = new Date(startDate.getTime() + durationMinutes * 60000);
        }

        const session = await this.prisma.session.create({
            data: {
                userId,
                clientId: createSessionDto.clientId,
                startTime: startDate,
                endTime: endDate,
                duration: durationMinutes, // Save calculated duration
                sessionType: createSessionDto.sessionType,
                status: SessionStatus.SCHEDULED,
                encryptedNotes: encryptedNotesBuffer,
                encryptionKeyId: keyId,
                isMinor: createSessionDto.isMinor || false,
            },
            include: {
                client: true,
            }
        });

        // Update Client Last Session
        await this.prisma.client.update({
            where: { id: createSessionDto.clientId },
            data: { lastSessionAt: session.startTime }
        });

        // Log Activity
        await this.auditService.log({
            userId,
            action: AuditAction.CREATE,
            resourceType: 'SESSION',
            resourceId: session.id,
            details: `Programada sesión de tipo ${createSessionDto.sessionType} con cliente (ID: ${createSessionDto.clientId})`
        });

        return this.mapToDto(session, createSessionDto.notes);
    }

    async findAll(userId: string) {
        const sessions = await this.prisma.session.findMany({
            where: { userId },
            include: {
                client: true, // Need name for display
            },
            orderBy: { startTime: 'desc' },
        });

        // Return without notes for list view
        return Promise.all(sessions.map(s => this.mapToDto(s, undefined)));
    }

    async findByDateRange(userId: string, start: string, end: string) {
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new BadRequestException('Invalid date range');
        }

        const sessions = await this.prisma.session.findMany({
            where: {
                userId,
                startTime: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                client: true,
            },
            orderBy: { startTime: 'asc' },
        });

        return Promise.all(sessions.map(s => this.mapToDto(s, undefined)));
    }

    async findOne(id: string, userId: string) {
        const session = await this.prisma.session.findUnique({
            where: { id },
            include: { client: true },
        });

        if (!session || session.userId !== userId) {
            throw new NotFoundException('Session not found');
        }

        let decryptedNotes: string | undefined;
        let decryptedTranscription: string | undefined;

        if (session.encryptedNotes && session.encryptionKeyId) {
            try {
                const unpacked = this.unpackEncryptedData(session.encryptedNotes, session.encryptionKeyId);
                const result = await this.encryption.decryptData<{ notes: string }>(unpacked);
                if (result.success && result.data) {
                    decryptedNotes = result.data.notes;
                }
            } catch (error) {
                console.error(`Failed to decrypt session ${id}`, error);
            }
        }

        if (session.encryptedTranscription && session.encryptionKeyId) {
            try {
                const unpacked = this.unpackEncryptedData(session.encryptedTranscription, session.encryptionKeyId);
                const result = await this.encryption.decryptData<{ transcription: string }>(unpacked);
                if (result.success && result.data) {
                    decryptedTranscription = result.data.transcription;
                }
            } catch (error) {
                console.error(`Failed to decrypt transcription for session ${id}`, error);
            }
        }

        return this.mapToDto(session, decryptedNotes, decryptedTranscription);
    }

    async update(id: string, userId: string, updateSessionDto: UpdateSessionDto) {
        const session = await this.prisma.session.findUnique({ where: { id } });
        if (!session || session.userId !== userId) {
            throw new NotFoundException('Session not found');
        }

        let encryptedNotesBuffer = session.encryptedNotes;
        let encryptedTranscriptionBuffer = session.encryptedTranscription;
        let keyId = session.encryptionKeyId;

        let notesToReturn = updateSessionDto.notes;
        let transcriptionToReturn = updateSessionDto.transcription;

        // Handle Notes Encryption
        if (updateSessionDto.notes !== undefined) {
            if (!updateSessionDto.notes) {
                encryptedNotesBuffer = null;
                // Don't null keyId yet if transcription exists
            } else {
                const encrypted = await this.encryption.encryptData({ notes: updateSessionDto.notes }, userId);
                encryptedNotesBuffer = this.packEncryptedData(encrypted);
                keyId = encrypted.keyId; // Update keyId
            }
        } else if (session.encryptedNotes && session.encryptionKeyId) {
            try {
                const unpacked = this.unpackEncryptedData(session.encryptedNotes, session.encryptionKeyId);
                const result = await this.encryption.decryptData<{ notes: string }>(unpacked);
                if (result.success) notesToReturn = result.data.notes;
            } catch (e) { }
        }

        // Handle Transcription Encryption
        if (updateSessionDto.transcription !== undefined) {
            if (!updateSessionDto.transcription) {
                encryptedTranscriptionBuffer = null;
            } else {
                const encrypted = await this.encryption.encryptData({ transcription: updateSessionDto.transcription }, userId);
                encryptedTranscriptionBuffer = this.packEncryptedData(encrypted);
                keyId = encrypted.keyId; // Update keyId
            }
        } else if (session.encryptedTranscription && session.encryptionKeyId) {
            // Keep existing transcription decrypt for return
            try {
                const unpacked = this.unpackEncryptedData(session.encryptedTranscription, session.encryptionKeyId);
                const result = await this.encryption.decryptData<{ transcription: string }>(unpacked);
                if (result.success) transcriptionToReturn = result.data.transcription;
            } catch (e) { }
        }

        // Handle Methodology (Store in AI Metadata)
        let aiMetadataToUpdate: any = session.aiMetadata || {};
        if (updateSessionDto.methodology !== undefined) {
            aiMetadataToUpdate = {
                ...aiMetadataToUpdate,
                manual_methodology: updateSessionDto.methodology
            };
        }

        // Update timestamps based on status transitions
        let newStartTime = updateSessionDto.startTime ? new Date(updateSessionDto.startTime) : session.startTime;
        let newEndTime = updateSessionDto.endTime ? new Date(updateSessionDto.endTime) : session.endTime;

        if (updateSessionDto.status === SessionStatus.IN_PROGRESS && session.status !== SessionStatus.IN_PROGRESS) {
            newStartTime = new Date();
        }

        if (updateSessionDto.status === SessionStatus.COMPLETED && session.status !== SessionStatus.COMPLETED) {
            newEndTime = new Date();
        }

        // Recalculate duration if we have both times
        let duration = session.duration;
        if (newStartTime && newEndTime) {
            const diffMs = newEndTime.getTime() - newStartTime.getTime();
            const diffMins = Math.round(diffMs / 60000);
            duration = diffMins > 0 ? diffMins : 0;
        }

        const updatedSession = await this.prisma.session.update({
            where: { id },
            data: {
                startTime: newStartTime,
                endTime: newEndTime,
                duration: duration, // Update duration
                status: updateSessionDto.status,
                encryptedNotes: encryptedNotesBuffer,
                encryptedTranscription: encryptedTranscriptionBuffer,
                encryptionKeyId: keyId,
                // GDPR Consent updates
                consentSigned: updateSessionDto.consentSigned,
                consentVersion: updateSessionDto.consentVersion,
                consentTimestamp: updateSessionDto.consentSigned ? new Date() : undefined,
                startedAt: updateSessionDto.status === SessionStatus.IN_PROGRESS && session.status !== SessionStatus.IN_PROGRESS ? newStartTime : undefined,
                isMinor: updateSessionDto.isMinor,
                aiMetadata: aiMetadataToUpdate
            },
            include: { client: true }
        });

        // Update Client Last Session if start time changed
        if (updateSessionDto.startTime) {
            await this.prisma.client.update({
                where: { id: updatedSession.clientId },
                data: { lastSessionAt: updatedSession.startTime }
            });
        }

        // Trigger AI Analysis if completed
        if (updateSessionDto.status === SessionStatus.COMPLETED && (notesToReturn || transcriptionToReturn)) {
            try {
                // Run in background (fire and forget pattern for response speed, but awaited here for simplicity in MVP)
                // In production, might want to use a job queue.
                const isMinor = updatedSession.isMinor;
                // Combine notes and transcription for analysis if both exist? Or just notes?
                // For now, let's assume 'notesToReturn' is what the AI analyzes. 
                // However, user might want to analyze the transcription. 
                // Let's pass 'notesToReturn' + 'transcriptionToReturn' combined?
                // Current AI Service expects string.
                const fullText = `
[NOTES]:
${notesToReturn || ''}

[TRANSCRIPTION]:
${transcriptionToReturn || ''}
`;

                const analysis = await this.aiService.generateSessionAnalysis(id, fullText, isMinor);
                const finalSession = await this.prisma.session.update({
                    where: { id },
                    data: {
                        aiMetadata: {
                            summary: analysis.summary,
                            emotionalElements: analysis.emotionalElements,
                            narrativeIndicators: analysis.narrativeIndicators,
                            orientativeObservations: analysis.orientativeObservations,
                            clinicalFollowUpSupport: analysis.clinicalFollowUpSupport,
                            discurs_pacient: analysis.discurs_pacient,
                            temes_emergents_sessio: analysis.temes_emergents_sessio,
                            diagnostic_final: analysis.diagnostic_final,
                            disclaimer: analysis.disclaimer,
                            audit_session: analysis.audit_session,
                            clinical_report_text: analysis.clinical_report_text,
                            manual_methodology: updateSessionDto.methodology || aiMetadataToUpdate.manual_methodology // ensure persisting methodology
                        },
                        aiSuggestions: analysis.clinicalFollowUpSupport.suggestions as any
                    },
                    include: { client: true }
                });

                // Use the session with AI data for response
                return this.mapToDto(finalSession, notesToReturn, transcriptionToReturn);
            } catch (error) {
                console.error('AI Analysis failed', error);
                // Don't fail the request if AI fails
            }
        }

        // Log cancellation or completion specifically
        if (updateSessionDto.status) {
            const actionDetail = updateSessionDto.status === SessionStatus.COMPLETED ? 'Completada' :
                updateSessionDto.status === SessionStatus.CANCELLED ? 'Cancelada' : 'Actualizada';

            await this.auditService.log({
                userId,
                action: AuditAction.UPDATE,
                resourceType: 'SESSION',
                resourceId: id,
                details: `${actionDetail} sesión con cliente (ID: ${session.clientId})`
            });
        }

        return this.mapToDto(updatedSession, notesToReturn, transcriptionToReturn);
    }

    async remove(id: string, userId: string) {
        // Standard remove
        const session = await this.prisma.session.findUnique({ where: { id } });
        if (!session || session.userId !== userId) {
            throw new NotFoundException('Session not found');
        }
        await this.prisma.session.delete({ where: { id } });

        await this.auditService.log({
            userId,
            action: AuditAction.DELETE,
            resourceType: 'SESSION',
            resourceId: id,
            details: `Eliminada sesión (ID: ${id})`
        });

        return { success: true };
    }

    // --- Helpers ---

    private unpackClientData(buffer: Buffer, keyId: string): { iv: string; tag: string; encryptedData: Buffer; keyId: string } {
        const iv = buffer.subarray(0, 16);
        const tag = buffer.subarray(16, 32);
        const encrypted = buffer.subarray(32);

        return {
            iv: iv.toString('base64'),
            tag: tag.toString('base64'),
            encryptedData: encrypted,
            keyId: keyId,
        };
    }

    private async mapToDto(session: any, decryptedNotes?: string, decryptedTranscription?: string) {
        let clientName = "Unknown";

        if (session.client && session.client.encryptedPersonalData && session.client.encryptionKeyId) {
            try {
                const encryptedData = this.unpackClientData(
                    session.client.encryptedPersonalData,
                    session.client.encryptionKeyId
                );

                // We define the minimal interface we expect
                interface ClientData { firstName: string; lastName: string; }

                const result = await this.encryption.decryptData<ClientData>(encryptedData);
                if (result.success && result.data) {
                    clientName = `${result.data.firstName} ${result.data.lastName}`;
                }
            } catch (e) {
                console.error(`Failed to decrypt client name for session ${session.id}`, e);
            }
        }

        return {
            id: session.id,
            clientId: session.clientId,
            userId: session.userId,
            startTime: session.startTime,
            endTime: session.endTime,
            status: session.status,
            sessionType: session.sessionType,
            notes: decryptedNotes,
            transcription: decryptedTranscription,
            methodology: session.aiMetadata?.manual_methodology,
            clientName: clientName,
            client: session.client,
            aiMetadata: session.aiMetadata,
            aiSuggestions: session.aiSuggestions,
            isMinor: session.isMinor
        };
    }
}
