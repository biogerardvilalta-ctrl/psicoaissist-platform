import { Module, Global } from '@nestjs/common';
import { AuditService } from './audit.service';
import { EncryptionModule } from '../encryption/encryption.module';
import { AuditController } from './audit.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Global()
@Module({
    imports: [PrismaModule, EncryptionModule],
    controllers: [AuditController],
    providers: [AuditService],
    exports: [AuditService],
})
export class AuditModule { }
