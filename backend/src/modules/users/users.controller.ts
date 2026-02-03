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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateUserDto, UpdateUserDto, UserResponseDto, ChangeRoleDto, CreateAgendaManagerDto, LinkProfessionalDto, AdminChangePasswordDto } from './dto/users.dto';
import { UserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({ summary: 'Exportar mis datos (GDPR) - CSV Desencriptado' })
  @ApiResponse({ status: 200, description: 'Archivo CSV descargado' })
  @Get('me/export/csv')
  async exportCsv(@Req() req: any, @Res() res: Response) {
    const { fileName, csv } = await this.usersService.exportDataCsv(req.user.id);

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    res.send(csv);
  }

  @ApiOperation({ summary: 'Exportar mis datos (GDPR) - JSON Legacy' })
  @ApiResponse({ status: 200, description: 'Datos exportados en JSON' })
  @Get('me/export')
  async exportData(@Req() req: any) {
    return this.usersService.exportData(req.user.id);
  }

  @ApiOperation({ summary: 'Eliminar mi cuenta' })
  @ApiResponse({ status: 200, description: 'Cuenta eliminada exitosamente' })
  @Delete('me')
  async deleteSelf(@Req() req: any) {
    this.logger.log(`[DEBUG] deleteSelf called. User: ${req.user?.email}`);
    try {
      const result = await this.usersService.remove(req.user.id);
      this.logger.log(`User deleted self: ${req.user.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error deleting self: ${error.message}`);
      throw error;
    }
  }


  @ApiOperation({ summary: 'Crear nuevo usuario (solo administradores)' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente', type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
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
  @UseGuards(RolesGuard)
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
  @UseGuards(RolesGuard)
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
  @UseGuards(RolesGuard)
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
  @UseGuards(RolesGuard)
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

  @ApiOperation({ summary: 'Verificar usuario manualmente (Admin)' })
  @ApiResponse({ status: 200, description: 'Usuario verificado exitosamente', type: UserResponseDto })
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Patch(':id/verify')
  async verifyUser(@Param('id') id: string) {
    try {
      const result = await this.usersService.verifyUser(id);
      this.logger.log(`User manually verified: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error verifying user: ${error.message}`);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Actualizar layout del dashboard' })
  @ApiResponse({ status: 200, description: 'Layout actualizado', type: UserResponseDto })
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST, UserRole.PSYCHOLOGIST_BASIC, UserRole.PSYCHOLOGIST_PRO, UserRole.PSYCHOLOGIST_PREMIUM)
  @UseGuards(RolesGuard)
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
  @UseGuards(RolesGuard)
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

  @ApiOperation({ summary: 'Cambiar contraseña de usuario (Admin)' })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada' })
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Patch(':id/password')
  async adminChangePassword(@Param('id') id: string, @Body() dto: AdminChangePasswordDto) {
    try {
      const result = await this.usersService.adminChangePassword(id, dto.password);
      this.logger.log(`Password changed by admin for user: ${id}`);
      return result;
    } catch (error) {

      this.logger.error(`Error changing password: ${error.message}`);
      throw error;
    }
  }




  // --- Agenda Manager Endpoints ---

  @ApiOperation({ summary: 'Crear Agenda Manager (Solo Profesionales)' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @Roles(UserRole.PSYCHOLOGIST, UserRole.PSYCHOLOGIST_BASIC, UserRole.PSYCHOLOGIST_PRO, UserRole.PSYCHOLOGIST_PREMIUM)
  @UseGuards(RolesGuard)
  @Post('agenda-managers')
  async createAgendaManager(@Req() req: any, @Body() dto: CreateAgendaManagerDto) {
    return this.usersService.createAgendaManager(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Listar mis Agenda Managers' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  @Roles(UserRole.PSYCHOLOGIST, UserRole.PSYCHOLOGIST_BASIC, UserRole.PSYCHOLOGIST_PRO, UserRole.PSYCHOLOGIST_PREMIUM)
  @UseGuards(RolesGuard)
  @Get('me/agenda-managers')
  async getMyAgendaManagers(@Req() req: any) {
    return this.usersService.getAgendaManagers(req.user.id);
  }

  @ApiOperation({ summary: 'Eliminar Agenda Manager' })
  @Roles(UserRole.PSYCHOLOGIST, UserRole.PSYCHOLOGIST_BASIC, UserRole.PSYCHOLOGIST_PRO, UserRole.PSYCHOLOGIST_PREMIUM)
  @UseGuards(RolesGuard)
  @Delete('agenda-managers/:id')
  async deleteAgendaManager(@Req() req: any, @Param('id') id: string) {
    await this.usersService.deleteAgendaManager(req.user.id, id);
    return { success: true };
  }

  @ApiOperation({ summary: 'Obtener profesionales gestionados (Para Agenda Manager)' })
  @Roles(UserRole.AGENDA_MANAGER)
  @UseGuards(RolesGuard)
  @Get('me/managed-professionals')
  async getManagedProfessionals(@Req() req: any) {
    return this.usersService.getLinkedProfessionals(req.user.id);
  }

  @ApiOperation({ summary: 'Vincular profesional a Agenda Manager' })
  @Roles(UserRole.PSYCHOLOGIST, UserRole.PSYCHOLOGIST_BASIC, UserRole.PSYCHOLOGIST_PRO, UserRole.PSYCHOLOGIST_PREMIUM) // Who can do this? The professional linking themselves? Or the owner? Assuming the professional wants to add themselves to a manager.
  @UseGuards(RolesGuard)
  @Post('agenda-managers/:id/link')
  async linkProfessional(@Req() req: any, @Param('id') managerId: string) {
    // A professional links THEMSELVES to an existing manager (e.g. by invitation code in future, but for now direct link)
    // Or maybe the owner links another professional?
    // Let's assume the logged in professional is linking themselves to the manager.
    return this.usersService.linkProfessional(managerId, req.user.id);
  }

  @ApiOperation({ summary: 'Crear Grupo de Profesionales' })
  @Roles(UserRole.AGENDA_MANAGER)
  @UseGuards(RolesGuard)
  @Post('professional-groups')
  async createProfessionalGroup(@Req() req: any, @Body() body: { name: string, memberIds: string[] }) {
    return this.usersService.createProfessionalGroup(req.user.id, body.name, body.memberIds);
  }

  @ApiOperation({ summary: 'Eliminar Grupo de Profesionales' })
  @Roles(UserRole.AGENDA_MANAGER)
  @UseGuards(RolesGuard)
  @Delete('professional-groups/:id')
  async deleteProfessionalGroup(@Req() req: any, @Param('id') id: string) {
    return this.usersService.deleteProfessionalGroup(req.user.id, id);
  }


  @ApiOperation({ summary: 'Subir logo de empresa' })
  @ApiResponse({ status: 201, description: 'Logo subido existosamente' })
  @Roles(UserRole.PSYCHOLOGIST, UserRole.PSYCHOLOGIST_BASIC, UserRole.PSYCHOLOGIST_PRO, UserRole.PSYCHOLOGIST_PREMIUM)
  @UseGuards(RolesGuard)
  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        cb(null, './uploads/logos');
      },
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('Solo se permiten archivos de imagen (jpg, jpeg, png, gif)'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
  }))
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se ha subido ningún archivo');
    }
    // Return relative path for storage
    return { url: `/uploads/logos/${file.filename}` };
  }
}