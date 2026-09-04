import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { BackupService } from './backup.service';
import { UsersModule } from '../users/users.module';
import { PaymentsModule } from '../payments/payments.module';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    UsersModule,
    PaymentsModule,
    PrismaModule,
    NotificationsModule,
    EmailModule,
  ],
  controllers: [AdminController],
  providers: [BackupService],
})
export class AdminModule { }