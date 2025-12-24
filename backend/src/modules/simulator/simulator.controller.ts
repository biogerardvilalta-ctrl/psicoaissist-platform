import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { SimulatorService, PatientProfile } from './simulator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { IsString, IsEnum, IsArray, IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class StartSimulationDto {
    @IsEnum(['easy', 'medium', 'hard'])
    @IsNotEmpty()
    difficulty: 'easy' | 'medium' | 'hard';
}

class ChatDto {
    @IsString()
    @IsNotEmpty()
    message: string;

    @IsArray()
    @IsNotEmpty()
    history: { role: 'user' | 'model'; parts: string }[];

    @IsObject()
    @IsNotEmpty()
    profile: PatientProfile;
}

class EndSimulationDto {
    @IsArray()
    @IsNotEmpty()
    history: { role: 'user' | 'model'; parts: string }[];
}

@Controller('simulator')
@UseGuards(JwtAuthGuard)
export class SimulatorController {
    constructor(private readonly simulatorService: SimulatorService) { }

    @Post('start')
    async start(@Body() dto: StartSimulationDto) {
        return this.simulatorService.generateCase(dto.difficulty);
    }

    @Post('chat')
    async chat(@Body() dto: ChatDto) {
        // Note: In a real app, we should validate 'profile' matches a cached session to prevent manipulation,
        // but for this MVP, passing it back is fine.
        return {
            response: await this.simulatorService.chat(dto.history, dto.message, dto.profile)
        };
    }

    @Post('evaluate')
    async evaluate(@Body() dto: EndSimulationDto) {
        return this.simulatorService.evaluate(dto.history);
    }
}
