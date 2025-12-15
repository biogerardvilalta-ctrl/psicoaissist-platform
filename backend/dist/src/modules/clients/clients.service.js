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
let ClientsService = ClientsService_1 = class ClientsService {
    constructor(prisma, encryptionService) {
        this.prisma = prisma;
        this.encryptionService = encryptionService;
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
            const personalData = {
                firstName: createClientDto.firstName,
                lastName: createClientDto.lastName,
                email: createClientDto.email,
                phone: createClientDto.phone,
                emergencyContact: createClientDto.emergencyContact,
                diagnosis: createClientDto.diagnosis,
                notes: createClientDto.notes,
            };
            const encrypted = await this.encryptionService.encryptData(personalData, userId);
            const packedData = this.packEncryptedData(encrypted);
            const client = await this.prisma.client.create({
                data: {
                    user: { connect: { id: userId } },
                    encryptedPersonalData: packedData,
                    encryptionKeyId: encrypted.keyId,
                    tags: createClientDto.tags || [],
                    riskLevel: createClientDto.riskLevel,
                    lastModifiedBy: userId,
                },
            });
            this.logger.log(`Client created for user ${userId}`);
            return {
                id: client.id,
                ...personalData,
                riskLevel: client.riskLevel,
                isActive: client.isActive,
                tags: client.tags,
                createdAt: client.createdAt,
                updatedAt: client.updatedAt,
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
            },
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
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = ClientsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map