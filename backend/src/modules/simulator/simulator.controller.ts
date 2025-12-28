import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { SimulatorService, PatientProfile } from './simulator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

import { IsString, IsEnum, IsArray, IsNotEmpty, IsObject, ValidateNested, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class StartSimulationDto {
    @IsEnum(['easy', 'medium', 'hard'])
    @IsNotEmpty()
    difficulty: 'easy' | 'medium' | 'hard';

    @IsBoolean()
    @IsOptional()
    includeNonVerbal?: boolean;
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

    @IsObject()
    @IsNotEmpty()
    profile: PatientProfile;
}

@Controller('simulator')
@UseGuards(JwtAuthGuard)
export class SimulatorController {
    constructor(private readonly simulatorService: SimulatorService) {
        console.log("✅✅✅ SIMULATOR CONTROLLER LOADED (V3) ✅✅✅");
    }

    @Post('start')
    async start(@Body() dto: StartSimulationDto, @Request() req) {
        return this.simulatorService.generateCase(req.user.id, dto.difficulty, dto.includeNonVerbal);
    }

    @Post('chat')
    async chat(@Body() dto: ChatDto, @Request() req) {
        // Note: In a real app, we should validate 'profile' matches a cached session to prevent manipulation,
        // but for this MVP, passing it back is fine.
        return {
            response: await this.simulatorService.chat(dto.history, dto.message, dto.profile, req.user.id)
        };
    }

    @Post('evaluate')
    async evaluate(@Body() dto: EndSimulationDto, @Request() req) {
        return this.simulatorService.evaluate(dto.history, req.user.id, dto.profile);
    }

    @Get('reports')
    async getReports(@Request() req) {
        return this.simulatorService.getReports(req.user.id);
    }

    @Get('stats')
    async getStats(@Request() req) {
        return this.simulatorService.getStats(req.user.id);
    }

    // === PUBLIC DEMO ROUTES ===

    @Public()
    @Get('demo/start')
    async startDemo() {
        // Hardcoded demo case to save AI costs and ensure quality
        return {
            name: "Marta R.",
            age: 28,
            condition: "Ansietat Social (Demo)",
            traits: ["Nerviosa", "Evitativa", "Autocrítica"],
            difficulty: 'medium',
            scenario: "Sénto molta ansietat quan he de parlar en les reunions de zoom de la feina. Tinc por que es noti que em tremola la veu."
        };
    }

    @Public()
    @Post('demo/chat')
    async chatDemo(@Body() dto: ChatDto) {
        // Limit history length strictly to prevent abuse
        if (dto.history.length > 6) {
            return "... (Límite de la demo alcanzado. Regístrate para continuar)";
        }

        return {
            response: await this.simulatorService.chat(dto.history, dto.message, dto.profile)
        };
    }
}
