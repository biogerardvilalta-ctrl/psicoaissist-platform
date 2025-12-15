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
let SessionsService = class SessionsService {
    constructor(prisma, encryption) {
        this.prisma = prisma;
        this.encryption = encryption;
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
        const session = await this.prisma.session.create({
            data: {
                userId,
                clientId: createSessionDto.clientId,
                startTime: new Date(createSessionDto.startTime),
                endTime: createSessionDto.endTime ? new Date(createSessionDto.endTime) : undefined,
                sessionType: createSessionDto.sessionType,
                status: sessions_dto_1.SessionStatus.SCHEDULED,
                encryptedNotes: encryptedNotesBuffer,
                encryptionKeyId: keyId,
            },
            include: {
                client: true,
            }
        });
        await this.prisma.client.update({
            where: { id: createSessionDto.clientId },
            data: { lastSessionAt: session.startTime }
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
    async findOne(id, userId) {
        const session = await this.prisma.session.findUnique({
            where: { id },
            include: { client: true },
        });
        if (!session || session.userId !== userId) {
            throw new common_1.NotFoundException('Session not found');
        }
        let decryptedNotes;
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
        return this.mapToDto(session, decryptedNotes);
    }
    async update(id, userId, updateSessionDto) {
        const session = await this.prisma.session.findUnique({ where: { id } });
        if (!session || session.userId !== userId) {
            throw new common_1.NotFoundException('Session not found');
        }
        let encryptedNotesBuffer = session.encryptedNotes;
        let keyId = session.encryptionKeyId;
        let notesToReturn = updateSessionDto.notes;
        if (updateSessionDto.notes !== undefined) {
            if (!updateSessionDto.notes) {
                encryptedNotesBuffer = null;
                keyId = null;
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
        const updatedSession = await this.prisma.session.update({
            where: { id },
            data: {
                startTime: updateSessionDto.startTime ? new Date(updateSessionDto.startTime) : undefined,
                endTime: updateSessionDto.endTime ? new Date(updateSessionDto.endTime) : undefined,
                status: updateSessionDto.status,
                encryptedNotes: encryptedNotesBuffer,
                encryptionKeyId: keyId
            },
            include: { client: true }
        });
        if (updateSessionDto.startTime) {
            await this.prisma.client.update({
                where: { id: updatedSession.clientId },
                data: { lastSessionAt: updatedSession.startTime }
            });
        }
        return this.mapToDto(updatedSession, notesToReturn);
    }
    async remove(id, userId) {
        const session = await this.prisma.session.findUnique({ where: { id } });
        if (!session || session.userId !== userId) {
            throw new common_1.NotFoundException('Session not found');
        }
        return this.prisma.session.delete({ where: { id } });
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
    async mapToDto(session, decryptedNotes) {
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
            clientName: clientName,
            client: session.client
        };
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map