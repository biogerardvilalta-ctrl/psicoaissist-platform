import { Module } from '@nestjs/common';
import { SimulatorController } from './simulator.controller';
import { SimulatorService } from './simulator.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    controllers: [SimulatorController],
    providers: [SimulatorService],
    exports: [SimulatorService]
})
export class SimulatorModule { }
