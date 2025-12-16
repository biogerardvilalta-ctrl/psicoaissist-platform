import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ClientsModule } from '../clients/clients.module';
import { EncryptionModule } from '../encryption/encryption.module';

@Module({
    imports: [PrismaModule, ClientsModule, EncryptionModule],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
