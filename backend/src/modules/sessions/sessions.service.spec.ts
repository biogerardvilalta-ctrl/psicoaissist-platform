
import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';
import { AiService } from '../ai/ai.service';
import { AuditService } from '../audit/audit.service';
import { GoogleService } from '../google/google.service';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { SessionStatus, SessionType } from './dto/sessions.dto';

describe('SessionsService', () => {
    let service: SessionsService;
    let prisma: any;
    let googleService: any;

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
        },
        client: {
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        session: {
            findFirst: jest.fn(),
            create: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
        },
    };

    const mockEncryptionService = {
        encryptData: jest.fn().mockResolvedValue({ iv: 'iv', tag: 'tag', encryptedData: Buffer.from('data'), keyId: 'keyId' }),
        decryptData: jest.fn(),
    };

    const mockAiService = {
        generateSessionAnalysis: jest.fn(),
    };

    const mockAuditService = {
        log: jest.fn(),
    };

    const mockGoogleService = {
        insertEvent: jest.fn(),
        updateEvent: jest.fn(),
        deleteEvent: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SessionsService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: EncryptionService, useValue: mockEncryptionService },
                { provide: AiService, useValue: mockAiService },
                { provide: AuditService, useValue: mockAuditService },
                { provide: GoogleService, useValue: mockGoogleService },
            ],
        }).compile();

        service = module.get<SessionsService>(SessionsService);
        prisma = module.get<PrismaService>(PrismaService);
        googleService = module.get<GoogleService>(GoogleService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const userId = 'user-1';
        const createDto = {
            clientId: 'client-1',
            startTime: new Date('2025-01-01T10:00:00Z').toISOString(),
            sessionType: SessionType.INDIVIDUAL,
        };

        it('should create a session successfully', async () => {
            // Mock dependencies
            prisma.client.findFirst.mockResolvedValue({ id: 'client-1', userId: userId });
            prisma.user.findUnique.mockResolvedValue({ id: userId, defaultDuration: 60 });
            prisma.session.findFirst.mockResolvedValue(null); // No conflict
            prisma.session.create.mockResolvedValue({
                id: 'session-1',
                ...createDto,
                startTime: new Date(createDto.startTime), // Must be Date object
                endTime: new Date('2025-01-01T11:00:00Z'),
                duration: 60,
                status: SessionStatus.SCHEDULED,
            });
            prisma.client.update.mockResolvedValue({ id: 'client-1' });
            googleService.insertEvent.mockResolvedValue({ id: 'google-event-1' });

            const result = await service.create(userId, createDto);

            expect(result).toBeDefined();
            expect(result.id).toBe('session-1');
            expect(prisma.session.create).toHaveBeenCalled();
            expect(googleService.insertEvent).toHaveBeenCalled();
            expect(prisma.session.update).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 'session-1' }, data: { googleEventId: 'google-event-1' } })
            );
        });

        it('should throw ConflictException if slot is busy', async () => {
            prisma.client.findFirst.mockResolvedValue({ id: 'client-1', userId: userId });
            prisma.user.findUnique.mockResolvedValue({ id: userId, defaultDuration: 60 });
            prisma.session.findFirst.mockResolvedValue({ id: 'existing-session' }); // Conflict

            await expect(service.create(userId, createDto)).rejects.toThrow(ConflictException);
        });

        it('should throw ForbiddenException if Agenda Manager tries to create for unmanaged professional', async () => {
            const managerId = 'manager-1';
            const professionalId = 'prof-2';
            const dtoWithProf = { ...createDto, professionalId };

            prisma.user.findUnique.mockResolvedValue({
                id: managerId,
                managedProfessionals: [{ id: 'other-prof' }], // Not the requested one
            });

            await expect(service.create(managerId, dtoWithProf)).rejects.toThrow(ForbiddenException);
        });
    });

    describe('findAll', () => {
        const userId = 'user-1';

        it('should return sessions for the user', async () => {
            const user = { id: userId, role: 'PROFESSIONAL' };
            prisma.session.findMany.mockResolvedValue([
                { id: 's1', userId, startTime: new Date() }
            ]);

            const result = await service.findAll(user);
            expect(result).toHaveLength(1);
            expect(prisma.session.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { userId: { in: [userId] } }
            }));
        });

        it('should filter by managed professional for Agenda Manager', async () => {
            const managerId = 'manager-1';
            const managedRef = 'prof-1';
            const user = { id: managerId, role: 'AGENDA_MANAGER' };

            prisma.user.findUnique.mockResolvedValue({
                id: managerId,
                managedProfessionals: [{ id: managedRef }]
            });
            prisma.session.findMany.mockResolvedValue([]);

            await service.findAll(user, { professionalId: managedRef });

            expect(prisma.session.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { userId: { in: [managedRef] } }
            }));
        });

        it('should block Agenda Manager from accessing unmanaged professional sessions', async () => {
            const managerId = 'manager-1';
            const user = { id: managerId, role: 'AGENDA_MANAGER' };
            const unmanagedRef = 'prof-unmanaged';

            prisma.user.findUnique.mockResolvedValue({
                id: managerId,
                managedProfessionals: [{ id: 'prof-1' }]
            });
            prisma.session.findMany.mockResolvedValue([]);

            await service.findAll(user, { professionalId: unmanagedRef });

            // Should filter with empty array or safe default ensuring no data leak
            expect(prisma.session.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { userId: { in: [] } } // Expect empty list or access denied equivalent
            }));
        });
    });
});
