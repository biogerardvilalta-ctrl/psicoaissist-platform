import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { UsageLimitsService } from './usage-limits.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import stripeConfig from '../../config/stripe.config';

@Module({
  imports: [
    ConfigModule.forFeature(stripeConfig),
    PrismaModule,
    EmailModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeService, UsageLimitsService],
  exports: [PaymentsService, StripeService, UsageLimitsService],
})
export class PaymentsModule {}