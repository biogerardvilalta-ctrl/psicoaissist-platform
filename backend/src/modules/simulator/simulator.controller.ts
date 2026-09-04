import { Controller, Post, Get, Body, UseGuards, Request, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SimulatorService, PatientProfile } from './simulator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

import { IsString, IsEnum, IsArray, IsNotEmpty, IsObject, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class StartSimulationDto {
    @IsEnum(['easy', 'medium', 'hard'])
    @IsNotEmpty()
    difficulty: 'easy' | 'medium' | 'hard';

    @IsOptional()
    showNonVerbalCues?: boolean;

    @IsString()
    @IsOptional()
    language?: string;
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

    @IsString()
    @IsOptional()
    language?: string;
}

class EndSimulationDto {
    @IsArray()
    @IsNotEmpty()
    history: { role: 'user' | 'model'; parts: string }[];

    @IsObject()
    @IsNotEmpty()
    profile: PatientProfile;

    @IsOptional()
    durationSeconds?: number;

    @IsString()
    @IsOptional()
    language?: string;
}

@ApiTags('Simulator')
@ApiBearerAuth()
@Controller('simulator')
@UseGuards(JwtAuthGuard)
export class SimulatorController {
    constructor(private readonly simulatorService: SimulatorService) {
        console.log("✅✅✅ SIMULATOR CONTROLLER LOADED (V3) ✅✅✅");
    }

    @ApiOperation({ summary: 'Iniciar un nuevo caso clínico simulado' })
    @ApiResponse({ status: 201, description: 'Caso simulado generado' })
    @Post('start')
    async start(@Body() dto: StartSimulationDto, @Request() req) {
        return this.simulatorService.generateCase(req.user.id, dto.difficulty, dto.showNonVerbalCues, dto.language);
    }

    @ApiOperation({ summary: 'Interactuar con el paciente simulado' })
    @ApiResponse({ status: 200, description: 'Respuesta del paciente' })
    @Post('chat')
    async chat(@Body() dto: ChatDto, @Request() req) {
        // Note: In a real app, we should validate 'profile' matches a cached session to prevent manipulation,
        // but for this MVP, passing it back is fine.
        return {
            response: await this.simulatorService.chat(dto.history, dto.message, dto.profile, req.user.id, dto.language)
        };
    }

    @ApiOperation({ summary: 'Finalizar y evaluar la simulación' })
    @ApiResponse({ status: 201, description: 'Evaluación de la sesión' })
    @Post('evaluate')
    async evaluate(@Body() dto: EndSimulationDto, @Request() req) {
        return this.simulatorService.evaluate(dto.history, req.user.id, dto.profile, dto.durationSeconds, dto.language);
    }

    @ApiOperation({ summary: 'Obtener informes de simulaciones pasadas' })
    @ApiResponse({ status: 200, description: 'Lista de informes de simulación' })
    @Get('reports')
    async getReports(
        @Request() req,
        @Query('period') period?: string,
        @Query('patientName') patientName?: string,
        @Query('date') date?: string
    ) {
        return this.simulatorService.getReports(req.user.id, { period, patientName, date });
    }

    @ApiOperation({ summary: 'Obtener estadísticas del simulador' })
    @ApiResponse({ status: 200, description: 'Estadísticas del simulador' })
    @Get('stats')
    async getStats(
        @Request() req,
        @Query('period') period?: string
    ) {
        return this.simulatorService.getStats(req.user.id, period);
    }

    // === PUBLIC DEMO ROUTES ===

    @ApiOperation({ summary: 'Iniciar un caso clínico de prueba (Demo pública)' })
    @ApiResponse({ status: 200, description: 'Caso de demo generado' })
    @Public()
    @Throttle({ default: { ttl: 60000, limit: 5 } })
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

    @ApiOperation({ summary: 'Interactuar en la demo pública' })
    @ApiResponse({ status: 201, description: 'Respuesta del paciente (Demo)' })
    @Public()
    @Throttle({ default: { ttl: 60000, limit: 3 } })
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
