import { PrismaService } from '../../common/prisma/prisma.service';
export interface EncryptedData {
    encryptedData: Buffer;
    iv: string;
    tag: string;
    keyId: string;
}
export interface DecryptionResult<T = any> {
    data: T;
    success: boolean;
    error?: string;
}
export declare class EncryptionService {
    private prisma;
    private readonly algorithm;
    private readonly keyLength;
    constructor(prisma: PrismaService);
    encryptData<T>(data: T, userId: string): Promise<EncryptedData>;
    decryptData<T>(encryptedData: EncryptedData): Promise<DecryptionResult<T>>;
    encryptString(plaintext: string, userId: string): Promise<EncryptedData>;
    decryptString(encryptedData: EncryptedData): Promise<DecryptionResult<string>>;
    generateNewKey(userId: string): Promise<string>;
    getOrCreateEncryptionKey(userId: string): Promise<{
        id: string;
        userId: string;
        keyValue: string;
        algorithm: string;
        isActive: boolean;
        createdAt: Date;
        expiresAt: Date | null;
    }>;
    private getEncryptionKey;
    rotateKey(userId: string): Promise<string>;
    hashPassword(password: string): Promise<string>;
    comparePassword(password: string, hash: string): Promise<boolean>;
    generateSecureToken(length?: number): string;
    hashForIndex(data: string): string;
    private static serverKeyPair;
    private getServerKeyPair;
    getPublicKey(): string;
    decryptAsymmetric(encryptedBase64: string): Promise<string>;
}
