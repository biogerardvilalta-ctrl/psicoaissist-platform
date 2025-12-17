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
var ClientsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const encryption_service_1 = require("../encryption/encryption.service");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../audit/audit.service");
let ClientsService = ClientsService_1 = class ClientsService {
    constructor(prisma, encryptionService, auditService) {
        this.prisma = prisma;
        this.encryptionService = encryptionService;
        this.auditService = auditService;
        this.logger = new common_1.Logger(ClientsService_1.name);
    }
    packEncryptedData(data) {
        const iv = Buffer.from(data.iv, 'base64');
        const tag = Buffer.from(data.tag, 'base64');
        const encrypted = data.encryptedData;
        return Buffer.concat([iv, tag, encrypted]);
    }
    unpackEncryptedData(buffer, keyId) {
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
    async create(userId, createClientDto) {
        try {
            let packedData;
            let keyId;
            let personalData;
            if ('encryptedData' in createClientDto) {
                packedData = Buffer.from(createClientDto.encryptedData, 'base64');
                keyId = createClientDto.keyId;
                const unpacked = this.unpackEncryptedData(packedData, keyId);
                const decryptResult = await this.encryptionService.decryptData(unpacked);
                if (!decryptResult.success || !decryptResult.data) {
                    throw new Error('Invalid encrypted data received');
                }
                personalData = decryptResult.data;
            }
            else {
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
            const client = await this.prisma.client.create({
                data: {
                    user: { connect: { id: userId } },
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
                action: client_1.AuditAction.CREATE,
                resourceType: 'CLIENT',
                resourceId: client.id,
                details: `Registrado nuevo paciente (ID: ${client.id})`
            });
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
        }
        catch (error) {
            this.logger.error(`Error creating client: ${error.message}`);
            throw error;
        }
    }
    async findAll(userId) {
        try {
            const clients = await this.prisma.client.findMany({
                where: { userId, isActive: true },
                orderBy: { createdAt: 'desc' },
            });
            const decryptedClients = await Promise.all(clients.map(async (client) => {
                try {
                    if (!client.encryptedPersonalData)
                        return null;
                    const encryptedData = this.unpackEncryptedData(client.encryptedPersonalData, client.encryptionKeyId);
                    const result = await this.encryptionService.decryptData(encryptedData);
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
                }
                catch (e) {
                    this.logger.error(`Error processing client ${client.id}: ${e.message}`);
                    return null;
                }
            }));
            return decryptedClients.filter(c => c !== null);
        }
        catch (error) {
            this.logger.error(`Error fetching clients: ${error.message}`);
            throw error;
        }
    }
    async findOne(userId, clientId) {
        const client = await this.prisma.client.findFirst({
            where: { id: clientId, userId },
        });
        if (!client) {
            throw new common_1.NotFoundException('Cliente no encontrado');
        }
        const encryptedData = this.unpackEncryptedData(client.encryptedPersonalData, client.encryptionKeyId);
        const result = await this.encryptionService.decryptData(encryptedData);
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
    async update(userId, clientId, updateClientDto) {
        const client = await this.prisma.client.findFirst({
            where: { id: clientId, userId },
        });
        if (!client) {
            throw new common_1.NotFoundException('Cliente no encontrado');
        }
        const encryptedData = this.unpackEncryptedData(client.encryptedPersonalData, client.encryptionKeyId);
        const result = await this.encryptionService.decryptData(encryptedData);
        if (!result.success || !result.data) {
            throw new Error('Error al descifrar datos para actualización');
        }
        const currentData = result.data;
        const newData = {
            firstName: updateClientDto.firstName || currentData.firstName,
            lastName: updateClientDto.lastName || currentData.lastName,
            email: updateClientDto.email || currentData.email,
            phone: updateClientDto.phone || currentData.phone,
            emergencyContact: updateClientDto.emergencyContact || currentData.emergencyContact,
            diagnosis: updateClientDto.diagnosis || currentData.diagnosis,
            notes: updateClientDto.notes || currentData.notes,
            birthDate: updateClientDto.birthDate || currentData.birthDate,
        };
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
            action: client_1.AuditAction.UPDATE,
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
    async remove(userId, clientId) {
        const client = await this.prisma.client.findFirst({
            where: { id: clientId, userId },
        });
        if (!client) {
            throw new common_1.NotFoundException('Cliente no encontrado');
        }
        await this.prisma.client.update({
            where: { id: clientId },
            data: {
                isActive: false,
                lastModifiedBy: userId,
            },
        });
        await this.auditService.log({
            userId,
            action: client_1.AuditAction.DELETE,
            resourceType: 'CLIENT',
            resourceId: clientId,
            details: `Archivado paciente (ID: ${clientId})`
        });
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = ClientsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService,
        audit_service_1.AuditService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map