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
        const updatedSession = await this.prisma.session.update({
            where: { id },
            data: {
                startTime: updateSessionDto.startTime ? new Date(updateSessionDto.startTime) : undefined,
                endTime: updateSessionDto.endTime ? new Date(updateSessionDto.endTime) : undefined,
                status: updateSessionDto.status,
                encryptedNotes: encryptedNotesBuffer,
                encryptedTranscription: encryptedTranscriptionBuffer,
                encryptionKeyId: keyId,
                consentSigned: updateSessionDto.consentSigned,
                consentVersion: updateSessionDto.consentVersion,
                consentTimestamp: updateSessionDto.consentSigned ? new Date() : undefined,
                startedAt: updateSessionDto.status === sessions_dto_1.SessionStatus.IN_PROGRESS && session.status !== sessions_dto_1.SessionStatus.IN_PROGRESS ? new Date() : undefined,
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
        if (updateSessionDto.status === sessions_dto_1.SessionStatus.COMPLETED && notesToReturn) {
            try {
                const isMinor = updatedSession.isMinor;
                const fullText = (notesToReturn || '') + '\n\n' + (transcriptionToReturn || '');
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
            clientName: clientName,
            client: session.client,
            aiMetadata: session.aiMetadata,
            aiSuggestions: session.aiSuggestions,
            isMinor: session.isMinor
        };
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