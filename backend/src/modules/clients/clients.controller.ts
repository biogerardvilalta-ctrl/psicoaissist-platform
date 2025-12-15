import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto, ClientResponseDto } from './dto/clients.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Post()
    @ApiOperation({ summary: 'Crear nuevo cliente/paciente' })
    @ApiResponse({ status: 201, type: ClientResponseDto })
    create(@Req() req: Request & { user: any }, @Body() createClientDto: CreateClientDto) {
        return this.clientsService.create(req.user.id, createClientDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos los clientes activos del usuario' })
    @ApiResponse({ status: 200, type: [ClientResponseDto] })
    findAll(@Req() req: Request & { user: any }) {
        return this.clientsService.findAll(req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalle de un cliente' })
    @ApiResponse({ status: 200, type: ClientResponseDto })
    findOne(@Req() req: Request & { user: any }, @Param('id') id: string) {
        return this.clientsService.findOne(req.user.id, id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar (desactivar) cliente' })
    @ApiResponse({ status: 200 })
    remove(@Req() req: Request & { user: any }, @Param('id') id: string) {
        return this.clientsService.remove(req.user.id, id);
    }
}
