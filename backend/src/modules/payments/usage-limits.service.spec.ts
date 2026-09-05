import { Test, TestingModule } from '@nestjs/testing';
import { UsageLimitsService } from './usage-limits.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PlanLimits, PLAN_FEATURES } from './plan-features';
import { ForbiddenException } from '@nestjs/common';

describe('UsageLimitsService', () => {
  let service: UsageLimitsService;
  let prisma: any;
  let notificationsService: any;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsageLimitsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<UsageLimitsService>(UsageLimitsService);
    prisma = module.get(PrismaService);
    notificationsService = module.get(NotificationsService);
    jest.clearAllMocks();
  });

  describe('getPlanFeatures', () => {
    it('retorna features correctes per pla', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        subscription: { planType: 'basic', status: 'active' },
      });
      const features = await service.getPlanFeatures('u1');
      expect(features).toEqual(PLAN_FEATURES['basic']);
    });
  });

  describe('checkTranscriptionLimit', () => {
    it('Basic límit -> permet fins al límit, +1 -> llança error', async () => {
      const basicLimit = PlanLimits.BASIC_TRANSCRIPTION_MINUTES;
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        transcriptionMinutesUsed: basicLimit - 10,
        subscription: { planType: 'basic', status: 'active' },
      });
      
      // Should allow adding 10
      await expect(service.checkTranscriptionLimit('u1', 10)).resolves.not.toThrow();
      
      // Should throw when exceeding
      await expect(service.checkTranscriptionLimit('u1', 11)).rejects.toThrow(ForbiddenException);
    });

    it('Pro -> permet fins al seu límit o fair use si és il·limitat (segons PLAN_FEATURES)', async () => {
      const proLimit = PLAN_FEATURES['pro'].transcriptionMinutes;
      if (proLimit === PlanLimits.UNLIMITED) {
        mockPrisma.user.findUnique.mockResolvedValue({
          id: 'u1',
          transcriptionMinutesUsed: 0,
          subscription: { planType: 'pro', status: 'active' },
        });
        await expect(service.checkTranscriptionLimit('u1', 999999)).rejects.toThrow(ForbiddenException);
      } else {
        mockPrisma.user.findUnique.mockResolvedValue({
          id: 'u1',
          transcriptionMinutesUsed: proLimit,
          subscription: { planType: 'pro', status: 'active' },
        });
        await expect(service.checkTranscriptionLimit('u1', 1)).rejects.toThrow(ForbiddenException);
      }
    });

    it('Extra packs - verificar que s afegeixen al comptador', async () => {
      const basicLimit = PlanLimits.BASIC_TRANSCRIPTION_MINUTES;
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        transcriptionMinutesUsed: basicLimit, // Already used basic limit
        extraTranscriptionMinutes: 50, // Has 50 extra
        subscription: { planType: 'basic', status: 'active' },
      });
      
      // Should allow adding up to 50
      await expect(service.checkTranscriptionLimit('u1', 50)).resolves.not.toThrow();
      // Should throw if exceeding 50
      await expect(service.checkTranscriptionLimit('u1', 51)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('incrementTranscriptionUsage', () => {
    it('deducció correcta, actualitza DB', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        transcriptionMinutesUsed: 0,
        extraTranscriptionMinutes: 0,
        subscription: { planType: 'basic', status: 'active' },
      });
      
      // 120 seconds = 2 minutes
      const result = await service.incrementTranscriptionUsage('u1', 120);
      expect(result.limitExceeded).toBe(false);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'u1' },
        data: expect.objectContaining({
          transcriptionMinutesUsed: { increment: 2 }
        })
      }));
    });

    it('dedueix de extraTranscriptionMinutes si se supera el límit base', async () => {
      const basicLimit = PlanLimits.BASIC_TRANSCRIPTION_MINUTES;
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        transcriptionMinutesUsed: basicLimit - 1, // 1 minute left in plan
        extraTranscriptionMinutes: 10,
        subscription: { planType: 'basic', status: 'active' },
      });
      
      // Add 120 seconds (2 minutes). 1 minute from plan, 1 minute from extra.
      const result = await service.incrementTranscriptionUsage('u1', 120);
      expect(result.limitExceeded).toBe(false);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'u1' },
        data: expect.objectContaining({
          transcriptionMinutesUsed: { increment: 2 },
          extraTranscriptionMinutes: { decrement: 1 }
        })
      }));
    });
  });
});
