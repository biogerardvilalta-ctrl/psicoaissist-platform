import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from './encryption.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('EncryptionService', () => {
  let service: EncryptionService;
  let mockPrismaService: any;

  beforeEach(async () => {
    // Mock the PrismaService methods used by EncryptionService
    mockPrismaService = {
      encryptionKey: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Symmetric Encryption', () => {
    const mockUserId = 'user-123';
    const mockKeyId = 'key-123';
    
    const mockKey = {
      id: mockKeyId,
      userId: mockUserId,
      keyValue: Buffer.from('a'.repeat(32)).toString('base64'), // Valid 256-bit key
      isActive: true,
    };

    it('should encrypt and decrypt string data successfully', async () => {
      // Mock getOrCreateEncryptionKey & getEncryptionKey
      mockPrismaService.encryptionKey.findFirst.mockResolvedValue(mockKey);
      mockPrismaService.encryptionKey.findUnique.mockResolvedValue(mockKey);

      const plaintext = 'super secret data';
      
      const encrypted = await service.encryptString(plaintext, mockUserId);
      
      expect(encrypted).toHaveProperty('encryptedData');
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('tag');
      expect(encrypted.keyId).toBe(mockKeyId);

      const decrypted = await service.decryptString(encrypted);
      
      expect(decrypted.success).toBe(true);
      expect(decrypted.data).toBe(plaintext);
    });

    it('should encrypt and decrypt JSON data successfully', async () => {
      mockPrismaService.encryptionKey.findFirst.mockResolvedValue(mockKey);
      mockPrismaService.encryptionKey.findUnique.mockResolvedValue(mockKey);

      const objData = { email: 'test@test.com', sensitive: true };
      
      const encrypted = await service.encryptData(objData, mockUserId);
      const decrypted = await service.decryptData<{email: string; sensitive: boolean}>(encrypted);
      
      expect(decrypted.success).toBe(true);
      expect(decrypted.data.email).toBe(objData.email);
    });

    it('should fail decryption with wrong key', async () => {
      mockPrismaService.encryptionKey.findFirst.mockResolvedValue(mockKey);
      
      const encrypted = await service.encryptString('test', mockUserId);
      
      // Now return a DIFFERENT key for decryption
      const wrongKey = {
        ...mockKey,
        keyValue: Buffer.from('b'.repeat(32)).toString('base64'),
      };
      mockPrismaService.encryptionKey.findUnique.mockResolvedValue(wrongKey);

      const decrypted = await service.decryptString(encrypted);
      
      expect(decrypted.success).toBe(false);
      expect(decrypted.error).toBeDefined();
    });

    it('should fail decryption if key is inactive', async () => {
      mockPrismaService.encryptionKey.findFirst.mockResolvedValue(mockKey);
      
      const encrypted = await service.encryptString('test', mockUserId);
      
      const inactiveKey = { ...mockKey, isActive: false };
      mockPrismaService.encryptionKey.findUnique.mockResolvedValue(inactiveKey);

      const decrypted = await service.decryptString(encrypted);
      
      expect(decrypted.success).toBe(false);
      expect(decrypted.error).toContain('inactive');
    });
  });

  describe('Password Hashing', () => {
    it('should hash and compare passwords correctly', async () => {
      const password = 'mySecurePassword123';
      const hash = await service.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      
      const isValid = await service.comparePassword(password, hash);
      expect(isValid).toBe(true);
      
      const isInvalid = await service.comparePassword('wrongPassword', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Asymmetric Encryption', () => {
    it('should generate a public key', () => {
      const pubKey = service.getPublicKey();
      expect(pubKey).toBeDefined();
      expect(pubKey).toContain('BEGIN PUBLIC KEY');
    });

    it('should decrypt data encrypted with its public key', async () => {
      const crypto = require('crypto');
      const pubKey = service.getPublicKey();
      
      const secretMessage = JSON.stringify({ email: 'test@test.com' });
      
      // Encrypt with public key
      const encryptedBuffer = crypto.publicEncrypt(
        {
          key: pubKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(secretMessage)
      );
      const encryptedBase64 = encryptedBuffer.toString('base64');
      
      // Decrypt with service
      const decrypted = await service.decryptAsymmetric(encryptedBase64);
      expect(decrypted).toBe(secretMessage);
    });
  });
});
