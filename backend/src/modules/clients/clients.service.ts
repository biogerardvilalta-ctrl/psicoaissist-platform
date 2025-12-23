import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionService, EncryptedData } from '../encryption/encryption.service';
import { CreateClientDto, UpdateClientDto, ClientResponseDto, CreateClientEncryptedDto } from './dto/clients.dto';
import { UserRole, AuditAction } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

interface ClientPersonalData {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    emergencyContact?: string;
    diagnosis?: string;
    notes?: string;
    birthDate?: string;
}

@Injectable()
export class ClientsService {
    private readonly logger = new Logger(ClientsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly encryptionService: EncryptionService,
        private readonly auditService: AuditService,
    ) { }

    /**
     * Helper to pack EncryptedData into a single Buffer
     * Format: [IV (16 bytes)] [Tag (16 bytes)] [EncryptedData]
     */
    private packEncryptedData(data: EncryptedData): Buffer {
        const iv = Buffer.from(data.iv, 'base64'); // 16 bytes
        const tag = Buffer.from(data.tag, 'base64'); // 16 bytes
        const encrypted = data.encryptedData; // Buffer

        return Buffer.concat([iv, tag, encrypted]);
    }

    /**
     * Helper to unpack Buffer into EncryptedData
     */
    private unpackEncryptedData(buffer: Buffer, keyId: string): EncryptedData {
        // AES-GCM IV is usually 12 bytes, but EncryptionService uses 16 bytes randomBytes?
        // Let's check EncryptionService.encryptData:
        // const iv = crypto.randomBytes(16); -> Yes, 16 bytes.
        // const tag = cipher.getAuthTag(); -> GCM default tag length is 16 bytes.

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

    async create(userId: string, createClientDto: CreateClientDto | CreateClientEncryptedDto): Promise<ClientResponseDto> {
        try {
            let packedData: Buffer;
            let keyId: string;
            let personalData: ClientPersonalData;

            if ('encryptedData' in createClientDto) {
                // Client-side encryption flow
                packedData = Buffer.from(createClientDto.encryptedData, 'base64');
                keyId = createClientDto.keyId;

                // Verify we can decrypt it (and get data for response)
                const unpacked = this.unpackEncryptedData(packedData, keyId);
                const decryptResult = await this.encryptionService.decryptData<ClientPersonalData>(unpacked);

                if (!decryptResult.success || !decryptResult.data) {
                    throw new Error('Invalid encrypted data received');
                }
                personalData = decryptResult.data;
            } else {
                // Server-side encryption flow (Legacy/Fallback)
                personalData = {
                    firstName: createClientDto.firstName,
                    lastName: createClientDto.lastName,
                    email: createClientDto.email,
                    phone: createClientDto.phone,
                    emergencyContact: createClientDto.emergencyContact,
                    diagnosis: createClientDto.diagnosis,
                    notes: createClientDto.notes,
                    birthDate: createClientDto.birthDate,
                };

                const encrypted = await this.encryptionService.encryptData(personalData, userId);
                packedData = this.packEncryptedData(encrypted);
                keyId = encrypted.keyId;
            }

            // Determine owner of the client
            let targetUserId = userId;
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { managedProfessionals: true }
            });

            if (user?.role === UserRole.AGENDA_MANAGER) {
                if (!createClientDto.professionalId) {
                    throw new Error('Agenda Managers must specify a professionalId');
                }

                // Verify management permission
                const managedIds = user.managedProfessionals.map(u => u.id);
                if (!managedIds.includes(createClientDto.professionalId)) {
                    throw new Error('You are not authorized to manage this professional');
                }
                targetUserId = createClientDto.professionalId;
            }

            // Save to DB
            const client = await this.prisma.client.create({
                data: {
                    user: { connect: { id: targetUserId } },
                    encryptedPersonalData: packedData,
                    encryptionKeyId: keyId,
                    tags: createClientDto.tags || [],
                    riskLevel: createClientDto.riskLevel,
                    lastModifiedBy: userId,
                    sendEmailReminders: createClientDto.sendEmailReminders,
                    sendWhatsappReminders: createClientDto.sendWhatsappReminders,
                },
            });

            this.logger.log(`Client created for user ${userId}`);

            await this.auditService.log({
                userId,
                action: AuditAction.CREATE,
                resourceType: 'CLIENT',
                resourceId: client.id,
                details: `Registrado nuevo paciente (ID: ${client.id})`
            });

            // Build Response
            return {
                id: client.id,
                ...personalData,
                riskLevel: client.riskLevel,
                isActive: client.isActive,
                tags: client.tags,
                createdAt: client.createdAt,
                updatedAt: client.updatedAt,
                sendEmailReminders: client.sendEmailReminders,
                sendWhatsappReminders: client.sendWhatsappReminders,
            };
        } catch (error) {
            this.logger.error(`Error creating client: ${error.message}`);
            throw error;
        }
    }

    async findAll(userId: string, active: boolean = true, professionalId?: string): Promise<ClientResponseDto[]> {
        try {
            // Check user role first to determine scope
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { managedProfessionals: true }
            });

            if (!user) {
                throw new NotFoundException('Usuario no encontrado');
            }

            let targetUserIds: string[] = [userId];

            // Should we force active=true? Default is yes.

            if (user.role === UserRole.AGENDA_MANAGER) {
                // Agenda Manager sees clients of their managed professionals
                const managedIds = user.managedProfessionals.map(u => u.id);

                if (professionalId) {
                    // Filter by specific professional if requested and authorized
                    if (managedIds.includes(professionalId)) {
                        targetUserIds = [professionalId];
                    } else {
                        // Unauthorized request for non-managed pro, return empty or throw? 
                        // Let's return empty to stay safe.
                        return [];
                    }
                } else {
                    // Show ALL managed professionals' clients
                    targetUserIds = managedIds;
                }
            } else {
                // Professionals/Admins see their own clients (or all if admin? Assuming scoped to own for now)
                // If professionalId param passed by a Professional? Maybe ignored.
                targetUserIds = [userId];
            }

            const clients = await this.prisma.client.findMany({
                where: {
                    userId: { in: targetUserIds },
                    ...(active !== undefined ? { isActive: active } : {})
                },
                orderBy: { createdAt: 'desc' },
            });

            // Decrypt all (Note: This might be heavy for huge lists, but fine for individual psychologist loads)
            const decryptedClients = await Promise.all(
                clients.map(async (client) => {
                    try {
                        if (!client.encryptedPersonalData) return null;

                        const encryptedData = this.unpackEncryptedData(
                            client.encryptedPersonalData, // Prisma Bytes -> Buffer
                            client.encryptionKeyId
                        );

                        const result = await this.encryptionService.decryptData<ClientPersonalData>(encryptedData);

                        if (!result.success || !result.data) {
                            this.logger.warn(`Failed to decrypt client ${client.id}: ${result.error}`);
                            return null;
                        }

                        const personalData = result.data;

                        return {
                            id: client.id,
                            ...personalData,
                            riskLevel: client.riskLevel,
                            isActive: client.isActive,
                            tags: client.tags,
                            createdAt: client.createdAt,
                            updatedAt: client.updatedAt,
                            lastSessionAt: client.lastSessionAt,
                            sendEmailReminders: client.sendEmailReminders,
                            sendWhatsappReminders: client.sendWhatsappReminders,
                        };
                    } catch (e) {
                        this.logger.error(`Error processing client ${client.id}: ${e.message}`);
                        return null;
                    }
                })
            );

            // Filter out failed decryptions
            return decryptedClients.filter(c => c !== null) as ClientResponseDto[];
        } catch (error) {
            this.logger.error(`Error fetching clients: ${error.message}`);
            throw error;
        }
    }

    async findOne(userId: string, clientId: string): Promise<ClientResponseDto> {
        const client = await this.prisma.client.findFirst({
            where: { id: clientId, userId },
        });

        if (!client) {
            throw new NotFoundException('Cliente no encontrado');
        }

        const encryptedData = this.unpackEncryptedData(
            client.encryptedPersonalData,
            client.encryptionKeyId
        );

        const result = await this.encryptionService.decryptData<ClientPersonalData>(encryptedData);

        if (!result.success || !result.data) {
            throw new Error('Error al descifrar datos del cliente');
        }

        return {
            id: client.id,
            ...result.data,
            riskLevel: client.riskLevel,
            isActive: client.isActive,
            tags: client.tags,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
            lastSessionAt: client.lastSessionAt,
            sendEmailReminders: client.sendEmailReminders,
            sendWhatsappReminders: client.sendWhatsappReminders,
        };
    }

    async update(userId: string, clientId: string, updateClientDto: UpdateClientDto): Promise<ClientResponseDto> {
        const client = await this.prisma.client.findFirst({
            where: { id: clientId, userId },
        });

        if (!client) {
            throw new NotFoundException('Cliente no encontrado');
        }

        // Decrypt existing data to merge
        const encryptedData = this.unpackEncryptedData(
            client.encryptedPersonalData,
            client.encryptionKeyId
        );
        const result = await this.encryptionService.decryptData<ClientPersonalData>(encryptedData);
        if (!result.success || !result.data) {
            throw new Error('Error al descifrar datos para actualización');
        }
        const currentData = result.data;

        // Merge new data
        const newData: ClientPersonalData = {
            firstName: updateClientDto.firstName || currentData.firstName,
            lastName: updateClientDto.lastName || currentData.lastName,
            email: updateClientDto.email || currentData.email,
            phone: updateClientDto.phone || currentData.phone,
            emergencyContact: updateClientDto.emergencyContact || currentData.emergencyContact,
            diagnosis: updateClientDto.diagnosis || currentData.diagnosis,
            notes: updateClientDto.notes || currentData.notes,
            birthDate: updateClientDto.birthDate || currentData.birthDate,
        };

        // Re-encrypt
        const newEncrypted = await this.encryptionService.encryptData(newData, userId);
        const packedData = this.packEncryptedData(newEncrypted);

        const updatedClient = await this.prisma.client.update({
            where: { id: clientId },
            data: {
                encryptedPersonalData: packedData,
                encryptionKeyId: newEncrypted.keyId,
                tags: updateClientDto.tags ?? client.tags,
                riskLevel: updateClientDto.riskLevel ?? client.riskLevel,
                isActive: updateClientDto.isActive ?? client.isActive,
                lastModifiedBy: userId,
                sendEmailReminders: updateClientDto.sendEmailReminders ?? client.sendEmailReminders,
                sendWhatsappReminders: updateClientDto.sendWhatsappReminders ?? client.sendWhatsappReminders,
            },
        });

        await this.auditService.log({
            userId,
            action: AuditAction.UPDATE,
            resourceType: 'CLIENT',
            resourceId: updatedClient.id,
            details: `Actualizados datos de paciente (ID: ${updatedClient.id})`
        });

        return {
            id: updatedClient.id,
            ...newData,
            riskLevel: updatedClient.riskLevel,
            isActive: updatedClient.isActive,
            tags: updatedClient.tags,
            createdAt: updatedClient.createdAt,
            updatedAt: updatedClient.updatedAt,
            lastSessionAt: updatedClient.lastSessionAt,
            sendEmailReminders: updatedClient.sendEmailReminders,
            sendWhatsappReminders: updatedClient.sendWhatsappReminders,
        };
    }

    async remove(userId: string, clientId: string): Promise<void> {
        const client = await this.prisma.client.findFirst({
            where: { id: clientId, userId },
        });

        if (!client) {
            throw new NotFoundException('Cliente no encontrado');
        }

        // Soft delete
        await this.prisma.client.update({
            where: { id: clientId },
            data: {
                isActive: false,
                lastModifiedBy: userId,
            },
        });

        await this.auditService.log({
            userId,
            action: AuditAction.DELETE,
            resourceType: 'CLIENT',
            resourceId: clientId,
            details: `Archivado paciente (ID: ${clientId})`
        });
    }
}
