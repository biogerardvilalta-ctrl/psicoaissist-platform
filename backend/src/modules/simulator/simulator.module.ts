import { Module } from '@nestjs/common';
import { SimulatorController } from './simulator.controller';
import { SimulatorService } from './simulator.service';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
    imports: [ConfigModule, AiModule, PrismaModule, PaymentsModule],
    controllers: [SimulatorController],
    providers: [SimulatorService],
    exports: [SimulatorService]
})
export class SimulatorModule { }
