import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
    imports: [PrismaModule, EncryptionModule, PaymentsModule],
    controllers: [ClientsController],
    providers: [ClientsService],
    exports: [ClientsService],
})
export class ClientsModule { }
