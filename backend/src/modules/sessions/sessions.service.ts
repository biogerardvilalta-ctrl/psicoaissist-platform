
import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';
import { CreateSessionDto, UpdateSessionDto, SessionStatus, SessionType } from './dto/sessions.dto';
import { AiService } from '../ai/ai.service';
import { UsageLimitsService } from '../payments/usage-limits.service';
import { PLAN_FEATURES } from '../payments/plan-features';

interface EncryptedSessionData {
    notes?: string;
}

import { AuditService } from '../audit/audit.service';
import { AuditAction } from '@prisma/client';

import { GoogleService } from '../google/google.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { randomBytes } from 'crypto';

@Injectable()
export class SessionsService {
    constructor(
        private prisma: PrismaService,
        private encryption: EncryptionService,
        private aiService: AiService,
        private auditService: AuditService,
        private googleService: GoogleService,
        private usageLimitsService: UsageLimitsService,
        private notificationsService: NotificationsService,
        private emailService: EmailService,
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

        // Enforce Plan Limits (Transcription/Session Minutes)
        // REMOVED: User can create sessions even if transcription limit is reached.
        // await this.usageLimitsService.checkTranscriptionLimit(targetUserId, durationMinutes / 60);

        // 3. Create Session
        const startDate = new Date(createSessionDto.startTime);
        let endDate = createSessionDto.endTime ? new Date(createSessionDto.endTime) : undefined;

        if (!endDate) {
            endDate = new Date(startDate.getTime() + durationMinutes * 60000);
        }

        // 2. Check for Overlaps (exclude CANCELLED and COMPLETED sessions)
        const conflictingSession = await this.prisma.session.findFirst({
            where: {
                userId: targetUserId,
                status: { notIn: [SessionStatus.CANCELLED, SessionStatus.COMPLETED] },
                startTime: { lt: endDate },
                endTime: { gt: startDate },
            }
        });

        if (conflictingSession) {
            throw new ConflictException('El profesional ya tiene una sesión agendada para este horario.');
        }

        const session = await this.prisma.session.create({
            data: {
                userId: targetUserId,
                clientId: createSessionDto.clientId,
                startTime: startDate,
                endTime: endDate,
                duration: durationMinutes * 60, // Save calculated duration in SECONDS
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

        // Sync to Google Calendar
        console.log(`[SessionsService] Starting Google Sync for Session ${session.id}`);
        try {
            const googleEvent = await this.googleService.insertEvent(targetUserId, {
                summary: `Sesión PsicoAI`,
                description: `Sesión de ${createSessionDto.sessionType}. Gestionado por PsycoAI.`,
                start: { dateTime: session.startTime.toISOString() },
                end: { dateTime: session.endTime.toISOString() },
            });

            console.log(`[SessionsService] insertEvent returned:`, googleEvent);

            if (googleEvent && googleEvent.id) {
                console.log(`[SessionsService] Updating local session with Google ID...`);
                await this.prisma.session.update({
                    where: { id: session.id },
                    data: { googleEventId: googleEvent.id } as any
                });
                console.log(`[SessionsService] Update complete.`);
            } else {
                console.log(`[SessionsService] Google ID not found in response.`);
            }
        } catch (error) {
            console.error('[SessionsService] Failed to sync new session to Google Calendar', error);
        }

        try {
            if (userId !== targetUserId) {
                // It's a manager acting
                const manager = await this.prisma.user.findUnique({ where: { id: userId } });
                const managerName = manager ? `${manager.firstName} ${manager.lastName}` : 'Tu gestor';

                await this.notificationsService.create({
                    userId: targetUserId,
                    title: '📅 Nueva Sesión Agendada',
                    message: `${managerName} ha agendado una nueva sesión para el ${session.startTime.toLocaleString()}`,
                    type: 'INFO',
                    data: { sessionId: session.id }
                });
            }
        } catch (e) { console.error('Failed to send session notification', e); }

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

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        if (session.userId !== userId) {
            // Check if manager
            const manager = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { managedProfessionals: true }
            });
            const isManaged = manager?.managedProfessionals.some(p => p.id === session.userId);

            if (!isManaged) {
                throw new NotFoundException('Session not found');
            }
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

        let targetUserId = userId;
        let isManagerAction = false;

        if (!session) {
            throw new NotFoundException(`Session with ID ${id} not found in database (DEBUG PROBE)`);
        }

        if (session.userId !== userId) {
            console.log(`[DEBUG] Update: User ${userId} is not owner. Checking manager status for owner ${session.userId}...`);

            // Check if manager using direct DB query
            const isManagedCount = await this.prisma.user.count({
                where: {
                    id: userId,
                    managedProfessionals: { some: { id: session.userId } }
                }
            });

            console.log(`[DEBUG] Update: isManagedCount: ${isManagedCount}`);

            if (isManagedCount === 0) {
                throw new ForbiddenException(`Access Denied: User ${userId} is not manager of ${session.userId}`);
            }

            // Constraint: Manager cannot edit COMPLETED session
            if (session.status === SessionStatus.COMPLETED) {
                throw new ForbiddenException('Los gestores no pueden editar sesiones completadas.');
            }

            isManagerAction = true;
            targetUserId = session.userId;
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
                const encrypted = await this.encryption.encryptData({ notes: updateSessionDto.notes }, targetUserId);
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
                const encrypted = await this.encryption.encryptData({ transcription: updateSessionDto.transcription }, targetUserId);
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
                const user = await this.prisma.user.findUnique({
                    where: { id: userId },
                    select: {
                        preferredLanguage: true,
                        subscription: true // Fetch subscription to check plan features
                    }
                });

                // Check if user has Advanced Analytics feature
                const planFeatures = user?.subscription ? PLAN_FEATURES[user.subscription.planType] : null;
                const hasAdvancedAnalytics = planFeatures?.advancedAnalytics || false;

                if (!hasAdvancedAnalytics) {
                    console.log(`[SessionsService] Skipping AI Analysis for user ${userId} (Plan: ${user?.subscription?.planType}) - feature missing.`);
                    // We return early, skipping the AI update. 
                    // Session is already updated with status COMPLETED above.
                    return this.mapToDto(updatedSession, notesToReturn, transcriptionToReturn);
                }

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
                            sentimentScore: analysis.sentimentScore,
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

        // Sync to Google Calendar
        // Warning: ignoring potential type error on googleEventId until restart
        if ((updatedSession as any).googleEventId && (updateSessionDto.startTime || updateSessionDto.endTime || updateSessionDto.status === SessionStatus.CANCELLED)) {
            try {
                if (updateSessionDto.status === SessionStatus.CANCELLED) {
                    await this.googleService.deleteEvent(updatedSession.userId, (updatedSession as any).googleEventId);
                    await this.prisma.session.update({ where: { id }, data: { googleEventId: null } as any });
                } else {
                    await this.googleService.updateEvent(updatedSession.userId, (updatedSession as any).googleEventId, {
                        start: { dateTime: updatedSession.startTime.toISOString() },
                        end: { dateTime: updatedSession.endTime.toISOString() },
                    });
                }
            } catch (e) { console.error('Failed to update Google Event', e); }
        }

        if (isManagerAction) {
            try {
                const manager = await this.prisma.user.findUnique({ where: { id: userId } });
                const managerName = manager ? `${manager.firstName} ${manager.lastName}` : 'Tu gestor';

                let message = `${managerName} ha actualizado una de tus sesiones.`;
                if (updateSessionDto.status === SessionStatus.CANCELLED) {
                    message = `${managerName} ha cancelado una de tus sesiones.`;
                }

                await this.notificationsService.create({
                    userId: session.userId,
                    title: '✏️ Sesión Actualizada',
                    message: message,
                    type: 'INFO',
                    data: { sessionId: id }
                });
            } catch (e) { console.error('Failed to send session update notification', e); }
        }


        return this.mapToDto(updatedSession, notesToReturn, transcriptionToReturn);
    }

    async remove(id: string, userId: string) {
        const session = await this.prisma.session.findUnique({ where: { id } });

        let isManagerAction = false;

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        if (session.userId !== userId) {
            // Check if manager
            const manager = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { managedProfessionals: true }
            });
            const isManaged = manager?.managedProfessionals.some(p => p.id === session.userId);

            if (!isManaged) {
                throw new NotFoundException('Session not found');
            }

            // Constraint: Manager cannot delete COMPLETED session
            if (session.status === SessionStatus.COMPLETED) {
                throw new ForbiddenException('Los gestores no pueden eliminar sesiones completadas.');
            }
            isManagerAction = true;
        }

        // Sync Google Calendar Delete
        if ((session as any).googleEventId) {
            try {
                await this.googleService.deleteEvent(session.userId, (session as any).googleEventId);
            } catch (e) {
                console.error('Failed to delete Google Event', e);
            }
        }

        await this.prisma.session.delete({ where: { id } });

        await this.auditService.log({
            userId,
            action: AuditAction.DELETE,
            resourceType: 'SESSION',
            resourceId: id,
            details: `Eliminada sesión (ID: ${id})`
        });

        if (isManagerAction) {
            try {
                const manager = await this.prisma.user.findUnique({ where: { id: userId } });
                const managerName = manager ? `${manager.firstName} ${manager.lastName}` : 'Tu gestor';

                await this.notificationsService.create({
                    userId: session.userId,
                    title: '🗑️ Sesión Eliminada',
                    message: `${managerName} ha eliminado una de tus sesiones.`,
                    type: 'WARNING',
                    data: { sessionId: id }
                });
            } catch (e) { console.error('Failed to send session delete notification', e); }
        }

        return { success: true };
    }

    async createVideoCall(id: string, userId: string): Promise<{ token: string; link: string }> {
        const session = await this.prisma.session.findUnique({
            where: { id },
            include: { client: true, user: true },
        });

        if (!session) throw new NotFoundException('Session not found');

        // Simple auth check for now (owner or manager logic could be reused but keeping it simple)
        if (session.userId !== userId) {
            const manager = await this.prisma.user.findUnique({ where: { id: userId }, include: { managedProfessionals: true } });
            const isManaged = manager?.managedProfessionals.some(p => p.id === session.userId);
            if (!isManaged) throw new ForbiddenException('Access denied');
        }

        let token = session.videoCallToken;
        if (!token) {
            token = randomBytes(32).toString('hex');
            await this.prisma.session.update({
                where: { id },
                data: { videoCallToken: token },
            });
        }

        const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/video-call/${token}`;

        if (session.client && session.client.encryptedPersonalData && session.client.encryptionKeyId) {
            try {
                const unpacked = this.unpackClientData(session.client.encryptedPersonalData, session.client.encryptionKeyId);
                const result = await this.encryption.decryptData<{ firstName: string; lastName: string; email: string }>(unpacked);

                if (result.success && result.data && result.data.email) {
                    const professionalName = `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim() || 'Su psicólogo';
                    const clientName = `${result.data.firstName} ${result.data.lastName}`;

                    await this.emailService.sendVideoCallInvitation(
                        result.data.email,
                        clientName,
                        professionalName,
                        link,
                        session.user.preferredLanguage
                    );
                }
            } catch (e) {
                console.error('Failed to send video invitation email', e);
            }
        }

        return { token, link };
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
            videoCallToken: session.videoCallToken,
        };
    }

    async getAvailability(userId: string, dateStr: string, professionalId?: string) {
        let targetUserId = userId;

        if (professionalId && professionalId !== 'all') {
            // Verify if user is manager of this professional (or group)
            const manager = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { managedProfessionals: true }
            });

            const isManaged = manager?.managedProfessionals.some(p => p.id === professionalId);

            if (isManaged) {
                targetUserId = professionalId;
            }
        }

        // Check if target is a Group
        const targetUser = await this.prisma.user.findUnique({
            where: { id: targetUserId },
            include: { groupMembers: true }
        });

        if (!targetUser) throw new NotFoundException('User not found');

        // --- GROUP LOGIC ---
        if (targetUser.role === 'PROFESSIONAL_GROUP' && targetUser.groupMembers.length > 0) {
            // 1. Get availability for each member
            const memberAvailabilities = await Promise.all(
                targetUser.groupMembers.map(member =>
                    this.getSingleUserAvailability(member.id, dateStr)
                        .then(res => res.slots)
                        .catch(() => [])
                )
            );

            // 2. Intersection of slots (Available only if ALL members are available)
            // Start with the first member's slots, and filter down
            let finalSlots = memberAvailabilities[0] || [];

            for (let i = 1; i < memberAvailabilities.length; i++) {
                const currentMemberSlots = new Set(memberAvailabilities[i]);
                finalSlots = finalSlots.filter(slot => currentMemberSlots.has(slot));
            }

            // Remove duplicates just in case (though intersection shouldn't introduce them if inputs are unique)
            finalSlots = Array.from(new Set(finalSlots)).sort();

            // 3. Filter out slots already booked by the Group itself
            // (Note: Intersection ensures members are free. But we must also check valid Group bookings 
            // if the system allows booking the 'Group User' directly, which we are doing now)

            const groupSessions = await this.prisma.session.findMany({
                where: {
                    userId: targetUserId,
                    startTime: {
                        gte: new Date(dateStr + 'T00:00:00'),
                        lte: new Date(dateStr + 'T23:59:59')
                    },
                    status: { not: SessionStatus.CANCELLED }
                }
            });

            // Filter out slots that collide with Group Sessions
            finalSlots = finalSlots.filter(slot => {
                const [h, m] = slot.split(':').map(Number);
                const slotTime = new Date(dateStr + 'T00:00:00');
                slotTime.setHours(h, m, 0, 0);
                const slotEnd = new Date(slotTime.getTime() + 60 * 60000);

                return !groupSessions.some(gs => {
                    const gsStart = new Date(gs.startTime);
                    const gsEnd = gs.endTime ? new Date(gs.endTime) : new Date(gsStart.getTime() + 60 * 60000);
                    return (slotTime < gsEnd && slotEnd > gsStart);
                });
            });

            return { date: dateStr, slots: finalSlots };
        }

        // --- SINGLE USER LOGIC ---
        return this.getSingleUserAvailability(targetUserId, dateStr);
    }

    private async getSingleUserAvailability(targetUserId: string, dateStr: string) {
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

        // 2. Parse Date
        const dateOnly = dateStr.split('T')[0];
        const targetDate = new Date(dateOnly + 'T00:00:00');

        // 2.1 Check Holidays
        const scheduleConfig = user.scheduleConfig as any;
        if (scheduleConfig && scheduleConfig.holidays && Array.isArray(scheduleConfig.holidays)) {
            const isHoliday = scheduleConfig.holidays.some((h: string) => h === dateOnly);
            if (isHoliday) {
                return { date: dateStr, slots: [] };
            }
        }
        const [startH, startM] = workStartHour.split(':').map(Number);
        const [endH, endM] = workEndHour.split(':').map(Number);

        const workStart = new Date(targetDate);
        workStart.setHours(startH, startM, 0, 0);

        const workEnd = new Date(targetDate);
        workEnd.setHours(endH, endM, 0, 0);

        // 3. Get Existing Sessions
        const dayStart = new Date(targetDate);
        const dayEnd = new Date(targetDate);
        dayEnd.setHours(23, 59, 59, 999);

        const sessions = await this.prisma.session.findMany({
            where: {
                userId: targetUserId,
                startTime: { gte: dayStart, lte: dayEnd },
                status: { notIn: ['CANCELLED'] }
            },
            select: { startTime: true, endTime: true, duration: true }
        });

        // 3.1 Inject Blocked Blocks
        if (scheduleConfig && scheduleConfig.blockedBlocks && Array.isArray(scheduleConfig.blockedBlocks)) {
            scheduleConfig.blockedBlocks.forEach((block: any) => {
                if (block.date === dateOnly && block.start && block.end) {
                    const [sH, sM] = block.start.split(':').map(Number);
                    const [eH, eM] = block.end.split(':').map(Number);
                    const blockStart = new Date(targetDate);
                    blockStart.setHours(sH, sM, 0, 0);
                    const blockEnd = new Date(targetDate);
                    blockEnd.setHours(eH, eM, 0, 0);
                    (sessions as any[]).push({
                        startTime: blockStart,
                        endTime: blockEnd,
                        duration: (blockEnd.getTime() - blockStart.getTime()) / 1000
                    });
                }
            });
        }

        // 4. Generate Slots
        const slots: string[] = [];
        let currentSlot = new Date(workStart);

        while (currentSlot.getTime() + (defaultDuration * 60000) <= workEnd.getTime()) {
            const slotEnd = new Date(currentSlot.getTime() + (defaultDuration * 60000));
            const hasCollision = sessions.some(s => {
                const sStart = new Date(s.startTime);
                let sEndTime = s.endTime ? new Date(s.endTime) : new Date(sStart.getTime() + 60 * 60000);
                if (s.duration) sEndTime = new Date(sStart.getTime() + s.duration * 1000);

                const sEndWithBuffer = new Date(sEndTime.getTime() + (bufferTime * 60000));
                const proposedEndWithBuffer = new Date(slotEnd.getTime() + (bufferTime * 60000));

                return (currentSlot < sEndWithBuffer && proposedEndWithBuffer > sStart);
            });

            if (!hasCollision) {
                const timeStr = currentSlot.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
                slots.push(timeStr);
            }

            // Increment by Duration + Buffer to create the gap
            currentSlot = new Date(currentSlot.getTime() + ((defaultDuration + bufferTime) * 60000));
        }

        return { date: dateStr, slots };
    }
}
