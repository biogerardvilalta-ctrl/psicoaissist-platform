import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
  Delete,
  RawBodyRequest
} from '@nestjs/common';
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

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly usageLimitsService: UsageLimitsService,
  ) { }

  @Get('plans')
  async getPlans() {
    return this.paymentsService.getAvailablePlans();
  }

  @Get('test')
  async testEndpoint() {
    return { message: 'Payments controller working!', timestamp: new Date().toISOString() };
  }

  @Post('simulate-success')
  @UseGuards(JwtAuthGuard)
  async simulateSuccess(@Body() body: { userId: string }) {
    return this.paymentsService.simulatePaymentSuccess(body.userId);
  }

  @Post('create-checkout-session-demo')
  async createCheckoutSessionDemo(
    @Body() createCheckoutDto: CreateCheckoutSessionDto,
  ) {
    // Endpoint temporal para testing sin autenticación
    console.log('Demo checkout session requested:', createCheckoutDto);

    // Usar un usuario real de la base de datos para el demo
    // Podemos usar el admin o cualquier usuario de los seeded
    const demoUserId = 'cmj66cjcg0000ojxfyrhpepoh'; // admin@psychoai.com del seed

    return this.paymentsService.createCheckoutSessionDemo(
      createCheckoutDto,
      demoUserId,
    );
  }

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PSYCHOLOGIST, UserRole.PSYCHOLOGIST_BASIC, UserRole.PSYCHOLOGIST_PRO, UserRole.PSYCHOLOGIST_PREMIUM)
  async createCheckoutSession(
    @Body() createCheckoutDto: CreateCheckoutSessionDto,
    @Req() req: any,
  ) {
    return this.paymentsService.createCheckoutSession(
      createCheckoutDto,
      req.user.id,
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
    return this.paymentsService.handleWebhook(
      signature,
      req.rawBody || req.body,
    );
  }
}