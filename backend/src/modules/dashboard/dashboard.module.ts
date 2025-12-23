import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ClientsModule } from '../clients/clients.module';
import { EncryptionModule } from '../encryption/encryption.module';

import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [PrismaModule, ClientsModule, EncryptionModule, AuthModule],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
