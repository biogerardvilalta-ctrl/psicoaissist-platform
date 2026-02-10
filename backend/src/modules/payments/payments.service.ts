import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StripeService } from './stripe.service';
import { EmailService } from '../email/email.service';
import {
  CreateCheckoutSessionDto,
  CreateCustomerDto,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  PlanType
} from './dto/payments.dto';
import { NotificationsService } from '../notifications/notifications.service';
import Stripe from 'stripe';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
    private readonly auditService: AuditService,
  ) { }

  async createCheckoutSession(createCheckoutDto: CreateCheckoutSessionDto, userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check specific logic for Packs
      const isPack = createCheckoutDto.plan === PlanType.MINUTES_PACK || createCheckoutDto.plan === PlanType.SIMULATOR_PACK || createCheckoutDto.plan === PlanType.AGENDA_MANAGER_PACK || createCheckoutDto.plan === PlanType.ONBOARDING_PACK;

      const planConfig = this.stripeService.getPlan(createCheckoutDto.plan, createCheckoutDto.interval);
      if (!planConfig) {
        throw new BadRequestException('Invalid plan selected');
      }

      // Special case: recurring Add-on (Agenda Manager) for existing subscribers
      if (createCheckoutDto.plan === PlanType.AGENDA_MANAGER_PACK && user.subscription?.status === 'active') {
        try {
          await this.stripeService.addSubscriptionItem(
            user.subscription.stripeSubscriptionId,
            planConfig.priceId
          );

          // Enable feature immediately
          await this.addExtraPack(userId, PlanType.AGENDA_MANAGER_PACK);

          return {
            imgUrl: null, // No checkout url needed
            success: true,
            message: 'Pack Agenda Manager activated successfully added to your subscription.'
          };
        } catch (error) {
          this.logger.warn('Could not add pack to existing subscription (likely invalid ID in dev), falling back to new checkout session:', error.message);
          // Fallthrough to normal checkout creation
        }
      }

      // Normal Checkout Flow (Subscription or One-time Pack)
      // If it's a pack, we allow it even if user has a subscription (it's a one-time purchase)
      if (!isPack) {
        // Check if user already has an active subscription (only for subs)
        if (user.subscription?.status === 'active') {
          if (user.subscription.planType === createCheckoutDto.plan) {
            throw new BadRequestException('User already has this subscription active');
          }
          throw new BadRequestException('User already has an active subscription. Please manage it in settings.');
        }
      }

      // Create or get Stripe customer
      let stripeCustomerId = user.stripeCustomerId;

      if (!stripeCustomerId) {
        const customer = await this.stripeService.createCustomer(
          user.email,
          `${user.firstName} ${user.lastName}`,
          { userId: user.id }
        );
        stripeCustomerId = customer.id;

        await this.prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId },
        });
      }

      // Determine mode based on interval
      // If interval is null or 'one-time', it's a one-time payment. Otherwise subscription.
      const mode: Stripe.Checkout.SessionCreateParams.Mode = (planConfig.interval === null || planConfig.interval === 'one-time') ? 'payment' : 'subscription';

      // Create checkout session
      const session = await this.stripeService.createCheckoutSession(
        planConfig.priceId,
        stripeCustomerId,
        {
          userId: user.id,
          planType: createCheckoutDto.plan,
          isOneTime: isPack ? 'true' : 'false', // Metadata to identify pack
          ...createCheckoutDto.metadata,
        },
        mode
      );



      return {
        sessionId: session.id,
        url: session.url,
        plan: {
          name: planConfig.name,
          amount: planConfig.amount,
          currency: planConfig.currency,
          interval: planConfig.interval,
        },
      };
    } catch (error) {
      this.logger.error('Error creating checkout session:', error);
      // Prevent Stripe 401 (Invalid Key) from propagating as HTTP 401 (Unauthorized)
      // which causes frontend forced logout.
      if (error.statusCode === 401 || error.type === 'StripeAuthenticationError') {
        throw new InternalServerErrorException('Payment provider configuration error');
      }
      throw error;
    }
  }

  /**
   * Creates a checkout session for a user who is not yet active/authenticated.
   * Used during the registration flow where payment is required before access.
   */
  async createInitialCheckoutSession(userId: string, planId: string, interval: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Ensure user is indeed INACTIVE or PENDING to avoid abuse
      // We allow if status is INACTIVE or if they are just upgrading from a free/broken state
      // but primarily this is for the registration flow.

      const planConfig = this.stripeService.getPlan(planId, interval as 'month' | 'year');
      if (!planConfig) {
        throw new BadRequestException('Invalid plan selected');
      }

      // Create or get Stripe customer
      let stripeCustomerId = user.stripeCustomerId;

      if (!stripeCustomerId) {
        const customer = await this.stripeService.createCustomer(
          user.email,
          `${user.firstName} ${user.lastName}`,
          { userId: user.id }
        );
        stripeCustomerId = customer.id;

        await this.prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId },
        });
      }

      const mode: Stripe.Checkout.SessionCreateParams.Mode = (planConfig.interval === null || planConfig.interval === 'one-time') ? 'payment' : 'subscription';

      const session = await this.stripeService.createCheckoutSession(
        planConfig.priceId,
        stripeCustomerId,
        {
          userId: user.id,
          planType: planId,
          isInitialPayment: 'true', // Flag to trigger activation in webhook
          ... (mode === 'payment' ? { isOneTime: 'true' } : {}),
        },
        mode
      );

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      this.logger.error('Error creating initial checkout session:', error);
      throw error;
    }
  }

  async verifyCheckoutSession(sessionId: string, userId: string) {
    try {
      this.logger.log(`[DEBUG] Starting verifyCheckoutSession for session ${sessionId} user ${userId}`);

      // 1. Retrieve session from Stripe
      // Note: In demo mode, retrieving a random session ID will return mock success.
      // In real mode, it retrieves actual status.
      let session;
      try {
        this.logger.log(`[DEBUG] Retrieving session from Stripe...`);
        session = await this.stripeService.retrieveCheckoutSession(sessionId);
        this.logger.log(`[DEBUG] Session retrieved: ${session?.id}, status: ${session?.payment_status}`);
      } catch (e) {
        this.logger.error(`[DEBUG] Failed to retrieve session: ${e.message}`);
        throw new NotFoundException('Session not found');
      }

      // 2. Security Check: Ensure this session belongs to the user requesting verification
      // (Metadata is key here)
      // In demo mode, metadata might be mock, so we relax check or ensure mock matches.
      // For real implementation:
      if (!this.stripeService.isInDemoMode()) {
        if (session.metadata?.userId !== userId) {
          this.logger.warn(`Security alert: User ${userId} tried to verify session ${sessionId} belonging to ${session.metadata?.userId}`);
          throw new BadRequestException('Invalid session owner');
        }
      }

      // 3. Check Payment Status
      if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
        // 4. Trigger completion logic (Reuse Webhook Handler Logic)
        // We cast to Stripe.Checkout.Session as our service handles it
        this.logger.log(`[DEBUG] Calling handleCheckoutSessionCompleted...`);
        await this.handleCheckoutSessionCompleted(session as Stripe.Checkout.Session);
        this.logger.log(`[DEBUG] handleCheckoutSessionCompleted finished successfully.`);
        return { success: true, status: 'paid' };
      } else {
        this.logger.log(`[DEBUG] Payment not paid. Status: ${session.payment_status}`);
        return { success: false, status: session.payment_status };
      }

    } catch (error) {
      this.logger.error(`Error verifying session ${sessionId}: ${error.message}`);
      throw error;
    }
  }

  // ... (createCustomer, createPortalSession, etc remain same)

  async addExtraPack(userId: string, packId: string) {
    let details = '';
    if (packId === PlanType.MINUTES_PACK) {
      const MINUTES_IN_PACK = 500;
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          extraTranscriptionMinutes: { increment: MINUTES_IN_PACK }
        }
      });
      details = `Pack Minutos (${MINUTES_IN_PACK} min) añadido`;
      this.logger.log(`Added ${MINUTES_IN_PACK} extra minutes to user ${userId}`);
    } else if (packId === PlanType.SIMULATOR_PACK) {
      const CASES_IN_PACK = 10;
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          extraSimulatorCases: { increment: CASES_IN_PACK }
        }
      });
      details = `Pack Simulador (${CASES_IN_PACK} casos) añadido`;
      this.logger.log(`Added ${CASES_IN_PACK} extra simulator cases to user ${userId}`);
    } else if (packId === PlanType.AGENDA_MANAGER_PACK) {
      // Enable Agenda Manager pack
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          agendaManagerEnabled: true
        }
      });
      details = `Pack Agenda Manager activado`;
      this.logger.log(`Enabled Agenda Manager for user ${userId}`);
    } else if (packId === PlanType.ONBOARDING_PACK) {
      // Create Admin Task for Onboarding
      await this.prisma.adminTask.create({
        data: {
          userId: userId,
          type: 'ONBOARDING_SETUP',
          title: 'Configuración On-boarding WebServer',
          description: 'Configuramos tu cuenta contigo en 45 min: importación de pacientes, enlace con Google Calendar y personalización. Garantía de funcionamiento.',
          priority: 'HIGH',
          status: 'PENDING'
        }
      });

      // Send confirmation email to user
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        try {
          await this.emailService.sendOnboardingConfirmation(user.email, user.firstName || 'Usuario', user.preferredLanguage);

          // Notify User on Dashboard
          await this.notificationsService.create({
            userId: user.id,
            title: 'notifications.onboarding.title',
            message: 'notifications.onboarding.message',
            type: 'SUCCESS'
          });

        } catch (e) {
          this.logger.error(`Failed to send onboarding email/notification to ${user.email}`, e);
        }
      }

      // Notify Admin(s)
      const admins = await this.prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await this.notificationsService.create({
          userId: admin.id,
          title: 'notifications.onboarding.admin.title',
          message: 'notifications.onboarding.admin.message', // Backend should interpolate {email} if needed, but for now simple key or handle params
          type: 'INFO',
          data: { email: user?.email } // We pass data for interpolation in frontend
        });
      }

      // Notify Support via Email
      if (user) {
        try {
          await this.emailService.sendCustomEmail(
            'suport@psicoaissist.com',
            `Nuevo Pack Onboarding: ${user.email}`,
            `El usuario ${user.firstName || ''} ${user.lastName || ''} (${user.email}) ha contratado el Pack On-boarding.\n\nPor favor iniciar el proceso de configuración del servidor.`,
            'es'
          );
        } catch (e) {
          this.logger.error(`Failed to send support email for onboarding: ${e.message}`, e);
        }
      }

      details = `Pack On-boarding contratado (Tarea Admin Creada)`;
      this.logger.log(`Created Onboarding task for user ${userId}`);
    }

    await this.auditService.log({
      userId: userId,
      action: AuditAction.SUBSCRIPTION_CHANGE,
      resourceType: 'SUBSCRIPTION',
      resourceId: packId,
      details: details,
      isSuccess: true,
    });
  }

  // ... (rest of methods)

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const planType = session.metadata?.planType; // string
    const isOneTime = session.metadata?.isOneTime === 'true';

    if (!userId || !planType) {
      this.logger.error('Missing metadata in checkout session');
      return;
    }

    if (isOneTime) {
      if (planType === PlanType.MINUTES_PACK || planType === PlanType.SIMULATOR_PACK || planType === PlanType.AGENDA_MANAGER_PACK || planType === PlanType.ONBOARDING_PACK) {
        await this.addExtraPack(userId, planType);
      }
      return; // Done
    }

    // The subscription will be handled by the subscription.created webhook normally,
    // BUT we add this synchronous check to be robust against webhook failures.
    if (session.subscription && typeof session.subscription !== 'string') {
      const subscription = session.subscription as Stripe.Subscription;
      this.logger.log(`[SYNC] Creating subscription ${subscription.id} synchronously for user ${userId}`);

      await this.prisma.subscription.upsert({
        where: { userId: userId },
        update: {
          stripeSubscriptionId: subscription.id,
          status: subscription.status,
          planType: planType,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          updatedAt: new Date(),
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        },
        create: {
          userId: userId,
          stripeSubscriptionId: subscription.id,
          status: subscription.status,
          planType: planType,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        }
      });
      this.logger.log(`[SYNC] Subscription ${subscription.id} created/updated synchronously.`);
    }

    this.logger.log(`Checkout session completed for user ${userId} with plan ${planType}`);

    // Check if this was an initial payment (registration flow)
    const isInitialPayment = session.metadata?.isInitialPayment === 'true';

    // Activar usuario si el pago es exitoso, independientemente de si es inicial o reactivación
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (user && (user.status === 'INACTIVE' || user.status === 'PENDING_REVIEW' || user.status === 'DELETED')) {
      this.logger.log(`Activating user ${userId} after successful payment.`);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          status: 'ACTIVE',
          verified: true,
          verificationToken: null,
          updatedAt: new Date()
        }
      });

      // Send Welcome Email if it was an initial payment (optional check)
      if (isInitialPayment) {
        try {
          await this.emailService.sendWelcomeEmail(
            user.email,
            `${user.firstName} ${user.lastName}`,
            user.preferredLanguage
          );
        } catch (e) {
          this.logger.warn(`Could not send welcome email after payment activation: ${e.message}`);
        }
      }

      await this.auditService.log({
        userId: userId,
        action: AuditAction.UPDATE,
        resourceType: 'USER',
        resourceId: userId,
        details: 'Usuario activado tras pago exitoso',
        isSuccess: true,
      });
    }
  }

  // ... (rest)

  // Custom Demo update
  async createCheckoutSessionDemo(createCheckoutDto: CreateCheckoutSessionDto, userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isPack = createCheckoutDto.plan === 'minutes_pack' || createCheckoutDto.plan === 'simulator_pack' || createCheckoutDto.plan === 'agenda_manager_pack' || createCheckoutDto.plan === 'on_boarding_pack';

      // Planes demo hardcoded sin llamar a Stripe
      const demoPlans = {
        basic: { name: 'Plan Básico', amount: 2900, currency: 'eur', interval: 'month' },
        pro: { name: 'Plan Pro', amount: 5900, currency: 'eur', interval: 'month' },
        business: { name: 'Plan Business', amount: 12900, currency: 'eur', interval: 'month' },
        premium_plus: { name: 'Plan Premium Plus', amount: 9900, currency: 'eur', interval: 'month' },
        minutes_pack: { name: 'Pack Minutos', amount: 1500, currency: 'eur', interval: 'one-time' },
        simulator_pack: { name: 'Pack 10 Casos Clínicos', amount: 1500, currency: 'eur', interval: 'one-time' },
        agenda_manager_pack: { name: 'Pack Agenda Manager', amount: 1500, currency: 'eur', interval: 'one-time' },
        on_boarding_pack: { name: 'Pack On-boarding', amount: 5000, currency: 'eur', interval: 'one-time' }
      };

      const plan = demoPlans[createCheckoutDto.plan];
      if (!plan) {
        throw new BadRequestException('Invalid plan selected');
      }

      // Simular respuesta de Stripe para demo - usar URL local
      const mockSessionId = `cs_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // If pack, we might want to trigger the "success" logic immediately or via a special endpoint
      // For demo, we direct to success page which calls backend confirming payment?
      // Usually backend webhook does the work.
      // In demo mode, we might need a way to auto-apply via a "fake webhook" call.

      const mockUrl = `http://localhost:3000/dashboard/settings?section=billing&success=true`;
      // Note: In real production, stripe calls webhook. In Demo, we rely on manual triggering or just "it worked"

      this.logger.log(`Demo checkout session created for user ${user.email} - plan ${createCheckoutDto.plan}`);

      // AUTO-APPLY FOR DEMO ONLY (Immediate gratification)
      if (process.env.NODE_ENV !== 'production') {
        if (isPack) {
          let packId = createCheckoutDto.plan;
          await this.addExtraPack(userId, packId);
        } else {
          // Ensure user is active
          await this.prisma.user.update({
            where: { id: userId },
            data: { status: 'ACTIVE' }
          });

          // Simular suscripción activa
          await this.prisma.subscription.upsert({
            where: { userId: user.id },
            update: {
              status: 'active',
              planType: createCheckoutDto.plan,
              stripeSubscriptionId: `sub_demo_${Date.now()}`,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(new Date().setDate(new Date().getDate() + 30)),
              updatedAt: new Date(),
              canceledAt: null, // Reset canceled status
            },
            create: {
              userId: user.id,
              status: 'active',
              planType: createCheckoutDto.plan,
              stripeSubscriptionId: `sub_demo_${Date.now()}`,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(new Date().setDate(new Date().getDate() + 30)),
              canceledAt: null,
            }
          });

          await this.auditService.log({
            userId: user.id,
            action: AuditAction.SUBSCRIPTION_CHANGE,
            resourceType: 'SUBSCRIPTION',
            details: `Simulación Demo: Suscripción activada para ${createCheckoutDto.plan}`,
            isSuccess: true,
          });
        }
      }

      return {
        sessionId: mockSessionId,
        url: mockUrl,
        plan: {
          name: plan.name,
          amount: plan.amount,
          currency: plan.currency,
          interval: plan.interval,
        },
      };
    } catch (error) {
      this.logger.error('Error creating demo checkout session:', error);
      throw error;
    }
  }

  async forceSubscription(userId: string, planType: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      const fakeSubId = `sub_manual_${Date.now()}`;

      await this.prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
          status: 'active',
          planType: planType,
          stripeSubscriptionId: fakeSubId,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(new Date().setDate(new Date().getDate() + 30)),
          updatedAt: new Date(),
          canceledAt: null,
        },
        create: {
          userId: user.id,
          status: 'active',
          planType: planType,
          stripeSubscriptionId: fakeSubId,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(new Date().setDate(new Date().getDate() + 30)),
          canceledAt: null,
        }
      });

      if (user.status !== 'ACTIVE') {
        await this.prisma.user.update({
          where: { id: userId },
          data: { status: 'ACTIVE' }
        });
      }

      this.logger.log(`Forced subscription for user ${userId} to plan ${planType}`);

      await this.auditService.log({
        userId: userId,
        action: AuditAction.SUBSCRIPTION_CHANGE,
        resourceType: 'SUBSCRIPTION',
        resourceId: fakeSubId,
        details: `Suscripción forzada manualmente a ${planType}`,
        isSuccess: true,
      });

    } catch (error) {
      this.logger.error(`Error forcing subscription: ${error.message}`);
      throw error;
    }
  }

  // ... (rest)


  async createCustomer(createCustomerDto: CreateCustomerDto) {
    try {
      return await this.stripeService.createCustomer(
        createCustomerDto.email,
        createCustomerDto.name,
        createCustomerDto.metadata
      );
    } catch (error) {
      this.logger.error('Error creating customer:', error);
      throw error;
    }
  }

  async createPortalSession(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.stripeCustomerId) {
        throw new BadRequestException('User has no Stripe customer ID');
      }

      const session = await this.stripeService.createPortalSession(user.stripeCustomerId);

      return {
        url: session.url,
      };
    } catch (error) {
      this.logger.error('Error creating portal session:', error);
      throw error;
    }
  }

  async updateSubscription(updateSubscriptionDto: UpdateSubscriptionDto, userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (!user?.subscription) {
        throw new NotFoundException('No subscription found for user');
      }

      const newPlan = this.stripeService.getPlan(updateSubscriptionDto.newPlan, updateSubscriptionDto.interval);
      if (!newPlan) {
        throw new BadRequestException('Invalid plan selected');
      }

      let updatedSubscription;
      try {
        updatedSubscription = await this.stripeService.updateSubscription(
          user.subscription.stripeSubscriptionId,
          newPlan.priceId
        );
      } catch (stripeError) {
        this.logger.warn(`Could not update Stripe subscription (likely seeded/test ID). Falling back to local DB update only. Error: ${stripeError.message}`);
        // Mock success response for fallback
        updatedSubscription = {
          id: user.subscription.stripeSubscriptionId,
          status: 'active',
          items: { data: [{ price: { id: newPlan.priceId } }] }
        };
      }

      // Calculate new dates if available from Stripe, otherwise manual calculation for fallback
      let newPeriodStart = updatedSubscription.current_period_start
        ? new Date(updatedSubscription.current_period_start * 1000)
        : new Date();

      let newPeriodEnd = updatedSubscription.current_period_end
        ? new Date(updatedSubscription.current_period_end * 1000)
        : undefined;

      if (!newPeriodEnd) {
        // Fallback calculation
        const duration = updateSubscriptionDto.interval === 'year' ? 365 : 30;
        newPeriodEnd = new Date(newPeriodStart);
        newPeriodEnd.setDate(newPeriodEnd.getDate() + duration);
      }

      // Update subscription in database
      await this.prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          planType: updateSubscriptionDto.newPlan,
          currentPeriodStart: newPeriodStart,
          currentPeriodEnd: newPeriodEnd,
          updatedAt: new Date(),
        },
      });

      await this.auditService.log({
        userId: userId,
        action: AuditAction.SUBSCRIPTION_CHANGE,
        resourceType: 'SUBSCRIPTION',
        resourceId: user.subscription.id,
        details: `Suscripción actualizada a ${updateSubscriptionDto.newPlan}`,
        isSuccess: true,
      });

      return {
        subscription: updatedSubscription,
        plan: newPlan,
      };
    } catch (error) {
      this.logger.error('Error updating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (!user?.subscription) {
        throw new NotFoundException('No subscription found for user');
      }

      let canceledSubscription;
      if (user.subscription.stripeSubscriptionId.startsWith('sub_test_')) {
        this.logger.log(`Canceling fake subscription locally: ${user.subscription.stripeSubscriptionId}`);
        canceledSubscription = {
          id: user.subscription.stripeSubscriptionId,
          status: 'canceled',
          // Mock other fields as needed
        };
      } else {
        canceledSubscription = await this.stripeService.cancelSubscription(
          user.subscription.stripeSubscriptionId
        );
      }

      // Update subscription status in database
      await this.prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          status: 'canceled',
          canceledAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await this.auditService.log({
        userId: userId,
        action: AuditAction.SUBSCRIPTION_CHANGE,
        resourceType: 'SUBSCRIPTION',
        resourceId: user.subscription.id,
        details: `Suscripción cancelada`,
        isSuccess: true,
      });

      return {
        subscription: canceledSubscription,
      };
    } catch (error) {
      this.logger.error('Error canceling subscription:', error);
      throw error;
    }
  }

  async handleWebhook(signature: string, payload: any) {
    try {
      const event = await this.stripeService.constructWebhookEvent(payload, signature);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          this.logger.warn(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Webhook processing error:', error);
      throw error;
    }
  }



  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    const customer = subscription.customer as string;
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: customer },
    });

    if (!user) {
      this.logger.error(`User not found for customer ${customer}`);
      return;
    }

    // Extract plan type from subscription metadata or price ID
    const planType = this.getPlanTypeFromSubscription(subscription);

    const startTime = subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : new Date();
    const endTime = subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : new Date(startTime.getTime() + 30 * 24 * 60 * 60 * 1000);

    const safeStartTime = !isNaN(startTime.getTime()) ? startTime : new Date();
    const safeEndTime = !isNaN(endTime.getTime()) ? endTime : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Reactivate user if they were deleted/inactive
    if (user.status !== 'ACTIVE') {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { status: 'ACTIVE' }
      });
      this.logger.log(`User ${user.id} reactivated via subscription creation`);
    }

    await this.prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        planType,
        currentPeriodStart: safeStartTime,
        currentPeriodEnd: safeEndTime,
        updatedAt: new Date(),
        canceledAt: null, // Ensure cancellation is cleared if re-subscribing
      },
      create: {
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        planType,
        currentPeriodStart: safeStartTime,
        currentPeriodEnd: safeEndTime,
        canceledAt: null,
      },
    });

    this.logger.log(`Subscription created for user ${user.id}`);

    await this.auditService.log({
      userId: user.id,
      action: AuditAction.SUBSCRIPTION_CHANGE,
      resourceType: 'SUBSCRIPTION',
      resourceId: subscription.id,
      details: `Suscripción creada: ${planType}`,
      isSuccess: true,
    });

    // Enviar email de confirmación de suscripción
    try {
      await this.emailService.sendSubscriptionConfirmation(
        user.email,
        this.getPlanDisplayName(planType),
        user.preferredLanguage
      );
    } catch (emailError) {
      this.logger.warn(`Failed to send subscription confirmation email to ${user.email}: ${emailError.message}`);
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const customer = subscription.customer as string;
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: customer },
    });

    if (!user) {
      this.logger.error(`User not found for customer ${customer}`);
      return;
    }

    const planType = this.getPlanTypeFromSubscription(subscription);

    const startTime = subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : new Date();
    const endTime = subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : new Date(startTime.getTime() + 30 * 24 * 60 * 60 * 1000);

    const safeStartTime = !isNaN(startTime.getTime()) ? startTime : new Date();
    const safeEndTime = !isNaN(endTime.getTime()) ? endTime : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Reactivate user if they were deleted/inactive (e.g. renewal after expiry/deletion)
    if (user.status !== 'ACTIVE' && subscription.status === 'active') {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { status: 'ACTIVE' }
      });
      this.logger.log(`User ${user.id} reactivated via subscription update`);
    }

    await this.prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: subscription.status,
        planType,
        currentPeriodStart: safeStartTime,
        currentPeriodEnd: safeEndTime,
        updatedAt: new Date(),
        canceledAt: null, // Reset canceled status on update/renewal
      },
    });

    // Only log if status is meaningful or plan changed.
    await this.auditService.log({
      userId: user.id,
      action: AuditAction.SUBSCRIPTION_CHANGE,
      resourceType: 'SUBSCRIPTION',
      resourceId: subscription.id,
      details: `Suscripción actualizada: ${planType} (${subscription.status})`,
      isSuccess: true,
    });

    this.logger.log(`Subscription updated for user ${user.id}`);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const customer = subscription.customer as string;
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: customer },
    });

    if (!user) {
      this.logger.error(`User not found for customer ${customer}`);
      return;
    }

    await this.prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Subscription deleted for user ${user.id}`);

    await this.auditService.log({
      userId: user.id,
      action: AuditAction.SUBSCRIPTION_CHANGE,
      resourceType: 'SUBSCRIPTION',
      resourceId: subscription.id,
      details: `Suscripción finalizada/eliminada por Stripe`,
      isSuccess: true,
    });

    // Enviar email de cancelación
    try {
      await this.emailService.sendSubscriptionCancellation(user.email, user.preferredLanguage);
    } catch (emailError) {
      this.logger.warn(`Failed to send cancellation email to ${user.email}: ${emailError.message}`);
    }
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    // Handle successful payment - could update payment history, send confirmation emails, etc.
    this.logger.log(`Payment succeeded for invoice ${invoice.id}`);

    // Reset usage limits on successful payment (Subscription Renewal)
    if (invoice.subscription) {
      try {
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

        if (customerId) {
          const user = await this.prisma.user.findFirst({
            where: { stripeCustomerId: customerId }
          });

          if (user) {
            await this.prisma.user.update({
              where: { id: user.id },
              data: {
                transcriptionMinutesUsed: 0,
                simulatorMinutesUsed: 0,
                simulatorUsageCount: 0,
                simulatorLastReset: new Date(),
                transcriptionWarningSent: false,
                simulatorWarningSent: false,
                clientWarningSent: false,
                reportWarningSent: false
              }
            });
            this.logger.log(`Reset usage limits for user ${user.id} after successful payment.`);

            // Send Real-time Notification
            try {
              await this.notificationsService.create({
                userId: user.id,
                title: 'notifications.payment.success.title',
                message: 'notifications.payment.success.message',
                type: 'SUCCESS'
              });

              // AUDIT LOG
              await this.auditService.log({
                userId: user.id,
                action: AuditAction.SUBSCRIPTION_CHANGE,
                resourceType: 'PAYMENT',
                resourceId: invoice.id,
                details: `Pago de factura exitoso (${invoice.amount_paid / 100} ${invoice.currency})`,
                isSuccess: true,
                metadata: {
                  status: invoice.status,
                  invoiceId: invoice.id,
                  amount: invoice.amount_paid
                }
              });

            } catch (notifyError) {
              this.logger.warn(`Failed to send payment notification: ${notifyError.message}`);
            }
          }
        }
      } catch (error) {
        this.logger.error(`Failed to reset usage limits for invoice ${invoice.id}:`, error);
      }
    }
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    // Handle failed payment - could notify user, update subscription status, etc.
    this.logger.log(`Payment failed for invoice ${invoice.id}`);

    try {
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

      if (customerId) {
        const user = await this.prisma.user.findFirst({
          where: { stripeCustomerId: customerId }
        });

        if (user) {
          // Send Real-time Notification
          await this.notificationsService.create({
            userId: user.id,
            title: 'notifications.payment.failed.title',
            message: 'notifications.payment.failed.message',
            type: 'ERROR'
          });

          // AUDIT LOG
          await this.auditService.log({
            userId: user.id,
            action: AuditAction.SUBSCRIPTION_CHANGE,
            resourceType: 'PAYMENT',
            resourceId: invoice.id,
            details: `Fallo en pago de factura`,
            isSuccess: false,
            metadata: {
              status: invoice.status,
              invoiceId: invoice.id
            }
          });
        }
      }
    } catch (error) {
      this.logger.error(`Failed to handle invoice payment failure notification: ${error.message}`);
    }
  }

  private getPlanTypeFromSubscription(subscription: Stripe.Subscription): PlanType {
    const plans = this.stripeService.getPlans();
    const priceId = subscription.items.data[0]?.price.id;

    for (const [planName, planConfig] of Object.entries(plans)) {
      if (planConfig.priceId === priceId) {
        return planName as PlanType;
      }
    }

    // Default to basic if not found
    return PlanType.BASIC;
  }

  async getSubscriptionStatus(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.subscription) {
        return {
          hasSubscription: false,
          plan: null,
          status: null,
        };
      }

      const plan = this.stripeService.getPlan(user.subscription.planType);

      return {
        hasSubscription: true,
        plan: {
          type: user.subscription.planType,
          name: plan?.name,
          features: plan?.features,
        },
        status: user.subscription.status,
        currentPeriodStart: user.subscription.currentPeriodStart,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
        canceledAt: user.subscription.canceledAt,
      };
    } catch (error) {
      this.logger.error('Error getting subscription status:', error);
      throw error;
    }
  }

  getAvailablePlans() {
    const plans = this.stripeService.getPlans();

    return Object.entries(plans).map(([key, plan]) => ({
      type: key,
      name: plan.name,
      amount: plan.amount,
      currency: plan.currency,
      interval: plan.interval,
      features: plan.features,
      priceId: plan.priceId,
    }));
  }



  private getPlanDisplayName(planType: PlanType): string {
    const plans = this.stripeService.getPlans();
    return plans[planType]?.name || planType;
  }

  async simulatePaymentSuccess(userId: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Simulation only available in dev mode');
    }

    this.logger.log(`Simulating payment success for user ${userId}`);

    // Reset usage limits
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        transcriptionMinutesUsed: 0,
        simulatorMinutesUsed: 0,
        simulatorUsageCount: 0,
        simulatorLastReset: new Date(),
        transcriptionWarningSent: false,
        simulatorWarningSent: false,
        clientWarningSent: false,
        reportWarningSent: false
      }
    });

    // Send Notification
    await this.notificationsService.create({
      userId: userId,
      title: 'Pago Recibido (Simulado) 💳',
      message: `Tu suscripción se ha renovado correctamente.`,
      type: 'SUCCESS'
    });

    // AUDIT LOG
    await this.auditService.log({
      userId: userId,
      action: AuditAction.SUBSCRIPTION_CHANGE,
      resourceType: 'PAYMENT',
      resourceId: 'simulation',
      details: `Simulación de pago exitoso (Dev Mode)`,
      isSuccess: true
    });

    return { success: true, message: 'Payment simulation triggered' };
  }
}