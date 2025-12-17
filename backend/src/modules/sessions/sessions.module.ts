import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SessionsGateway } from './sessions.gateway';
import { EncryptionModule } from '../encryption/encryption.module';
import { AiModule } from '../ai/ai.module';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
    imports: [EncryptionModule, PrismaModule, AiModule],
    controllers: [SessionsController],
    providers: [SessionsService, SessionsGateway],
    exports: [SessionsService],
})
export class SessionsModule { }
