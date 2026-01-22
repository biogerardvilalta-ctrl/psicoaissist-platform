import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';
import { UserRole, UserStatus, AuditAction } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto, CreateAgendaManagerDto } from './dto/users.dto';

import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly paymentsService: PaymentsService,
    private readonly auditService: AuditService,
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
        if (existingUser.status === UserStatus.INACTIVE || existingUser.status === UserStatus.DELETED) {
          const newEmail = `archived_${Date.now()}_${existingUser.email}`;
          this.logger.log(`Archiving old user ${existingUser.id} (${existingUser.email}) -> ${newEmail}`);
          await this.prisma.user.update({
            where: { id: existingUser.id },
            data: { email: newEmail, status: UserStatus.DELETED },
          });
        } else {
          throw new ConflictException('El email ya está registrado');
        }
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

      await this.auditService.log({
        userId: user.id,
        action: AuditAction.CREATE,
        resourceType: 'USER',
        resourceId: user.id,
        details: `Usuario creado por admin: ${user.email}`,
      });

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
        include: {
          subscription: true, // Include subscription
          adminTasks: true
        }
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
        include: {
          subscription: true, // Include subscription
          adminTasks: true
        }
      });

      return user ? this.mapToResponseDto(user) : null;
    } catch (error) {
      this.logger.error(`Error fetching user by email: ${error.message}`);
      throw error;
    }
  }

  // ... (update method needs check if we want subscription there too, usually update returns user which updates context)
  // Let's safe update mapToResponseDto first.

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
      if (updateUserDto.status === UserStatus.INACTIVE || updateUserDto.status === UserStatus.DELETED) {
        try {
          await this.paymentsService.cancelSubscription(id);
          this.logger.log(`Subscription canceled for suspended/deleted user: ${existingUser.email}`);
        } catch (error) {
          // We log but don't stop the process if subscription cancellation fails (maybe they didn't have one)
          this.logger.warn(`Could not cancel subscription for ${existingUser.email}: ${error.message}`);
        }
      }

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
        include: {
          subscription: true
        }
      });

      this.logger.log(`User updated: ${updatedUser.email}`);

      // AUDIT LOG
      let auditDetails = `Usuario actualizado: ${updatedUser.email}`;
      if (updateUserDto.status && updateUserDto.status !== existingUser.status) {
        auditDetails += ` - Estado cambiado a ${updateUserDto.status}`;
      }

      await this.auditService.log({
        userId: id, // WARNING: If admin does this, we should ideally log the ADMIN's ID, but here we only have the target user ID easily. 
        // Ideally we pass context or current user to update(). For now we log it against the target user or system.
        // Actually the `userId` in AuditLog is "Who performed the action".
        // If I put `id` (target user), it looks like the user updated themselves.
        // However, standard UsersService often used by the user themselves too.
        // For Admin updates, the Controller should ideally handle auditing OR pass the actor.
        // Given existing architecture, I'll use the target ID but prefix with "SYSTEM/UPDATE" or similar if I can't distinguish.
        // EXCEPT: The requirement is "apareca en admin/audit-logs".
        // It's better to log it than not. If I use `id`, it will show up under that user's history.
        // Ideally we want to know WHICH admin did it.
        // But to do that I need to change signature of update(). 
        // Let's stick to logging the EVENT first. 
        // The AuditLog model has `userId` as optional? No, checks `schema.prisma`.
        // `userId String?`. So I can leave it null if it's system/unknown admin.
        // But `auditService.log` expects `userId`.
        // Let's check `auditService.log` signature. `userId: string`. It requires it.
        // Use the target ID for now, or a system user ID?
        // Let's use the target ID so it shows in that user's history at least.
        action: AuditAction.UPDATE,
        resourceType: 'USER',
        resourceId: id,
        details: auditDetails,
      });

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
          status: UserStatus.DELETED,
          email: `deleted_${Date.now()}_${user.email}`,
          updatedAt: new Date(),
        },
      });

      // Cancel subscription on Stripe
      try {
        await this.paymentsService.cancelSubscription(id);
        this.logger.log(`Subscription canceled for deleted user: ${user.email}`);
      } catch (error) {
        this.logger.warn(`Could not cancel subscription for ${user.email}: ${error.message}`);
      }

      this.logger.log(`User deleted: ${user.email}`);

      await this.auditService.log({
        userId: id,
        action: AuditAction.DELETE,
        resourceType: 'USER',
        resourceId: id,
        details: `Usuario eliminado (soft delete): ${user.email}`,
      });

      return { message: 'Usuario eliminado exitosamente' };
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`);
      throw error;
    }
  }


  /**
   * Permanently Anonymize User (GDPR Compliance)
   * Irreversible action to scrub PII
   */
  async anonymize(id: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) return;

      const randomId = crypto.randomUUID();
      const anonymousEmail = `deleted_${randomId}@anonymized.local`;

      await this.prisma.user.update({
        where: { id },
        data: {
          firstName: 'Deleted',
          lastName: 'User',
          email: anonymousEmail,
          phone: null,
          professionalNumber: null,
          speciality: null,
          country: null,
          googleCalendarId: null,
          googleRefreshToken: null,
          status: UserStatus.DELETED, // Ensure it is deleted
          updatedAt: new Date(),
        }
      });

      this.logger.log(`User Anonymized (GDPR): ${user.id}`);

      await this.auditService.log({
        userId: id,
        action: AuditAction.DELETE,
        resourceType: 'USER',
        resourceId: id,
        details: `Usuario anonimizado permanentemente (GDPR Cleanup)`,
      });

    } catch (error) {
      this.logger.error(`Error anonymizing user ${id}: ${error.message}`);
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
        include: {
          subscription: true
        }
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
        include: {
          subscription: true
        }
      });

      this.logger.log(`User role changed: ${updatedUser.email} -> ${newRole}`);

      await this.auditService.log({
        userId: id,
        action: AuditAction.UPDATE,
        resourceType: 'USER',
        resourceId: id,
        details: `Rol cambiado a ${newRole}`,
      });

      return this.mapToResponseDto(updatedUser);
    } catch (error) {
      this.logger.error(`Error changing user role: ${error.message}`);
      throw error;
    }
  }

  /**
   * Crear un Agenda Manager vinculado a un profesional
   */
  async createAgendaManager(professionalId: string, dto: CreateAgendaManagerDto): Promise<UserResponseDto> {
    try {
      // Verificar si el email ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
        include: { subscription: true }
      });

      if (existingUser) {
        if (existingUser.role === UserRole.AGENDA_MANAGER) {
          // Si ya existe como Agenda Manager, lo vinculamos al profesional actual
          // Si estaba INACTIVO (borrado lógico), lo reactivamos
          if (existingUser.status === UserStatus.INACTIVE) {
            await this.prisma.user.update({
              where: { id: existingUser.id },
              data: { status: UserStatus.ACTIVE }
            });
            this.logger.log(`Agenda Manager reactivated: ${existingUser.email}`);
          }

          await this.linkProfessional(existingUser.id, professionalId);
          this.logger.log(`Existing Agenda Manager linked: ${existingUser.email} to Professional ${professionalId}`);
          return this.mapToResponseDto(existingUser);
        }
        throw new ConflictException('El email ya está registrado con otro rol');
      }

      // Hashear la contraseña
      const passwordHash = await this.encryptionService.hashPassword(dto.password);

      // Crear el usuario Agenda Manager
      // Y vincularlo automáticamente al profesional que lo crea
      const user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: UserRole.AGENDA_MANAGER,
          status: UserStatus.ACTIVE,
          createdById: professionalId,
          managedProfessionals: {
            connect: { id: professionalId }
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: { subscription: true }
      });

      this.logger.log(`Agenda Manager created: ${user.email} by Professional ${professionalId}`);

      await this.auditService.log({
        userId: professionalId, // Created BY professional
        action: AuditAction.CREATE,
        resourceType: 'USER',
        resourceId: user.id,
        details: `Agenda Manager creado: ${user.email}`,
      });

      return this.mapToResponseDto(user);
    } catch (error) {
      this.logger.error(`Error creating agenda manager: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cambiar contraseña por Admin (sin requerir la anterior)
   */
  async adminChangePassword(id: string, newPassword: string): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const passwordHash = await this.encryptionService.hashPassword(newPassword);

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          passwordHash,
          updatedAt: new Date(),
        },
        include: {
          subscription: true
        }
      });

      this.logger.log(`Password changed by admin for user: ${user.email}`);

      await this.auditService.log({
        userId: id,
        action: AuditAction.UPDATE,
        resourceType: 'USER',
        resourceId: id,
        details: `Contraseña cambiada por administrador`,
      });

      return this.mapToResponseDto(updatedUser);
    } catch (error) {
      this.logger.error(`Error changing password by admin: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener Agenda Managers de un profesional
   */
  async getAgendaManagers(professionalId: string): Promise<UserResponseDto[]> {
    try {
      const managers = await this.prisma.user.findMany({
        where: {
          role: UserRole.AGENDA_MANAGER,
          managedProfessionals: {
            some: { id: professionalId }
          }
        },
        orderBy: { createdAt: 'desc' },
        include: { subscription: true }
      });

      return managers.map(m => this.mapToResponseDto(m));
    } catch (error) {
      this.logger.error(`Error fetching agenda managers: ${error.message}`);
      throw error;
    }
  }

  /**
   * Eliminar Agenda Manager (Soft delete + Unlink)
   */
  async deleteAgendaManager(professionalId: string, managerId: string): Promise<void> {
    try {
      const manager = await this.prisma.user.findFirst({
        where: {
          id: managerId,
          role: UserRole.AGENDA_MANAGER,
          managedProfessionals: { some: { id: professionalId } }
        }
      });

      if (!manager) {
        throw new NotFoundException('Agenda Manager no encontrado o no asignado');
      }

      // 1. Unlink from the current professional
      await this.prisma.user.update({
        where: { id: managerId },
        data: {
          managedProfessionals: {
            disconnect: { id: professionalId }
          }
        }
      });

      this.logger.log(`Agenda Manager unlinked: ${managerId} from ${professionalId}`);

      // 2. Check if there are any other professionals linked (Robust Check)
      const remainingLinksCount = await this.prisma.user.count({
        where: {
          role: UserRole.AGENDA_MANAGER,
          id: managerId,
          managedProfessionals: { some: {} } // Check if there are ANY managed professionals
        }
      });

      this.logger.log(`Agenda Manager ${managerId} remaining links: ${remainingLinksCount}`);

      // 3. If no other professionals are linked, delete the manager (Soft Delete)
      if (remainingLinksCount === 0) {
        // Double check with explicit relation count if needed, but the above filters for Managers who have SOME managedProfessionals.
        // Actually, let's reverse it: Find the user and count their managedProfessionals directly to be safe.
        const trueCount = await this.prisma.user.count({
          where: {
            id: managerId,
            managedProfessionals: { some: {} }
          }
        });

        if (trueCount === 0) {
          await this.prisma.user.update({
            where: { id: managerId },
            data: { status: UserStatus.INACTIVE }
          });
          this.logger.log(`Agenda Manager has no more professionals. Set to INACTIVE: ${managerId}`);

          await this.auditService.log({
            userId: professionalId,
            action: AuditAction.DELETE,
            resourceType: 'USER',
            resourceId: managerId,
            details: `Agenda Manager eliminado (inactivo): ${managerId}`,
          });
        }
      }

    } catch (error) {
      this.logger.error(`Error removing agenda manager: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener profesionales vinculados a un Agenda Manager
   */
  async getLinkedProfessionals(managerId: string): Promise<UserResponseDto[]> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: managerId },
        include: {
          managedProfessionals: {
            where: { status: { not: 'INACTIVE' } },
            include: { groupMembers: true, subscription: true }
          }
        }
      });

      if (!user) throw new NotFoundException('Usuario no encontrado');

      return user.managedProfessionals.map(m => this.mapToResponseDto(m));
    } catch (error) {
      this.logger.error(`Error fetching linked professionals: ${error.message}`);
      throw error;
    }
  }

  /**
   * Vincular un profesional adicional a un Agenda Manager
   */
  async linkProfessional(managerId: string, professionalId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: managerId },
        data: {
          managedProfessionals: {
            connect: { id: professionalId }
          }
        }
      });
    } catch (error) {
      this.logger.error(`Error linking professional: ${error.message}`);
      throw error;
    }
  }

  /**
   * Desvincular profesional
   */
  async unlinkProfessional(managerId: string, professionalId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: managerId },
        data: {
          managedProfessionals: {
            disconnect: { id: professionalId }
          }
        }
      });
    } catch (error) {
      this.logger.error(`Error unlinking professional: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a Professional Group (Virtual User) managed by an Agenda Manager
   */
  async createProfessionalGroup(managerId: string, name: string, memberIds: string[]): Promise<UserResponseDto> {
    try {
      const email = `group-${Date.now()}@system.local`;

      const group = await this.prisma.user.create({
        data: {
          email,
          passwordHash: '',
          firstName: name,
          lastName: '(Grupo)',
          role: UserRole.PROFESSIONAL_GROUP,
          status: UserStatus.ACTIVE,
          createdById: managerId,
          agendaManagers: {
            connect: { id: managerId }
          },
          groupMembers: {
            connect: memberIds.map(id => ({ id }))
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          groupMembers: true,
          subscription: true
        }
      });

      this.logger.log(`Professional Group created: ${name} by Manager ${managerId}`);

      await this.auditService.log({
        userId: managerId,
        action: AuditAction.CREATE,
        resourceType: 'USER',
        resourceId: group.id,
        details: `Grupo profesional creado: ${name}`,
      });

      return this.mapToResponseDto(group);
    } catch (error) {
      this.logger.error(`Error creating professional group: ${error.message}`);
      throw error;
    }
  }

  async deleteProfessionalGroup(managerId: string, groupId: string): Promise<{ success: boolean }> {
    try {
      const group = await this.prisma.user.findFirst({
        where: {
          id: groupId,
          role: UserRole.PROFESSIONAL_GROUP,
          agendaManagers: { some: { id: managerId } }
        }
      });

      if (!group) throw new NotFoundException('Grupo no encontrado o no tienes permisos.');

      await this.prisma.user.update({
        where: { id: groupId },
        data: { status: UserStatus.INACTIVE }
      });

      this.logger.log(`Group ${groupId} deleted by ${managerId}`);

      await this.auditService.log({
        userId: managerId,
        action: AuditAction.DELETE,
        resourceType: 'USER',
        resourceId: groupId,
        details: `Grupo profesional eliminado: ${group.firstName}`,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Error deleting group: ${error.message}`);
      throw error;
    }
  }


  /**
   * Cambiar contraseña de usuario (Admin)
   */


  /**
   * Verificar manualmente un usuario (Admin)
   */
  async verifyUser(id: string): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          verified: true,
          verificationToken: null,
          status: user.status === UserStatus.PENDING_REVIEW ? UserStatus.ACTIVE : user.status,
          updatedAt: new Date(),
        },
        include: {
          subscription: true
        }
      });

      this.logger.log(`User manually verified by admin: ${user.email}`);

      await this.auditService.log({
        userId: id,
        action: AuditAction.UPDATE,
        resourceType: 'USER',
        resourceId: id,
        details: `Usuario verificado manualmente`,
      });

      return this.mapToResponseDto(updatedUser);
    } catch (error) {
      this.logger.error(`Error verifying user: ${error.message}`);
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
      googleImportCalendar: user.googleImportCalendar,
      brandingConfig: user.brandingConfig,
      // Map subscription deeply or flat
      // Frontend User type has subscription object.
      subscription: user.subscription ? {
        planType: user.subscription.planType,
        status: user.subscription.status,
        currentPeriodEnd: user.subscription.currentPeriodEnd
      } : undefined,
      // Include group members if available
      groupMembers: user.groupMembers ? user.groupMembers.map(m => ({
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName
      })) : undefined,
      simulatorUsageCount: user.simulatorUsageCount,
      agendaManagerEnabled: user.agendaManagerEnabled,
      hasOnboardingPack: user.adminTasks ? user.adminTasks.some((t: any) => t.type === 'ONBOARDING_SETUP' && t.status !== 'CANCELLED') : false,
      verified: user.verified,
    };
  }
}