import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
    imports: [PrismaModule, ClientsModule],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
