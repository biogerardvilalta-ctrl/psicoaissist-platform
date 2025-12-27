
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { EncryptionService } from '../encryption/encryption.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UserRole, UserStatus } from '@prisma/client';
import { ConflictException } from '@nestjs/common';

describe('UsersService', () => {
    let service: UsersService;
    let prisma: any;
    let encryptionService: any;

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
        },
    };

    const mockEncryptionService = {
        hashPassword: jest.fn().mockResolvedValue('hashed-password'),
        comparePassword: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: EncryptionService, useValue: mockEncryptionService },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        prisma = module.get<PrismaService>(PrismaService);
        encryptionService = module.get<EncryptionService>(EncryptionService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createAgendaManager', () => {
        const profId = 'prof-1';
        const dto = {
            email: 'manager@example.com',
            password: 'password123',
            firstName: 'Manager',
            lastName: 'One'
        };

        it('should create a new Agenda Manager linked to professional', async () => {
            prisma.user.findUnique.mockResolvedValue(null); // No existing email
            prisma.user.create.mockResolvedValue({
                id: 'manager-1',
                ...dto,
                passwordHash: 'hashed-password',
                role: UserRole.AGENDA_MANAGER,
                status: UserStatus.ACTIVE,
                createdById: profId,
                managedProfessionals: [{ id: profId }] // return with connected pro
            });

            const result = await service.createAgendaManager(profId, dto);

            expect(result).toBeDefined();
            expect(result.role).toBe(UserRole.AGENDA_MANAGER);
            expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    email: dto.email.toLowerCase(),
                    createdById: profId,
                })
            }));
        });

        it('should throw ConflictException if email exists with different role', async () => {
            prisma.user.findUnique.mockResolvedValue({
                id: 'existing-user',
                email: dto.email,
                role: UserRole.PSYCHOLOGIST // Different role
            });

            await expect(service.createAgendaManager(profId, dto)).rejects.toThrow(ConflictException);
        });

        it('should link existing Agenda Manager if email exists', async () => {
            prisma.user.findUnique.mockResolvedValue({
                id: 'existing-manager',
                email: dto.email,
                role: UserRole.AGENDA_MANAGER
            });
            // Update called implicitly by linkProfessional
            prisma.user.update.mockResolvedValue({
                id: 'existing-manager',
                role: UserRole.AGENDA_MANAGER
            });

            await service.createAgendaManager(profId, dto);

            // Expect update to connect professional
            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'existing-manager' },
                data: {
                    managedProfessionals: {
                        connect: { id: profId }
                    }
                }
            }));
        });
    });
});
