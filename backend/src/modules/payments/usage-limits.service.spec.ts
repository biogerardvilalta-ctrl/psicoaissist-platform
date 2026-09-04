import { Test, TestingModule } from '@nestjs/testing';
import { UsageLimitsService } from './usage-limits.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('UsageLimitsService', () => {
  let service: UsageLimitsService;
  let mockPrismaService: any;
  let mockNotificationsService: any;

  beforeEach(async () => {
    mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    mockNotificationsService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsageLimitsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<UsageLimitsService>(UsageLimitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkClientLimit', () => {
    it('should throw if limit is reached for basic plan', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: UserRole.PSYCHOLOGIST,
        subscription: { planType: 'BASIC', status: 'active', currentPeriodEnd: new Date(2100, 1, 1) },
        _count: { clients: 25 }, // Basic limit is 25
      });

      await expect(service.checkClientLimit('user-1')).rejects.toThrow(ForbiddenException);
    });

    it('should pass if under limit for basic plan', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: UserRole.PSYCHOLOGIST,
        subscription: { planType: 'BASIC', status: 'active', currentPeriodEnd: new Date(2100, 1, 1) },
        _count: { clients: 24 }, // Under limit
      });

      await expect(service.checkClientLimit('user-1')).resolves.not.toThrow();
    });

    it('should pass for pro plan with many clients', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: UserRole.PSYCHOLOGIST,
        subscription: { planType: 'PRO', status: 'active', currentPeriodEnd: new Date(2100, 1, 1) },
        _count: { clients: 100 }, // Pro is unlimited (fair use is higher)
      });

      await expect(service.checkClientLimit('user-1')).resolves.not.toThrow();
    });
  });

  describe('incrementTranscriptionUsage', () => {
    it('should increment successfully if under limit', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: UserRole.PSYCHOLOGIST,
        transcriptionMinutesUsed: 0,
        extraTranscriptionMinutes: 0,
        subscription: { planType: 'BASIC', status: 'active', currentPeriodEnd: new Date(2100, 1, 1) },
      });

      const result = await service.incrementTranscriptionUsage('user-1', 120); // 2 minutes

      expect(result.limitExceeded).toBe(false);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ transcriptionMinutesUsed: { increment: 2 } })
        })
      );
    });

    it('should use extra minutes when base limit is exceeded', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: UserRole.PSYCHOLOGIST,
        transcriptionMinutesUsed: 600, // Basic limit is 600
        extraTranscriptionMinutes: 100,
        subscription: { planType: 'BASIC', status: 'active', currentPeriodEnd: new Date(2100, 1, 1) },
      });

      const result = await service.incrementTranscriptionUsage('user-1', 300); // 5 minutes

      expect(result.limitExceeded).toBe(false);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ 
            transcriptionMinutesUsed: { increment: 5 },
            extraTranscriptionMinutes: { decrement: 5 }
          })
        })
      );
    });

    it('should fail if base and extra limits are both exceeded', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: UserRole.PSYCHOLOGIST,
        transcriptionMinutesUsed: 600, // Basic limit is 600
        extraTranscriptionMinutes: 2,
        subscription: { planType: 'BASIC', status: 'active', currentPeriodEnd: new Date(2100, 1, 1) },
      });

      const result = await service.incrementTranscriptionUsage('user-1', 300); // 5 minutes

      expect(result.limitExceeded).toBe(true);
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('getNextMonthlyResetDate', () => {
    it('should calculate next reset date correctly', () => {
      const now = new Date();
      // Suppose period started 15 days ago
      const periodStart = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
      
      const nextReset = service.getNextMonthlyResetDate(periodStart);
      
      expect(nextReset.getTime()).toBeGreaterThan(now.getTime());
      
      // The day of month should match periodStart
      expect(nextReset.getDate()).toBe(periodStart.getDate());
    });
  });
});
