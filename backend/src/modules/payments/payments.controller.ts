import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Patch,
  Delete,
  RawBodyRequest,
  Req,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
  UseInterceptors
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaymentsService } from './payments.service';
import { UsageLimitsService } from './usage-limits.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeatureGuard, RequireFeature } from '../auth/guards/feature.guard';
import {
  CreateCheckoutSessionDto,
  CreateCustomerDto,
  UpdateSubscriptionDto,
  PlanType
} from './dto/payments.dto';
import { Request } from 'express';
import { PrismaService } from '../../common/prisma/prisma.service';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly usageLimitsService: UsageLimitsService,
    private readonly prisma: PrismaService,
  ) { }

  @ApiOperation({ summary: 'getPlans' })
  @ApiResponse({ status: 200, description: 'Success' })
  @UseInterceptors(CacheInterceptor)
  @CacheKey('payments_plans')
  @CacheTTL(300)
  @Get('plans')
  async getPlans() {
    return this.paymentsService.getAvailablePlans();
  }


  @Post('simulate-success')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async simulateSuccess(@Body() body: { userId: string }) {
    return this.paymentsService.simulatePaymentSuccess(body.userId);
  }

  @Post('create-checkout-session-demo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PSYCHOLOGIST, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async createCheckoutSessionDemo(
    @Body() createCheckoutDto: CreateCheckoutSessionDto,
    @Req() req: any,
  ) {
    // Endpoint para testing/demo
    console.log('Demo checkout session requested:', createCheckoutDto);

    return this.paymentsService.createCheckoutSessionDemo(
      createCheckoutDto,
      req.user.id,
    );
  }

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PSYCHOLOGIST, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async createCheckoutSession(
    @Body() createCheckoutDto: CreateCheckoutSessionDto,
    @Req() req: any,
  ) {
    return this.paymentsService.createCheckoutSession(
      createCheckoutDto,
      req.user.id,
    );
  }

  @Post('verify-session')
  @UseGuards(JwtAuthGuard)
  async verifySession(@Body() body: { sessionId: string }, @Req() req: any) {
    return this.paymentsService.verifyCheckoutSession(body.sessionId, req.user.id);
  }

  @ApiOperation({ summary: 'createInitialCheckoutSession' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Post('checkout/initial')
  async createInitialCheckoutSession(
    @Body() body: { userId: string; plan: string; interval: string },
  ) {
    // Validate that userId exists and is in a valid registration state
    if (!body.userId || !body.plan || !body.interval) {
      throw new BadRequestException('userId, plan, and interval are required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: body.userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new BadRequestException('Invalid user');
    }

    // Only allow checkout for users in registration flow (INACTIVE + verified)
    if (user.subscription && user.subscription.status === 'active') {
      throw new BadRequestException('User already has an active subscription');
    }

    return this.paymentsService.createInitialCheckoutSession(
      body.userId,
      body.plan,
      body.interval,
    );
  }

  @Post('create-customer')
  @UseGuards(JwtAuthGuard)
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return this.paymentsService.createCustomer(createCustomerDto);
  }

  @Post('create-portal-session')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PSYCHOLOGIST, UserRole.PSYCHOLOGIST_BASIC, UserRole.PSYCHOLOGIST_PRO, UserRole.PSYCHOLOGIST_PREMIUM)
  async createPortalSession(@Req() req: any) {
    return this.paymentsService.createPortalSession(req.user.id);
  }

  @Patch('subscription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PSYCHOLOGIST, UserRole.PSYCHOLOGIST_BASIC, UserRole.PSYCHOLOGIST_PRO, UserRole.PSYCHOLOGIST_PREMIUM)
  async updateSubscription(
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Req() req: any,
  ) {
    return this.paymentsService.updateSubscription(
      updateSubscriptionDto,
      req.user.id,
    );
  }

  @Delete('subscription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PSYCHOLOGIST, UserRole.PSYCHOLOGIST_BASIC, UserRole.PSYCHOLOGIST_PRO, UserRole.PSYCHOLOGIST_PREMIUM)
  async cancelSubscription(@Req() req: any) {
    return this.paymentsService.cancelSubscription(req.user.id);
  }

  @Get('subscription-status')
  @UseGuards(JwtAuthGuard)
  async getSubscriptionStatus(@Req() req: any) {
    return this.paymentsService.getSubscriptionStatus(req.user.id);
  }

  @Get('usage')
  @UseGuards(JwtAuthGuard)
  async getUserUsage(@Req() req: any) {
    return this.usageLimitsService.getUserUsage(req.user.id);
  }

  // Example of feature-gated endpoint
  @Get('advanced-analytics')
  @UseGuards(JwtAuthGuard, FeatureGuard)
  @RequireFeature('advancedAnalytics')
  async getAdvancedAnalytics(@Req() req: any) {
    // This endpoint is only accessible to Pro and Premium users
    return { message: 'Advanced analytics data', userId: req.user.id };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    console.log('🔔 Webhook received');
    try {
      // Check if signature is present
      if (!signature) {
        console.error('❌ Missing stripe-signature header');
        throw new BadRequestException('Missing stripe-signature header');
      }

      console.log(`📝 Signature: ${signature.substring(0, 10)}...`);
      // Check raw body availability
      if (!req.rawBody) {
        console.error('❌ Raw body not available. Ensure "rawBody: true" is set in main.ts');
        throw new InternalServerErrorException('Raw body missing');
      }

      const result = await this.paymentsService.handleWebhook(
        signature,
        req.rawBody
      );
      console.log('✅ Webhook processed successfully');
      return result;
    } catch (error) {
      console.error('❌ Webhook processing failed:', error.message);
      if (error.type) console.error('Stripe Error Type:', error.type);
      throw error;
    }
  }
}