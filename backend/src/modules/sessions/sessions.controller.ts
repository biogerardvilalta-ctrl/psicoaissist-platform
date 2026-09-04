
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { CreateSessionDto, UpdateSessionDto } from './dto/sessions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';
// import { Roles } from '../../auth/decorators/roles.decorator';
// import { RolesGuard } from '../../auth/guards/roles.guard';

@ApiTags('Sessions')
@ApiBearerAuth()
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

    @ApiOperation({ summary: 'Crear una nueva sesión' })
    @ApiResponse({ status: 201, description: 'Sesión creada exitosamente' })
    @Post()
    create(@Request() req, @Body() createSessionDto: CreateSessionDto) {
        return this.sessionsService.create(req.user.id, createSessionDto);
    }

    @ApiOperation({ summary: 'Listar todas las sesiones' })
    @ApiResponse({ status: 200, description: 'Lista de sesiones' })
    @Get()
    findAll(@Request() req, @Query() query: any) {
        return this.sessionsService.findAll(req.user, query);
    }

    @ApiOperation({ summary: 'Obtener sesiones por rango de fechas (Calendario)' })
    @ApiResponse({ status: 200, description: 'Sesiones en el rango' })
    @Get('calendar')
    findByDateRange(@Request() req, @Query('start') start: string, @Query('end') end: string, @Query('professionalId') professionalId?: string) {
        return this.sessionsService.findByDateRange(req.user, start, end, professionalId);
    }

    @ApiOperation({ summary: 'Obtener disponibilidad del profesional' })
    @ApiResponse({ status: 200, description: 'Horarios disponibles' })
    @Get('availability')
    getAvailability(@Request() req, @Query('date') date: string, @Query('professionalId') professionalId?: string) {
        return this.sessionsService.getAvailability(req.user.id, date, professionalId);
    }

    @ApiOperation({ summary: 'Obtener detalle de una sesión' })
    @ApiResponse({ status: 200, description: 'Detalle de la sesión' })
    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.sessionsService.findOne(id, req.user.id);
    }

    @ApiOperation({ summary: 'Actualizar una sesión' })
    @ApiResponse({ status: 200, description: 'Sesión actualizada' })
    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
        return this.sessionsService.update(id, req.user.id, updateSessionDto);
    }

    @ApiOperation({ summary: 'Eliminar una sesión' })
    @ApiResponse({ status: 200, description: 'Sesión eliminada' })
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.sessionsService.remove(id, req.user.id);
    }

    @ApiOperation({ summary: 'Crear videollamada para la sesión' })
    @ApiResponse({ status: 201, description: 'Videollamada iniciada' })
    @Post(':id/video-call')
    createVideoCall(@Request() req, @Param('id') id: string) {
        return this.sessionsService.createVideoCall(id, req.user.id);
    }

}
