import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { PaymentsModule } from '../payments/payments.module';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [
    UsersModule,
    PaymentsModule,
    PrismaModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}