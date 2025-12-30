import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto, ClientResponseDto, CreateClientEncryptedDto } from './dto/clients.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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
    create(@Req() req: Request & { user: any }, @Body() createClientDto: CreateClientDto | CreateClientEncryptedDto) {
        return this.clientsService.create(req.user.id, createClientDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos los clientes activos del usuario' })
    @ApiResponse({ status: 200, type: [ClientResponseDto] })
    @ApiQuery({ name: 'active', required: false, type: Boolean })
    @ApiQuery({ name: 'professionalId', required: false, type: String })
    findAll(@Req() req: Request & { user: any }, @Query('active') active?: string, @Query('professionalId') professionalId?: string) {
        // active defaults to true if not provided. string 'false' becomes boolean false.
        const isActive = active === undefined ? true : active === 'true';
        return this.clientsService.findAll(req.user.id, isActive, professionalId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalle de un cliente' })
    @ApiResponse({ status: 200, type: ClientResponseDto })
    findOne(@Req() req: Request & { user: any }, @Param('id') id: string) {
        return this.clientsService.findOne(req.user.id, id);
    }

    @Delete('permanent/:id')
    @ApiOperation({ summary: 'Eliminar definitivamente cliente (irreversible)' })
    @ApiResponse({ status: 200 })
    async deletePermanent(@Req() req: Request & { user: any }, @Param('id') id: string) {
        await this.clientsService.deletePermanent(req.user.id, id);
        return { message: 'Cliente eliminado definitivamente' };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar (desactivar) cliente' })
    @ApiResponse({ status: 200 })
    async remove(@Req() req: Request & { user: any }, @Param('id') id: string) {
        await this.clientsService.remove(req.user.id, id);
        return { message: 'Cliente archivado correctamente' };
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar información del cliente' })
    @ApiResponse({ status: 200, type: ClientResponseDto })
    update(@Req() req: Request & { user: any }, @Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
        return this.clientsService.update(req.user.id, id, updateClientDto);
    }
}
