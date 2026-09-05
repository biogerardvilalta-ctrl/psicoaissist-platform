
import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { GoogleService } from './google.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport'; // Or use your own Guard
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Google')
@ApiBearerAuth()
@Controller('google')
@UseGuards(AuthGuard('jwt'))
export class GoogleController {
    constructor(private readonly googleService: GoogleService) { }

    @ApiOperation({ summary: 'Obtener URL de autorización de Google' })
    @ApiResponse({ status: 200, description: 'URL obtenida' })
    @Get('auth-url')
    getAuthUrl() {
        return { url: this.googleService.getAuthUrl() };
    }

    @ApiOperation({ summary: 'Manejar callback de autorización de Google' })
    @ApiResponse({ status: 201, description: 'Callback manejado correctamente' })
    @Post('callback')
    async callback(@Body('code') code: string, @Request() req) {
        return this.googleService.handleAuthCallback(code, req.user.id);
    }

    @ApiOperation({ summary: 'Obtener eventos del calendario de Google' })
    @ApiResponse({ status: 200, description: 'Eventos obtenidos' })
    @Get('events')
    async getEvents(
        @Request() req,
        @Query('start') start: string,
        @Query('end') end: string
    ) {
        const startDate = start ? new Date(start) : new Date();
        const endDate = end ? new Date(end) : new Date(new Date().setDate(new Date().getDate() + 7));

        return this.googleService.listEvents(req.user.id, startDate, endDate);
    }
}
