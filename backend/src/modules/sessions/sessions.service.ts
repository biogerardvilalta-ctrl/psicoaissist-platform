
import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
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
        let targetUserId = userId;

        if (createSessionDto.professionalId) {
            // Verify if user is manager of this professional
            const manager = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { managedProfessionals: true }
            });

            const isManaged = manager?.managedProfessionals.some(p => p.id === createSessionDto.professionalId);

            if (!isManaged) {
                throw new ForbiddenException('You are not authorized to create sessions for this professional');
            }
            targetUserId = createSessionDto.professionalId;
        }

        // 1. Verify client exists and belongs to target user
        const client = await this.prisma.client.findFirst({
            where: { id: createSessionDto.clientId, userId: targetUserId },
        });

        if (!client) {
            throw new NotFoundException('Client not found');
        }

        // Encrypt notes
        let encryptedNotesBuffer: Buffer | undefined;
        let keyId: string | undefined;

        if (createSessionDto.notes) {
            const encrypted = await this.encryption.encryptData({ notes: createSessionDto.notes }, targetUserId);
            encryptedNotesBuffer = this.packEncryptedData(encrypted);
            keyId = encrypted.keyId;
        }

        // Fetch user preferences for default duration
        const user = await this.prisma.user.findUnique({
            where: { id: targetUserId },
            select: { defaultDuration: true }
        });
        const durationMinutes = user?.defaultDuration || 60;

        // 3. Create Session
        const startDate = new Date(createSessionDto.startTime);
        let endDate = createSessionDto.endTime ? new Date(createSessionDto.endTime) : undefined;

        if (!endDate) {
            endDate = new Date(startDate.getTime() + durationMinutes * 60000);
        }

        // 2. Check for Overlaps
        const conflictingSession = await this.prisma.session.findFirst({
            where: {
                userId: targetUserId,
                status: { not: SessionStatus.CANCELLED },
                startTime: { lt: endDate },
                endTime: { gt: startDate },
            }
        });

        if (conflictingSession) {
            throw new ConflictException('The professional already has a session scheduled for this time slot.');
        }

        const session = await this.prisma.session.create({
            data: {
                userId: targetUserId,
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

    async findAll(user: any, filters?: { clientId?: string; status?: SessionStatus; from?: string; to?: string; professionalId?: string }) {
        let targetUserIds: string[] = [user.id];

        if (user.role === 'AGENDA_MANAGER') {
            const manager = await this.prisma.user.findUnique({
                where: { id: user.id },
                include: { managedProfessionals: true }
            });
            const managedIds = manager?.managedProfessionals.map(p => p.id) || [];

            if (filters?.professionalId && filters.professionalId !== 'all') {
                if (managedIds.includes(filters.professionalId)) {
                    targetUserIds = [filters.professionalId];
                } else {
                    targetUserIds = []; // Access denied
                }
            } else {
                targetUserIds = managedIds;
            }
        } else {
            targetUserIds = [user.id];
        }

        const whereClause: any = {
            userId: { in: targetUserIds }
        };

        if (filters?.clientId) whereClause.clientId = filters.clientId;
        if (filters?.status && filters.status !== 'ALL' as any) whereClause.status = filters.status;

        if (filters?.from || filters?.to) {
            whereClause.startTime = {};
            if (filters.from) whereClause.startTime.gte = new Date(filters.from);
            if (filters.to) whereClause.startTime.lte = new Date(filters.to);
        }

        const sessions = await this.prisma.session.findMany({
            where: whereClause,
            include: {
                client: true, // Need name for display
            },
            orderBy: { startTime: 'desc' },
        });

        // Return without notes for list view
        return Promise.all(sessions.map(s => this.mapToDto(s, undefined)));
    }

    async findByDateRange(user: any, start: string, end: string, professionalId?: string) {
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new BadRequestException('Invalid date range');
        }

        let targetUserIds: string[] = [user.id];

        if (user.role === 'AGENDA_MANAGER') {
            const manager = await this.prisma.user.findUnique({
                where: { id: user.id },
                include: { managedProfessionals: true }
            });
            const managedIds = manager?.managedProfessionals.map(p => p.id) || [];

            if (professionalId && professionalId !== 'all') {
                if (managedIds.includes(professionalId)) {
                    targetUserIds = [professionalId];
                } else {
                    targetUserIds = [];
                }
            } else {
                targetUserIds = managedIds;
            }
        } else {
            targetUserIds = [user.id];
        }

        const sessions = await this.prisma.session.findMany({
            where: {
                userId: { in: targetUserIds },
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
            const diffSeconds = Math.round(diffMs / 1000);
            duration = diffSeconds > 0 ? diffSeconds : 0;
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
                const notesText = notesToReturn || '';
                const transText = transcriptionToReturn || '';

                // Fetch user language for analysis
                const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { preferredLanguage: true } });
                const userLang = user?.preferredLanguage || 'ca';

                const analysis = await this.aiService.generateSessionAnalysis(id, notesText, transText, isMinor, userLang);
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
            duration: session.duration,
            clientName: clientName,
            client: session.client,
            aiMetadata: session.aiMetadata,
        };
    }

    async getAvailability(userId: string, dateStr: string, professionalId?: string) {
        let targetUserId = userId;

        if (professionalId) {
            // Verify if user is manager of this professional
            const manager = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { managedProfessionals: true }
            });

            const isManaged = manager?.managedProfessionals.some(p => p.id === professionalId);

            // Only switch if managed, otherwise stick to userId (or throw? Stick to userId might be confusing, better throw or ignore)
            if (isManaged) {
                targetUserId = professionalId;
            }
        }

        // 1. Get User Config
        const user = await this.prisma.user.findUnique({
            where: { id: targetUserId },
            select: {
                workStartHour: true,
                workEndHour: true,
                defaultDuration: true,
                bufferTime: true,
                scheduleConfig: true
            }
        });

        if (!user) throw new Error('User not found');

        const { workStartHour, workEndHour, defaultDuration, bufferTime } = user;
        const totalSlotDuration = defaultDuration + bufferTime;

        // 2. Parse Date & Working Hours
        const dateOnly = dateStr.split('T')[0];
        const targetDate = new Date(dateOnly + 'T00:00:00'); // Ensure local midnight for calculation logic if needed, or consistent UTC. 
        // Better: new Date(dateStr) depends on string format.
        // If "2023-12-25", new Date("2023-12-25") is UTC midnight.
        // If "2023-12-25T10:00...", it attempts that time.

        // Let's rely on dateOnly comparison for holidays.

        // 2.1 Check Holidays
        const scheduleConfig = user.scheduleConfig as any;
        console.log(`[GetAvailability] Checking date: ${dateOnly} against config:`, JSON.stringify(scheduleConfig));

        if (scheduleConfig && scheduleConfig.holidays && Array.isArray(scheduleConfig.holidays)) {
            const isHoliday = scheduleConfig.holidays.some((h: string) => h === dateOnly);
            if (isHoliday) {
                console.log(`[GetAvailability] Date ${dateOnly} is a holiday.`);
                return { date: dateStr, slots: [] }; // No slots on holidays
            }
        }
        const [startH, startM] = workStartHour.split(':').map(Number);
        const [endH, endM] = workEndHour.split(':').map(Number);

        const workStart = new Date(targetDate);
        workStart.setHours(startH, startM, 0, 0);

        const workEnd = new Date(targetDate);
        workEnd.setHours(endH, endM, 0, 0);

        // 3. Get Existing Sessions for that day
        const dayStart = new Date(targetDate);
        const dayEnd = new Date(targetDate);
        dayEnd.setHours(23, 59, 59, 999);

        const sessions = await this.prisma.session.findMany({
            where: {
                userId: targetUserId,
                startTime: { gte: dayStart, lte: dayEnd },
                status: { notIn: ['CANCELLED'] } // Ignore cancelled
            },
            select: { startTime: true, endTime: true, duration: true }
        });

        // 3.1 Inject Blocked Blocks as Fake Sessions
        if (scheduleConfig && scheduleConfig.blockedBlocks && Array.isArray(scheduleConfig.blockedBlocks)) {
            scheduleConfig.blockedBlocks.forEach((block: any) => {
                if (block.date === dateOnly && block.start && block.end) {
                    const [sH, sM] = block.start.split(':').map(Number);
                    const [eH, eM] = block.end.split(':').map(Number);

                    const blockStart = new Date(targetDate);
                    blockStart.setHours(sH, sM, 0, 0);

                    const blockEnd = new Date(targetDate);
                    blockEnd.setHours(eH, eM, 0, 0);

                    // Add to sessions list so logic below collision checks against it
                    (sessions as any[]).push({
                        startTime: blockStart,
                        endTime: blockEnd,
                        duration: (blockEnd.getTime() - blockStart.getTime()) / 1000 // duration in seconds
                    });
                }
            });
        }

        // 4. Generate Slots
        const slots: string[] = [];
        let currentSlot = new Date(workStart);

        while (currentSlot.getTime() + (defaultDuration * 60000) <= workEnd.getTime()) {
            const slotEnd = new Date(currentSlot.getTime() + (defaultDuration * 60000));
            // Actual session interval we want to book

            // Check Collision
            const hasCollision = sessions.some(s => {
                const sStart = new Date(s.startTime);
                // Calculate sEnd if missing (though our fix ensures it's there for completed, others might rely on default)
                // Use stored duration if available, else default 60
                const sDuration = (s.duration && s.duration > 0) ? (s.duration / 60) : 60; // stored in seconds? No, we migrated 60 to 60s? 
                // Wait, in previous step we migrated duration to SECONDS. 
                // BUT "defaultDuration" in User is likely MINUTES (60).
                // Let's check schema: @default(60).
                // "duration" in Session is Session.duration (Seconds).

                let sEndTime = s.endTime ? new Date(s.endTime) : new Date(sStart.getTime() + 60 * 60000);

                // If we have accurate duration, use it
                if (s.duration) {
                    sEndTime = new Date(sStart.getTime() + s.duration * 1000);
                }

                // Add buffer to the EXISTING session? Or is buffer time added to the NEW slot?
                // "Tiempo entre sesiones". Usually means: Session A End + Buffer < Session B Start.
                // Or Session A Start > Session B End + Buffer.
                // Let's enforce the buffer *around* the new slot we are proposing?
                // Or assume existing sessions *includes* their buffer? 
                // Safer: Check if (NewSlotStart < ExistingEnd + Buffer) AND (NewSlotEnd + Buffer > ExistingStart)

                // Let's assume buffer is required AFTER every session.
                // So if I book 9:00-10:00. I am busy until 10:10.

                // So collision check:
                // Is there any overlap between [CurrentSlotStart, CurrentSlotEnd + Buffer] AND [ExistingStart, ExistingEnd + Buffer]?

                const sEndWithBuffer = new Date(sEndTime.getTime() + (bufferTime * 60000));

                // We define our proposed slot interval with buffer
                // Proposed: [currentSlot, slotEnd + buffer]
                const proposedEndWithBuffer = new Date(slotEnd.getTime() + (bufferTime * 60000));

                return (currentSlot < sEndWithBuffer && proposedEndWithBuffer > sStart);
            });

            if (!hasCollision) {
                // Format HH:MM
                const timeStr = currentSlot.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
                slots.push(timeStr);
            }

            // Move to next potential slot
            // option A: Fixed slots (9:00, 10:10, 11:20...)
            // option B: Every 30 mins? 
            // The prompt says "tener en cuenta la durada de la sesion y el tiempo entre sesiones"
            // Usually this implies Fixed Slots derived from start time + duration + buffer.
            currentSlot = new Date(currentSlot.getTime() + (totalSlotDuration * 60000));
        }

        return { date: dateStr, slots };
    }
}
