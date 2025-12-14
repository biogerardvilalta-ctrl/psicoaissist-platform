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
exports.EncryptionService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let EncryptionService = class EncryptionService {
    constructor(prisma) {
        this.prisma = prisma;
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
    }
    async encryptData(data, userId) {
        try {
            const key = await this.getOrCreateEncryptionKey(userId);
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(key.keyValue, 'base64'), iv);
            const serializedData = JSON.stringify(data);
            let encrypted = cipher.update(serializedData, 'utf8');
            encrypted = Buffer.concat([encrypted, cipher.final()]);
            const tag = cipher.getAuthTag();
            return {
                encryptedData: encrypted,
                iv: iv.toString('base64'),
                tag: tag.toString('base64'),
                keyId: key.id,
            };
        }
        catch (error) {
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }
    async decryptData(encryptedData) {
        try {
            const key = await this.getEncryptionKey(encryptedData.keyId);
            if (!key || !key.isActive) {
                return {
                    data: null,
                    success: false,
                    error: 'Encryption key not found or inactive',
                };
            }
            const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(key.keyValue, 'base64'), Buffer.from(encryptedData.iv, 'base64'));
            decipher.setAuthTag(Buffer.from(encryptedData.tag, 'base64'));
            let decrypted = decipher.update(encryptedData.encryptedData, null, 'utf8');
            decrypted += decipher.final('utf8');
            const parsedData = JSON.parse(decrypted);
            return {
                data: parsedData,
                success: true,
            };
        }
        catch (error) {
            return {
                data: null,
                success: false,
                error: `Decryption failed: ${error.message}`,
            };
        }
    }
    async encryptString(plaintext, userId) {
        return this.encryptData(plaintext, userId);
    }
    async decryptString(encryptedData) {
        return this.decryptData(encryptedData);
    }
    async generateNewKey(userId) {
        await this.prisma.encryptionKey.updateMany({
            where: { userId, isActive: true },
            data: { isActive: false },
        });
        const keyValue = crypto.randomBytes(this.keyLength).toString('base64');
        const newKey = await this.prisma.encryptionKey.create({
            data: {
                userId,
                keyValue,
                algorithm: this.algorithm,
                isActive: true,
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
        });
        return newKey.id;
    }
    async getOrCreateEncryptionKey(userId) {
        let key = await this.prisma.encryptionKey.findFirst({
            where: {
                userId,
                isActive: true,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (!key) {
            const keyValue = crypto.randomBytes(this.keyLength).toString('base64');
            key = await this.prisma.encryptionKey.create({
                data: {
                    userId,
                    keyValue,
                    algorithm: this.algorithm,
                    isActive: true,
                    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                },
            });
        }
        return key;
    }
    async getEncryptionKey(keyId) {
        return this.prisma.encryptionKey.findUnique({
            where: { id: keyId },
        });
    }
    async rotateKey(userId) {
        return this.generateNewKey(userId);
    }
    async hashPassword(password) {
        const bcrypt = await Promise.resolve().then(() => require('bcrypt'));
        return bcrypt.hash(password, 12);
    }
    async comparePassword(password, hash) {
        const bcrypt = await Promise.resolve().then(() => require('bcrypt'));
        return bcrypt.compare(password, hash);
    }
    generateSecureToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }
    hashForIndex(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
};
exports.EncryptionService = EncryptionService;
exports.EncryptionService = EncryptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EncryptionService);
//# sourceMappingURL=encryption.service.js.map