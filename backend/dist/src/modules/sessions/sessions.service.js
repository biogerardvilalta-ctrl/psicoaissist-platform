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
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const encryption_service_1 = require("../encryption/encryption.service");
const sessions_dto_1 = require("./dto/sessions.dto");
const ai_service_1 = require("../ai/ai.service");
const audit_service_1 = require("../audit/audit.service");
const client_1 = require("@prisma/client");
let SessionsService = class SessionsService {
    constructor(prisma, encryption, aiService, auditService) {
        this.prisma = prisma;
        this.encryption = encryption;
        this.aiService = aiService;
        this.auditService = auditService;
    }
    packEncryptedData(data) {
        const iv = Buffer.from(data.iv, 'base64');
        const tag = Buffer.from(data.tag, 'base64');
        return Buffer.concat([iv, tag, data.encryptedData]);
    }
    unpackEncryptedData(buffer, keyId) {
        const iv = buffer.subarray(0, 16).toString('base64');
        const tag = buffer.subarray(16, 32).toString('base64');
        const encryptedData = buffer.subarray(32);
        return { iv, tag, encryptedData, keyId };
    }
    async create(userId, createSessionDto) {
        const client = await this.prisma.client.findFirst({
            where: { id: createSessionDto.clientId, userId },
        });
        if (!client) {
            throw new common_1.NotFoundException('Client not found');
        }
        let encryptedNotesBuffer;
        let keyId;
        if (createSessionDto.notes) {
            const encrypted = await this.encryption.encryptData({ notes: createSessionDto.notes }, userId);
            encryptedNotesBuffer = this.packEncryptedData(encrypted);
            keyId = encrypted.keyId;
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { defaultDuration: true }
        });
        const durationMinutes = user?.defaultDuration || 60;
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
                duration: durationMinutes,
                sessionType: createSessionDto.sessionType,
                status: sessions_dto_1.SessionStatus.SCHEDULED,
                encryptedNotes: encryptedNotesBuffer,
                encryptionKeyId: keyId,
                isMinor: createSessionDto.isMinor || false,
            },
            include: {
                client: true,
            }
        });
        await this.prisma.client.update({
            where: { id: createSessionDto.clientId },
            data: { lastSessionAt: session.startTime }
        });
        await this.auditService.log({
            userId,
            action: client_1.AuditAction.CREATE,
            resourceType: 'SESSION',
            resourceId: session.id,
            details: `Programada sesión de tipo ${createSessionDto.sessionType} con cliente (ID: ${createSessionDto.clientId})`
        });
        return this.mapToDto(session, createSessionDto.notes);
    }
    async findAll(userId) {
        const sessions = await this.prisma.session.findMany({
            where: { userId },
            include: {
                client: true,
            },
            orderBy: { startTime: 'desc' },
        });
        return Promise.all(sessions.map(s => this.mapToDto(s, undefined)));
    }
    async findByDateRange(userId, start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new common_1.BadRequestException('Invalid date range');
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
    async findOne(id, userId) {
        const session = await this.prisma.session.findUnique({
            where: { id },
            include: { client: true },
        });
        if (!session || session.userId !== userId) {
            throw new common_1.NotFoundException('Session not found');
        }
        let decryptedNotes;
        let decryptedTranscription;
        if (session.encryptedNotes && session.encryptionKeyId) {
            try {
                const unpacked = this.unpackEncryptedData(session.encryptedNotes, session.encryptionKeyId);
                const result = await this.encryption.decryptData(unpacked);
                if (result.success && result.data) {
                    decryptedNotes = result.data.notes;
                }
            }
            catch (error) {
                console.error(`Failed to decrypt session ${id}`, error);
            }
        }
        if (session.encryptedTranscription && session.encryptionKeyId) {
            try {
                const unpacked = this.unpackEncryptedData(session.encryptedTranscription, session.encryptionKeyId);
                const result = await this.encryption.decryptData(unpacked);
                if (result.success && result.data) {
                    decryptedTranscription = result.data.transcription;
                }
            }
            catch (error) {
                console.error(`Failed to decrypt transcription for session ${id}`, error);
            }
        }
        return this.mapToDto(session, decryptedNotes, decryptedTranscription);
    }
    async update(id, userId, updateSessionDto) {
        const session = await this.prisma.session.findUnique({ where: { id } });
        if (!session || session.userId !== userId) {
            throw new common_1.NotFoundException('Session not found');
        }
        let encryptedNotesBuffer = session.encryptedNotes;
        let encryptedTranscriptionBuffer = session.encryptedTranscription;
        let keyId = session.encryptionKeyId;
        let notesToReturn = updateSessionDto.notes;
        let transcriptionToReturn = updateSessionDto.transcription;
        if (updateSessionDto.notes !== undefined) {
            if (!updateSessionDto.notes) {
                encryptedNotesBuffer = null;
            }
            else {
                const encrypted = await this.encryption.encryptData({ notes: updateSessionDto.notes }, userId);
                encryptedNotesBuffer = this.packEncryptedData(encrypted);
                keyId = encrypted.keyId;
            }
        }
        else if (session.encryptedNotes && session.encryptionKeyId) {
            try {
                const unpacked = this.unpackEncryptedData(session.encryptedNotes, session.encryptionKeyId);
                const result = await this.encryption.decryptData(unpacked);
                if (result.success)
                    notesToReturn = result.data.notes;
            }
            catch (e) { }
        }
        if (updateSessionDto.transcription !== undefined) {
            if (!updateSessionDto.transcription) {
                encryptedTranscriptionBuffer = null;
            }
            else {
                const encrypted = await this.encryption.encryptData({ transcription: updateSessionDto.transcription }, userId);
                encryptedTranscriptionBuffer = this.packEncryptedData(encrypted);
                keyId = encrypted.keyId;
            }
        }
        else if (session.encryptedTranscription && session.encryptionKeyId) {
            try {
                const unpacked = this.unpackEncryptedData(session.encryptedTranscription, session.encryptionKeyId);
                const result = await this.encryption.decryptData(unpacked);
                if (result.success)
                    transcriptionToReturn = result.data.transcription;
            }
            catch (e) { }
        }
        let aiMetadataToUpdate = session.aiMetadata || {};
        if (updateSessionDto.methodology !== undefined) {
            aiMetadataToUpdate = {
                ...aiMetadataToUpdate,
                manual_methodology: updateSessionDto.methodology
            };
        }
        let newStartTime = updateSessionDto.startTime ? new Date(updateSessionDto.startTime) : session.startTime;
        let newEndTime = updateSessionDto.endTime ? new Date(updateSessionDto.endTime) : session.endTime;
        if (updateSessionDto.status === sessions_dto_1.SessionStatus.IN_PROGRESS && session.status !== sessions_dto_1.SessionStatus.IN_PROGRESS) {
            newStartTime = new Date();
        }
        if (updateSessionDto.status === sessions_dto_1.SessionStatus.COMPLETED && session.status !== sessions_dto_1.SessionStatus.COMPLETED) {
            newEndTime = new Date();
        }
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
                duration: duration,
                status: updateSessionDto.status,
                encryptedNotes: encryptedNotesBuffer,
                encryptedTranscription: encryptedTranscriptionBuffer,
                encryptionKeyId: keyId,
                consentSigned: updateSessionDto.consentSigned,
                consentVersion: updateSessionDto.consentVersion,
                consentTimestamp: updateSessionDto.consentSigned ? new Date() : undefined,
                startedAt: updateSessionDto.status === sessions_dto_1.SessionStatus.IN_PROGRESS && session.status !== sessions_dto_1.SessionStatus.IN_PROGRESS ? newStartTime : undefined,
                isMinor: updateSessionDto.isMinor,
                aiMetadata: aiMetadataToUpdate
            },
            include: { client: true }
        });
        if (updateSessionDto.startTime) {
            await this.prisma.client.update({
                where: { id: updatedSession.clientId },
                data: { lastSessionAt: updatedSession.startTime }
            });
        }
        if (updateSessionDto.status === sessions_dto_1.SessionStatus.COMPLETED && (notesToReturn || transcriptionToReturn)) {
            try {
                const isMinor = updatedSession.isMinor;
                const notesText = notesToReturn || '';
                const transText = transcriptionToReturn || '';
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
                            manual_methodology: updateSessionDto.methodology || aiMetadataToUpdate.manual_methodology
                        },
                        aiSuggestions: analysis.clinicalFollowUpSupport.suggestions
                    },
                    include: { client: true }
                });
                return this.mapToDto(finalSession, notesToReturn, transcriptionToReturn);
            }
            catch (error) {
                console.error('AI Analysis failed', error);
            }
        }
        if (updateSessionDto.status) {
            const actionDetail = updateSessionDto.status === sessions_dto_1.SessionStatus.COMPLETED ? 'Completada' :
                updateSessionDto.status === sessions_dto_1.SessionStatus.CANCELLED ? 'Cancelada' : 'Actualizada';
            await this.auditService.log({
                userId,
                action: client_1.AuditAction.UPDATE,
                resourceType: 'SESSION',
                resourceId: id,
                details: `${actionDetail} sesión con cliente (ID: ${session.clientId})`
            });
        }
        return this.mapToDto(updatedSession, notesToReturn, transcriptionToReturn);
    }
    async remove(id, userId) {
        const session = await this.prisma.session.findUnique({ where: { id } });
        if (!session || session.userId !== userId) {
            throw new common_1.NotFoundException('Session not found');
        }
        await this.prisma.session.delete({ where: { id } });
        await this.auditService.log({
            userId,
            action: client_1.AuditAction.DELETE,
            resourceType: 'SESSION',
            resourceId: id,
            details: `Eliminada sesión (ID: ${id})`
        });
        return { success: true };
    }
    unpackClientData(buffer, keyId) {
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
    async mapToDto(session, decryptedNotes, decryptedTranscription) {
        let clientName = "Unknown";
        if (session.client && session.client.encryptedPersonalData && session.client.encryptionKeyId) {
            try {
                const encryptedData = this.unpackClientData(session.client.encryptedPersonalData, session.client.encryptionKeyId);
                const result = await this.encryption.decryptData(encryptedData);
                if (result.success && result.data) {
                    clientName = `${result.data.firstName} ${result.data.lastName}`;
                }
            }
            catch (e) {
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
    async getAvailability(userId, dateStr) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                workStartHour: true,
                workEndHour: true,
                defaultDuration: true,
                bufferTime: true,
                scheduleConfig: true
            }
        });
        if (!user)
            throw new Error('User not found');
        const { workStartHour, workEndHour, defaultDuration, bufferTime } = user;
        const totalSlotDuration = defaultDuration + bufferTime;
        const dateOnly = dateStr.split('T')[0];
        const targetDate = new Date(dateOnly + 'T00:00:00');
        const scheduleConfig = user.scheduleConfig;
        console.log(`[GetAvailability] Checking date: ${dateOnly} against config:`, JSON.stringify(scheduleConfig));
        if (scheduleConfig && scheduleConfig.holidays && Array.isArray(scheduleConfig.holidays)) {
            const isHoliday = scheduleConfig.holidays.some((h) => h === dateOnly);
            if (isHoliday) {
                console.log(`[GetAvailability] Date ${dateOnly} is a holiday.`);
                return { date: dateStr, slots: [] };
            }
        }
        const [startH, startM] = workStartHour.split(':').map(Number);
        const [endH, endM] = workEndHour.split(':').map(Number);
        const workStart = new Date(targetDate);
        workStart.setHours(startH, startM, 0, 0);
        const workEnd = new Date(targetDate);
        workEnd.setHours(endH, endM, 0, 0);
        const dayStart = new Date(targetDate);
        const dayEnd = new Date(targetDate);
        dayEnd.setHours(23, 59, 59, 999);
        const sessions = await this.prisma.session.findMany({
            where: {
                userId,
                startTime: { gte: dayStart, lte: dayEnd },
                status: { notIn: ['CANCELLED'] }
            },
            select: { startTime: true, endTime: true, duration: true }
        });
        if (scheduleConfig && scheduleConfig.blockedBlocks && Array.isArray(scheduleConfig.blockedBlocks)) {
            scheduleConfig.blockedBlocks.forEach((block) => {
                if (block.date === dateOnly && block.start && block.end) {
                    const [sH, sM] = block.start.split(':').map(Number);
                    const [eH, eM] = block.end.split(':').map(Number);
                    const blockStart = new Date(targetDate);
                    blockStart.setHours(sH, sM, 0, 0);
                    const blockEnd = new Date(targetDate);
                    blockEnd.setHours(eH, eM, 0, 0);
                    sessions.push({
                        startTime: blockStart,
                        endTime: blockEnd,
                        duration: (blockEnd.getTime() - blockStart.getTime()) / 1000
                    });
                }
            });
        }
        const slots = [];
        let currentSlot = new Date(workStart);
        while (currentSlot.getTime() + (defaultDuration * 60000) <= workEnd.getTime()) {
            const slotEnd = new Date(currentSlot.getTime() + (defaultDuration * 60000));
            const hasCollision = sessions.some(s => {
                const sStart = new Date(s.startTime);
                const sDuration = (s.duration && s.duration > 0) ? (s.duration / 60) : 60;
                let sEndTime = s.endTime ? new Date(s.endTime) : new Date(sStart.getTime() + 60 * 60000);
                if (s.duration) {
                    sEndTime = new Date(sStart.getTime() + s.duration * 1000);
                }
                const sEndWithBuffer = new Date(sEndTime.getTime() + (bufferTime * 60000));
                const proposedEndWithBuffer = new Date(slotEnd.getTime() + (bufferTime * 60000));
                return (currentSlot < sEndWithBuffer && proposedEndWithBuffer > sStart);
            });
            if (!hasCollision) {
                const timeStr = currentSlot.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
                slots.push(timeStr);
            }
            currentSlot = new Date(currentSlot.getTime() + (totalSlotDuration * 60000));
        }
        return { date: dateStr, slots };
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService,
        ai_service_1.AiService,
        audit_service_1.AuditService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map