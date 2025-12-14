import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
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

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits

  constructor(private prisma: PrismaService) {}

  /**
   * Encrypt data for a specific user
   */
  async encryptData<T>(data: T, userId: string): Promise<EncryptedData> {
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
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt data using the provided encryption metadata
   */
  async decryptData<T>(encryptedData: EncryptedData): Promise<DecryptionResult<T>> {
    try {
      const key = await this.getEncryptionKey(encryptedData.keyId);
      if (!key || !key.isActive) {
        return {
          data: null,
          success: false,
          error: 'Encryption key not found or inactive',
        };
      }

      const decipher = crypto.createDecipheriv(
        this.algorithm,
        Buffer.from(key.keyValue, 'base64'),
        Buffer.from(encryptedData.iv, 'base64')
      );
      
      decipher.setAuthTag(Buffer.from(encryptedData.tag, 'base64'));
      
      let decrypted = decipher.update(encryptedData.encryptedData, null, 'utf8');
      decrypted += decipher.final('utf8');
      
      const parsedData = JSON.parse(decrypted);
      
      return {
        data: parsedData,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: `Decryption failed: ${error.message}`,
      };
    }
  }

  /**
   * Encrypt raw string data
   */
  async encryptString(plaintext: string, userId: string): Promise<EncryptedData> {
    return this.encryptData(plaintext, userId);
  }

  /**
   * Decrypt to string
   */
  async decryptString(encryptedData: EncryptedData): Promise<DecryptionResult<string>> {
    return this.decryptData<string>(encryptedData);
  }

  /**
   * Generate a new encryption key for a user
   */
  async generateNewKey(userId: string): Promise<string> {
    // Deactivate old keys
    await this.prisma.encryptionKey.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    // Generate new key
    const keyValue = crypto.randomBytes(this.keyLength).toString('base64');
    
    const newKey = await this.prisma.encryptionKey.create({
      data: {
        userId,
        keyValue,
        algorithm: this.algorithm,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });

    return newKey.id;
  }

  /**
   * Get or create encryption key for user
   */
  private async getOrCreateEncryptionKey(userId: string) {
    let key = await this.prisma.encryptionKey.findFirst({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date(), // Not expired
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
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
      });
    }

    return key;
  }

  /**
   * Get encryption key by ID
   */
  private async getEncryptionKey(keyId: string) {
    return this.prisma.encryptionKey.findUnique({
      where: { id: keyId },
    });
  }

  /**
   * Rotate encryption key for user
   */
  async rotateKey(userId: string): Promise<string> {
    return this.generateNewKey(userId);
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcrypt');
    return bcrypt.hash(password, 12);
  }

  /**
   * Comparar contraseña con hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = await import('bcrypt');
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash sensitive data for indexing (one-way)
   */
  hashForIndex(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}