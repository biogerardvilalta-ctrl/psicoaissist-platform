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
  Delete
} from '@nestjs/common';
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
  ) {}

  @Get('plans')
  async getPlans() {
    return this.paymentsService.getAvailablePlans();
  }

  @Get('test')
  async testEndpoint() {
    return { message: 'Payments controller working!', timestamp: new Date().toISOString() };
  }

  @Post('create-checkout-session-demo')
  async createCheckoutSessionDemo(
    @Body() createCheckoutDto: CreateCheckoutSessionDto,
  ) {
    // Endpoint temporal para testing sin autenticación
    console.log('Demo checkout session requested:', createCheckoutDto);
    
    // Crear un usuario demo temporal
    const demoUserId = 'demo-user-id';

    return this.paymentsService.createCheckoutSession(
      createCheckoutDto,
      demoUserId,
    );
  }

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(
    @Body() createCheckoutDto: CreateCheckoutSessionDto,
    @Req() req: any,
  ) {
    return this.paymentsService.createCheckoutSession(
      createCheckoutDto,
      req.user.sub,
    );
  }

  @Post('create-customer')
  @UseGuards(JwtAuthGuard)
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return this.paymentsService.createCustomer(createCustomerDto);
  }

  @Post('create-portal-session')
  @UseGuards(JwtAuthGuard)
  async createPortalSession(@Req() req: any) {
    return this.paymentsService.createPortalSession(req.user.sub);
  }

  @Patch('subscription')
  @UseGuards(JwtAuthGuard)
  async updateSubscription(
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Req() req: any,
  ) {
    return this.paymentsService.updateSubscription(
      updateSubscriptionDto,
      req.user.sub,
    );
  }

  @Delete('subscription')
  @UseGuards(JwtAuthGuard)
  async cancelSubscription(@Req() req: any) {
    return this.paymentsService.cancelSubscription(req.user.sub);
  }

  @Get('subscription-status')
  @UseGuards(JwtAuthGuard)
  async getSubscriptionStatus(@Req() req: any) {
    return this.paymentsService.getSubscriptionStatus(req.user.sub);
  }

  @Get('usage')
  @UseGuards(JwtAuthGuard)
  async getUserUsage(@Req() req: any) {
    return this.usageLimitsService.getUserUsage(req.user.sub);
  }

  // Example of feature-gated endpoint
  @Get('advanced-analytics')
  @UseGuards(JwtAuthGuard, FeatureGuard)
  @RequireFeature('advancedAnalytics')
  async getAdvancedAnalytics(@Req() req: any) {
    // This endpoint is only accessible to Pro and Premium users
    return { message: 'Advanced analytics data', userId: req.user.sub };
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