
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';
import { CreateSessionDto, UpdateSessionDto, SessionStatus, SessionType } from './dto/sessions.dto';

interface EncryptedSessionData {
    notes?: string;
}

@Injectable()
export class SessionsService {
    constructor(
        private prisma: PrismaService,
        private encryption: EncryptionService,
    ) { }

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

        // 3. Create Session
        const session = await this.prisma.session.create({
            data: {
                userId,
                clientId: createSessionDto.clientId,
                startTime: new Date(createSessionDto.startTime),
                endTime: createSessionDto.endTime ? new Date(createSessionDto.endTime) : undefined,
                sessionType: createSessionDto.sessionType,
                status: SessionStatus.SCHEDULED,
                encryptedNotes: encryptedNotesBuffer,
                encryptionKeyId: keyId,
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

        return this.mapToDto(session, decryptedNotes);
    }

    async update(id: string, userId: string, updateSessionDto: UpdateSessionDto) {
        const session = await this.prisma.session.findUnique({ where: { id } });
        if (!session || session.userId !== userId) {
            throw new NotFoundException('Session not found');
        }

        let encryptedNotesBuffer = session.encryptedNotes;
        let keyId = session.encryptionKeyId;
        let notesToReturn = updateSessionDto.notes;

        if (updateSessionDto.notes !== undefined) {
            // If empty string, clear notes
            if (!updateSessionDto.notes) {
                encryptedNotesBuffer = null;
                keyId = null; // Ideally keep keyId or not? Schema allows null.
            } else {
                const encrypted = await this.encryption.encryptData({ notes: updateSessionDto.notes }, userId);
                encryptedNotesBuffer = this.packEncryptedData(encrypted);
                keyId = encrypted.keyId;
            }
        } else if (session.encryptedNotes && session.encryptionKeyId) {
            // Keep existing notes, decrypt for return
            try {
                const unpacked = this.unpackEncryptedData(session.encryptedNotes, session.encryptionKeyId);
                const result = await this.encryption.decryptData<{ notes: string }>(unpacked);
                if (result.success) notesToReturn = result.data.notes;
            } catch (e) { }
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

        // Update Client Last Session if start time changed
        if (updateSessionDto.startTime) {
            await this.prisma.client.update({
                where: { id: updatedSession.clientId },
                data: { lastSessionAt: updatedSession.startTime }
            });
        }

        return this.mapToDto(updatedSession, notesToReturn);
    }

    async remove(id: string, userId: string) {
        // Standard remove
        const session = await this.prisma.session.findUnique({ where: { id } });
        if (!session || session.userId !== userId) {
            throw new NotFoundException('Session not found');
        }
        return this.prisma.session.delete({ where: { id } });
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

    private async mapToDto(session: any, decryptedNotes?: string) {
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
            clientName: clientName,
            client: session.client
        };
    }
}
