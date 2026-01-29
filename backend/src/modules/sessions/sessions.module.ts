import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SessionsGateway } from './sessions.gateway';
import { EncryptionModule } from '../encryption/encryption.module';
import { AiModule } from '../ai/ai.module';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { PaymentsModule } from '../payments/payments.module';
import { AuthModule } from '../auth/auth.module';

import { GoogleModule } from '../google/google.module';

import { NotificationsModule } from '../notifications/notifications.module';

import { EmailModule } from '../email/email.module';

@Module({
    imports: [EncryptionModule, PrismaModule, AiModule, GoogleModule, PaymentsModule, AuthModule, NotificationsModule, EmailModule],
    controllers: [SessionsController],
    providers: [SessionsService, SessionsGateway],
    exports: [SessionsService],
})
export class SessionsModule { }
