import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  Logger,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateUserDto, UpdateUserDto, UserResponseDto, ChangeRoleDto, CreateAgendaManagerDto, LinkProfessionalDto } from './dto/users.dto';
import { UserRole } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) { }


  @ApiOperation({ summary: 'Crear nuevo usuario (solo administradores)' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente', type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.usersService.create(createUserDto);
      this.logger.log(`User created via admin: ${createUserDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Obtener todos los usuarios con paginación' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, description: 'Elementos por página' })
  @Roles(UserRole.ADMIN)
  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    try {
      return await this.usersService.findAll(page, limit);
    } catch (error) {
      this.logger.error(`Error fetching users: ${error.message}`);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.usersService.findOne(id);
    } catch (error) {
      this.logger.error(`Error fetching user: ${error.message}`);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const result = await this.usersService.update(id, updateUserDto);
      this.logger.log(`User updated: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Eliminar usuario (soft delete)' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const result = await this.usersService.remove(id);
      this.logger.log(`User deleted: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Actualizar layout del dashboard' })
  @ApiResponse({ status: 200, description: 'Layout actualizado', type: UserResponseDto })
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST, UserRole.PSYCHOLOGIST_BASIC, UserRole.PSYCHOLOGIST_PRO, UserRole.PSYCHOLOGIST_PREMIUM)
  @Patch(':id/dashboard-layout')
  async updateDashboardLayout(@Param('id') id: string, @Body() body: { layout: any }) {
    try {
      return await this.usersService.updateDashboardLayout(id, body.layout);
    } catch (error) {
      this.logger.error(`Error updating dashboard layout: ${error.message}`);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Cambiar rol de usuario' })
  @ApiResponse({ status: 200, description: 'Rol cambiado exitosamente', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Roles(UserRole.ADMIN)
  @Patch(':id/role')
  async changeRole(@Param('id') id: string, @Body() changeRoleDto: ChangeRoleDto) {
    try {
      const result = await this.usersService.changeRole(id, changeRoleDto.role);
      this.logger.log(`User role changed: ${id} -> ${changeRoleDto.role}`);
      return result;
    } catch (error) {
      this.logger.error(`Error changing user role: ${error.message}`);
      throw error;
    }
  }


  // --- Agenda Manager Endpoints ---

  @ApiOperation({ summary: 'Crear Agenda Manager (Solo Profesionales)' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @Roles(UserRole.PSYCHOLOGIST, UserRole.PSYCHOLOGIST_BASIC, UserRole.PSYCHOLOGIST_PRO, UserRole.PSYCHOLOGIST_PREMIUM)
  @Post('agenda-managers')
  async createAgendaManager(@Req() req: any, @Body() dto: CreateAgendaManagerDto) {
    return this.usersService.createAgendaManager(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Listar mis Agenda Managers' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  @Roles(UserRole.PSYCHOLOGIST, UserRole.PSYCHOLOGIST_BASIC, UserRole.PSYCHOLOGIST_PRO, UserRole.PSYCHOLOGIST_PREMIUM)
  @Get('me/agenda-managers')
  async getMyAgendaManagers(@Req() req: any) {
    return this.usersService.getAgendaManagers(req.user.id);
  }

  @ApiOperation({ summary: 'Eliminar Agenda Manager' })
  @Roles(UserRole.PSYCHOLOGIST, UserRole.PSYCHOLOGIST_BASIC, UserRole.PSYCHOLOGIST_PRO, UserRole.PSYCHOLOGIST_PREMIUM)
  @Delete('agenda-managers/:id')
  async deleteAgendaManager(@Req() req: any, @Param('id') id: string) {
    return this.usersService.deleteAgendaManager(req.user.id, id);
  }

  @ApiOperation({ summary: 'Obtener profesionales gestionados (Para Agenda Manager)' })
  @Roles(UserRole.AGENDA_MANAGER)
  @Get('me/managed-professionals')
  async getManagedProfessionals(@Req() req: any) {
    return this.usersService.getLinkedProfessionals(req.user.id);
  }

  @ApiOperation({ summary: 'Vincular profesional a Agenda Manager' })
  @Roles(UserRole.PSYCHOLOGIST, UserRole.PSYCHOLOGIST_BASIC, UserRole.PSYCHOLOGIST_PRO, UserRole.PSYCHOLOGIST_PREMIUM) // Who can do this? The professional linking themselves? Or the owner? Assuming the professional wants to add themselves to a manager.
  @Post('agenda-managers/:id/link')
  async linkProfessional(@Req() req: any, @Param('id') managerId: string) {
    // A professional links THEMSELVES to an existing manager (e.g. by invitation code in future, but for now direct link)
    // Or maybe the owner links another professional?
    // Let's assume the logged in professional is linking themselves to the manager.
    return this.usersService.linkProfessional(managerId, req.user.id);
  }

  @ApiOperation({ summary: 'Crear Grupo de Profesionales' })
  @Roles(UserRole.AGENDA_MANAGER)
  @Post('professional-groups')
  async createProfessionalGroup(@Req() req: any, @Body() body: { name: string, memberIds: string[] }) {
    return this.usersService.createProfessionalGroup(req.user.id, body.name, body.memberIds);
  }

  @ApiOperation({ summary: 'Eliminar Grupo de Profesionales' })
  @Roles(UserRole.AGENDA_MANAGER)
  @Delete('professional-groups/:id')
  async deleteProfessionalGroup(@Req() req: any, @Param('id') id: string) {
    return this.usersService.deleteProfessionalGroup(req.user.id, id);
  }

}