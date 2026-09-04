import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StripeService } from './stripe.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { PlanType } from './dto/payments.dto';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prismaService: any;
  let stripeService: any;
  let emailService: any;
  let notificationsService: any;
  let auditService: any;

  beforeEach(async () => {
    // Mock implementations
    const mockPrisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      subscription: {
        update: jest.fn(),
      }
    };

    const mockStripe = {
      getPlan: jest.fn(),
      createCustomer: jest.fn(),
      createCheckoutSession: jest.fn(),
      cancelSubscription: jest.fn(),
    };

    const mockAudit = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: StripeService, useValue: mockStripe },
        { provide: EmailService, useValue: { sendWelcomeEmail: jest.fn() } },
        { provide: NotificationsService, useValue: { create: jest.fn() } },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prismaService = module.get(PrismaService);
    stripeService = module.get(StripeService);
    emailService = module.get(EmailService);
    notificationsService = module.get(NotificationsService);
    auditService = module.get(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCheckoutSession', () => {
    it('should throw an error if user is not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.createCheckoutSession({ plan: 'basic' as unknown as PlanType, interval: 'month' }, 'user-id')).rejects.toThrow('User not found');
    });

    it('should create a checkout session for a one-time pack', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'test@test.com',
        stripeCustomerId: 'cus_123',
        subscription: null,
      } as any);

      stripeService.getPlan.mockReturnValue({
        priceId: 'price_123',
        interval: 'one-time',
        name: 'Pack Minutos',
        amount: 1500,
        currency: 'eur',
      } as any);

      stripeService.createCheckoutSession.mockResolvedValue({
        id: 'session_123',
        url: 'https://checkout.stripe.com/123',
      } as any);

      const result = await service.createCheckoutSession({ plan: PlanType.MINUTES_PACK, interval: 'one-time' } as any, 'user-id');

      expect(stripeService.createCheckoutSession).toHaveBeenCalledWith(
        'price_123',
        'cus_123',
        { userId: 'user-id', planType: PlanType.MINUTES_PACK, isOneTime: 'true' },
        'payment'
      );
      expect(result.sessionId).toBe('session_123');
      expect(result.url).toBe('https://checkout.stripe.com/123');
    });

    it('should throw an error if the plan is invalid', async () => {
      prismaService.user.findUnique.mockResolvedValue({ id: 'user-id' } as any);
      stripeService.getPlan.mockReturnValue(null);

      await expect(service.createCheckoutSession({ plan: 'invalid_plan' as unknown as PlanType, interval: 'month' }, 'user-id')).rejects.toThrow('Invalid plan selected');
    });
  });

  describe('cancelSubscription', () => {
    it('should throw an error if user or subscription not found', async () => {
      prismaService.user.findUnique.mockResolvedValue({ id: 'user-id', subscription: null } as any);
      await expect(service.cancelSubscription('user-id')).rejects.toThrow('No subscription found for user');
    });

    it('should cancel subscription and update database', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        subscription: { id: 'sub_db_1', stripeSubscriptionId: 'sub_stripe_1' }
      } as any);

      stripeService.cancelSubscription.mockResolvedValue({ id: 'sub_stripe_1', status: 'canceled' } as any);

      const result = await service.cancelSubscription('user-id');

      expect(stripeService.cancelSubscription).toHaveBeenCalledWith('sub_stripe_1');
      expect(prismaService.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub_db_1' },
        data: expect.objectContaining({ status: 'canceled' }),
      });
      expect(auditService.log).toHaveBeenCalled();
      expect(result.subscription.status).toBe('canceled');
    });
  });
});
