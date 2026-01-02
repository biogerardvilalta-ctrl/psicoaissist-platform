import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
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
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private emailService: EmailService,
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

      // Check if user already has an active subscription
      if (user.subscription?.status === 'active') {
        throw new BadRequestException('User already has an active subscription');
      }

      const plan = this.stripeService.getPlan(createCheckoutDto.plan, createCheckoutDto.interval);
      if (!plan) {
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

        // Update user with Stripe customer ID
        await this.prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId },
        });
      }

      // Create checkout session
      const session = await this.stripeService.createCheckoutSession(
        plan.priceId,
        stripeCustomerId,
        {
          userId: user.id,
          planType: createCheckoutDto.plan,
          ...createCheckoutDto.metadata,
        }
      );

      return {
        sessionId: session.id,
        url: session.url,
        plan: {
          name: plan.name,
          amount: plan.amount,
          currency: plan.currency,
          interval: plan.interval,
        },
      };
    } catch (error) {
      this.logger.error('Error creating checkout session:', error);
      throw error;
    }
  }

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

      const newPlan = this.stripeService.getPlan(updateSubscriptionDto.newPlan);
      if (!newPlan) {
        throw new BadRequestException('Invalid plan selected');
      }

      const updatedSubscription = await this.stripeService.updateSubscription(
        user.subscription.stripeSubscriptionId,
        newPlan.priceId
      );

      // Update subscription in database
      await this.prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          planType: updateSubscriptionDto.newPlan,
          updatedAt: new Date(),
        },
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

      const canceledSubscription = await this.stripeService.cancelSubscription(
        user.subscription.stripeSubscriptionId
      );

      // Update subscription status in database
      await this.prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          status: 'canceled',
          canceledAt: new Date(),
          updatedAt: new Date(),
        },
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

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const planType = session.metadata?.planType as PlanType;

    if (!userId || !planType) {
      this.logger.error('Missing metadata in checkout session');
      return;
    }

    // The subscription will be handled by the subscription.created webhook
    this.logger.log(`Checkout session completed for user ${userId} with plan ${planType}`);
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

    await this.prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        planType,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        planType,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    this.logger.log(`Subscription created for user ${user.id}`);

    // Enviar email de confirmación de suscripción
    try {
      await this.emailService.sendSubscriptionConfirmation(
        user.email,
        this.getPlanDisplayName(planType)
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

    await this.prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: subscription.status,
        planType,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date(),
      },
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

    // Enviar email de cancelación
    try {
      await this.emailService.sendSubscriptionCancellation(user.email);
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
              }
            });
            this.logger.log(`Reset usage limits for user ${user.id} after successful payment.`);
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

  // Método demo para testing sin Stripe real
  async createCheckoutSessionDemo(createCheckoutDto: CreateCheckoutSessionDto, userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Planes demo hardcoded sin llamar a Stripe
      const demoPlans = {
        basic: { name: 'Plan Básico', amount: 2900, currency: 'eur', interval: 'month' },
        pro: { name: 'Plan Pro', amount: 5900, currency: 'eur', interval: 'month' },
        business: { name: 'Plan Business', amount: 12900, currency: 'eur', interval: 'month' },
        premium_plus: { name: 'Plan Premium Plus', amount: 9900, currency: 'eur', interval: 'month' }
      };

      const plan = demoPlans[createCheckoutDto.plan];
      if (!plan) {
        throw new BadRequestException('Invalid plan selected');
      }

      // Simular respuesta de Stripe para demo - usar URL local
      const mockSessionId = `cs_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const mockUrl = `http://localhost:3000/payment/success?session_id=${mockSessionId}&plan=${createCheckoutDto.plan}`;

      this.logger.log(`Demo checkout session created for user ${user.email} - plan ${createCheckoutDto.plan}`);

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

  private getPlanDisplayName(planType: PlanType): string {
    const plans = this.stripeService.getPlans();
    return plans[planType]?.name || planType;
  }
}