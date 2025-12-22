import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';
import { UserRole, UserStatus } from '@prisma/client';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) { }

  /**
   * Crear un nuevo usuario
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      // Verificar si el email ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email.toLowerCase() },
      });

      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }

      // Hashear la contraseña
      const passwordHash = await this.encryptionService.hashPassword(createUserDto.password);

      // Crear el usuario
      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email.toLowerCase(),
          passwordHash,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          professionalNumber: createUserDto.professionalNumber,
          country: createUserDto.country,
          role: createUserDto.role || UserRole.PSYCHOLOGIST,
          status: UserStatus.PENDING_REVIEW,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log(`User created: ${user.email}`);

      return this.mapToResponseDto(user);
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener todos los usuarios con paginación
   */
  async findAll(page = 1, limit = 10): Promise<{ users: UserResponseDto[]; total: number; page: number; limit: number }> {
    try {
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
            createdAt: true,
            lastLogin: true,
          },
        }),
        this.prisma.user.count(),
      ]);

      return {
        users: users.map(this.mapToResponseDto),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Error fetching users: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener un usuario por ID
   */
  async findOne(id: string): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
          lastLogin: true,
          dashboardLayout: true,
        },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      return this.mapToResponseDto(user);
    } catch (error) {
      this.logger.error(`Error fetching user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener un usuario por email
   */
  async findByEmail(email: string): Promise<UserResponseDto | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
          lastLogin: true,
        },
      });

      return user ? this.mapToResponseDto(user) : null;
    } catch (error) {
      this.logger.error(`Error fetching user by email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Actualizar un usuario
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    try {
      // Verificar que el usuario existe
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Si se actualiza el email, verificar que no esté en uso
      if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
        const emailInUse = await this.prisma.user.findUnique({
          where: { email: updateUserDto.email.toLowerCase() },
        });

        if (emailInUse) {
          throw new ConflictException('El email ya está en uso');
        }
      }

      // Preparar datos de actualización
      const updateData: any = {
        ...updateUserDto,
        updatedAt: new Date(),
      };

      if (updateUserDto.email) {
        updateData.email = updateUserDto.email.toLowerCase();
      }

      // Si se actualiza la contraseña, hashearla
      if (updateUserDto.password) {
        updateData.passwordHash = await this.encryptionService.hashPassword(updateUserDto.password);
        delete updateData.password;
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
          lastLogin: true,
        },
      });

      this.logger.log(`User updated: ${updatedUser.email}`);

      return this.mapToResponseDto(updatedUser);
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Eliminar un usuario (soft delete)
   */
  async remove(id: string): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      await this.prisma.user.update({
        where: { id },
        data: {
          status: UserStatus.INACTIVE,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`User deleted: ${user.email}`);

      return { message: 'Usuario eliminado exitosamente' };
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Actualizar configuración del dashboard
   */
  async updateDashboardLayout(id: string, layout: any): Promise<UserResponseDto> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          dashboardLayout: layout,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
          lastLogin: true,
          dashboardLayout: true,
          enableReminders: true,
          defaultDuration: true,
          bufferTime: true,
          workStartHour: true,
          workEndHour: true,
          preferredLanguage: true,
          scheduleConfig: true,
          hourlyRate: true,
        },
      });
      return this.mapToResponseDto(updatedUser);
    } catch (error) {
      this.logger.error(`Error updating dashboard layout: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cambiar el rol de un usuario
   */
  async changeRole(id: string, newRole: UserRole): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          role: newRole,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
          lastLogin: true,
        },
      });

      this.logger.log(`User role changed: ${updatedUser.email} -> ${newRole}`);

      return this.mapToResponseDto(updatedUser);
    } catch (error) {
      this.logger.error(`Error changing user role: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mapear usuario a DTO de respuesta
   */
  private mapToResponseDto(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      enableReminders: user.enableReminders,
      defaultDuration: user.defaultDuration,
      bufferTime: user.bufferTime,
      workStartHour: user.workStartHour,
      workEndHour: user.workEndHour,
      scheduleConfig: user.scheduleConfig,
      preferredLanguage: user.preferredLanguage,
      dashboardLayout: user.dashboardLayout,
      hourlyRate: user.hourlyRate,
    };
  }
}