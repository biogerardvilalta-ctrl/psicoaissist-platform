import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { LoginDto, RegisterDto, TokensDto, AuthResponseDto } from './dto/auth.dto';
import { AuditService } from '../audit/audit.service';
import { UserRole, UserStatus, AuditAction } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly auditService: AuditService,
  ) { }

  /**
   * Valida las credenciales del usuario
   */
  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { subscription: true },
      });

      if (!user) {
        this.logger.warn(`Login attempt with non-existent email: ${email}`);
        return null;
      }

      if (user.status === UserStatus.PENDING_REVIEW) {
        this.logger.warn(`Login attempt with pending user: ${email}`);
        throw new UnauthorizedException('Tu cuenta está en revisión. Te notificaremos cuando sea validada.');
      }

      if (user.status === UserStatus.REJECTED) {
        this.logger.warn(`Login attempt with rejected user: ${email}`);
        throw new UnauthorizedException('Tu solicitud de registro ha sido rechazada.');
      }

      if (user.status !== UserStatus.ACTIVE && user.status !== UserStatus.VALIDATED) {
        this.logger.warn(`Login attempt with inactive user: ${email}`);
        throw new UnauthorizedException('Cuenta inactiva. Contacte al administrador.');
      }

      const isPasswordValid = await this.encryptionService.comparePassword(password, user.passwordHash);

      if (!isPasswordValid) {
        this.logger.warn(`Failed login attempt for user: ${email}`);
        await this.logAuthAttempt(user.id, false);
        return null;
      }

      await this.logAuthAttempt(user.id, true);
      const { passwordHash, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Realiza el login y devuelve tokens JWT
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    let email = loginDto.email;
    let password = loginDto.password;

    if (loginDto.encryptedData) {
      try {
        const decryptedJson = await this.encryptionService.decryptAsymmetric(loginDto.encryptedData);
        const credentials = JSON.parse(decryptedJson);
        email = credentials.email;
        password = credentials.password;
      } catch (error) {
        throw new UnauthorizedException('Fallo al desencriptar credenciales: ' + error.message);
      }
    }

    if (!email || !password) {
      throw new UnauthorizedException('Email y contraseña son requeridos');
    }

    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Backfill Referral Code (Migration for existing users)
    if (!user.referralCode) {
      const newCode = await this.generateUniqueReferralCode(user.firstName);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { referralCode: newCode }
      });
      user.referralCode = newCode;
    }

    const tokens = await this.generateTokens(user);
    const encryptionKey = await this.encryptionService.getOrCreateEncryptionKey(user.id);

    // Actualizar último login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        enableReminders: user.enableReminders,
        defaultDuration: user.defaultDuration,
        bufferTime: user.bufferTime,
        workStartHour: user.workStartHour,
        workEndHour: user.workEndHour,
        preferredLanguage: user.preferredLanguage,
        scheduleConfig: user.scheduleConfig as any,
        dashboardLayout: user.dashboardLayout as any,
        hourlyRate: user.hourlyRate,
        referralCode: user.referralCode,
        referralsCount: user.referralsCount,
        subscription: user.subscription,
        simulatorUsageCount: user.simulatorUsageCount,
        agendaManagerEnabled: user.agendaManagerEnabled,
      },
      tokens,
      encryptionKey: {
        id: encryptionKey.id,
        key: encryptionKey.keyValue,
      },
    };
  }

  /**
   * Registra un nuevo usuario
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      // Verificar si el email ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { email: registerDto.email.toLowerCase() },
      });

      if (existingUser) {
        // Permitir re-registro si el usuario está marcado como eliminado o inactivo (soft delete previo)
        if (existingUser.status === UserStatus.INACTIVE || existingUser.status === UserStatus.DELETED) {
          const newEmail = `archived_${Date.now()}_${existingUser.email}`;
          this.logger.log(`Archiving old inactive/deleted user to allow re-registration: ${existingUser.email} -> ${newEmail}`);
          await this.prisma.user.update({
            where: { id: existingUser.id },
            data: {
              email: newEmail,
              status: UserStatus.DELETED
            }
          });
          // Continue to create new user...
        } else {
          throw new ConflictException('El email ya está registrado');
        }
      }

      // Referral Logic
      let referredByUserId: string | null = null;
      if (registerDto.referralCode) {
        const referrer = await this.prisma.user.findUnique({
          where: { referralCode: registerDto.referralCode },
        });

        if (referrer) {
          referredByUserId = referrer.id;
          // Increment referrer count
          await this.prisma.user.update({
            where: { id: referrer.id },
            data: { referralsCount: { increment: 1 } }
          });
        }
      }

      // Generate unique referral code for new user
      const referralCode = await this.generateUniqueReferralCode(registerDto.firstName);

      // Hashear la contraseña
      const passwordHash = await this.encryptionService.hashPassword(registerDto.password);

      // Crear el usuario
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email.toLowerCase(),
          passwordHash,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          professionalNumber: registerDto.professionalNumber,
          country: registerDto.country,
          role: registerDto.role || UserRole.PSYCHOLOGIST,
          status: UserStatus.ACTIVE, // Changed from PENDING_REVIEW for immediate access
          createdAt: new Date(),
          updatedAt: new Date(),
          referralCode,
          referredBy: referredByUserId,
          // Developer Mode / Testing: Auto-assign Pro Plan to enable Simulator access
          // Subscription will be created via Checkout flow or default empty

        },
        include: { subscription: true },
      });

      this.logger.log(`New user registered: ${user.email} (Referred by: ${referredByUserId || 'None'})`);

      // AUDIT LOG
      await this.auditService.log({
        userId: user.id,
        action: AuditAction.CREATE,
        resourceType: 'USER',
        resourceId: user.id,
        details: `Usuario registrado: ${user.email}`,
        isSuccess: true,
      });

      // Enviar email de bienvenida
      try {
        await this.emailService.sendWelcomeEmail(
          user.email,
          `${user.firstName} ${user.lastName}`
        );
      } catch (emailError) {
        this.logger.warn(`Failed to send welcome email to ${user.email}: ${emailError.message}`);
        // No fallar el registro si el email falla
      }

      const tokens = await this.generateTokens(user);
      const encryptionKey = await this.encryptionService.getOrCreateEncryptionKey(user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          enableReminders: user.enableReminders, // Add this
          defaultDuration: user.defaultDuration,
          bufferTime: user.bufferTime,
          workStartHour: user.workStartHour,
          workEndHour: user.workEndHour,
          preferredLanguage: user.preferredLanguage,
          scheduleConfig: user.scheduleConfig as any,
          dashboardLayout: user.dashboardLayout as any,
          hourlyRate: user.hourlyRate,
          referralCode: user.referralCode,
          referralsCount: user.referralsCount,
          subscription: user.subscription,
          simulatorUsageCount: user.simulatorUsageCount,
          agendaManagerEnabled: user.agendaManagerEnabled,
        },
        tokens,
        encryptionKey: {
          id: encryptionKey.id,
          key: encryptionKey.keyValue,
        },
      };
    } catch (error) {
      this.logger.error(`Error registering user: ${error.message}`);
      throw error;
    }
  }

  private async generateUniqueReferralCode(firstName: string): Promise<string> {
    const prefix = firstName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PSY');
    const random = Math.floor(1000 + Math.random() * 9000);
    let code = `${prefix}${random}`;

    // Simple collision check (rare)
    let exists = await this.prisma.user.findUnique({ where: { referralCode: code } });
    while (exists) {
      const random2 = Math.floor(1000 + Math.random() * 9000);
      code = `${prefix}${random2}`;
      exists = await this.prisma.user.findUnique({ where: { referralCode: code } });
    }
    return code;
  }

  /**
   * Genera tokens de acceso y refresh
   */
  async generateTokens(user: any): Promise<TokensDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresca el token de acceso
   */
  async refreshToken(refreshToken: string): Promise<TokensDto> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Usuario no válido');
      }

      return this.generateTokens(user);
    } catch (error) {
      this.logger.error(`Error refreshing token: ${error.message}`);
      throw new UnauthorizedException('Token de refresh inválido');
    }
  }

  /**
   * Logout - invalida el token
   */
  async logout(userId: string): Promise<{ message: string }> {
    try {
      // En una implementación completa, aquí agregaríamos el token a una blacklist
      // Por ahora, simplemente loggeamos el evento
      await this.auditService.log({
        userId,
        action: AuditAction.LOGOUT,
        resourceType: 'USER',
        resourceId: userId,
        details: 'Logout exitoso',
        isSuccess: true,
      });

      return { message: 'Logout exitoso' };
    } catch (error) {
      this.logger.error(`Error during logout: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const isCurrentPasswordValid = await this.encryptionService.comparePassword(
        currentPassword,
        user.passwordHash,
      );

      if (!isCurrentPasswordValid) {
        await this.auditService.log({
          userId,
          action: AuditAction.UPDATE,
          resourceType: 'USER',
          resourceId: userId,
          details: 'Intento fallido de cambio de contraseña (contraseña actual incorrecta)',
          isSuccess: false,
        });
        throw new UnauthorizedException('Contraseña actual incorrecta');
      }

      const newPasswordHash = await this.encryptionService.hashPassword(newPassword);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Password changed for user: ${userId}`);

      await this.auditService.log({
        userId,
        action: AuditAction.PASSWORD_RESET, // Or UPDATE, but PASSWORD_RESET is more specific if available. Schema has PASSWORD_RESET.
        resourceType: 'USER',
        resourceId: userId,
        details: 'Contraseña cambiada exitosamente',
        isSuccess: true,
      });

      return { message: 'Contraseña cambiada exitosamente' };
    } catch (error) {
      this.logger.error(`Error changing password: ${error.message}`);
      throw error;
    }
  }

  /**
   * Registra intentos de autenticación para auditoría
   */
  private async logAuthAttempt(userId: string, success: boolean): Promise<void> {
    try {
      await this.auditService.log({
        userId,
        action: success ? AuditAction.LOGIN_SUCCESS : AuditAction.LOGIN_FAILED,
        resourceType: 'USER',
        resourceId: userId,
        details: success ? 'Login exitoso' : 'Fallo en login',
        isSuccess: success,
      });
    } catch (error) {
      this.logger.error(`Error logging auth attempt: ${error.message}`);
    }
  }

  /**
   * Obtiene la clave pública del servidor
   */
  getPublicKey(): string {
    return this.encryptionService.getPublicKey();
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(userId: string, data: any): Promise<any> {
    try {
      this.logger.log(`Updating profile for ${userId}. Data keys: ${Object.keys(data)}`);
      if (data.brandingConfig) {
        this.logger.log(`Branding Config to save: ${JSON.stringify(data.brandingConfig)}`);
      }

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          professionalNumber: data.professionalNumber,
          country: data.country,
          enableReminders: data.enableReminders,
          defaultDuration: data.defaultDuration,
          bufferTime: data.bufferTime,
          workStartHour: data.workStartHour,
          workEndHour: data.workEndHour,
          scheduleConfig: data.scheduleConfig,
          preferredLanguage: data.preferredLanguage,
          hourlyRate: data.hourlyRate,
          googleImportCalendar: data.googleImportCalendar,
          brandingConfig: data.brandingConfig as any, // Cast to avoid stale Prisma type error
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Profile updated for user: ${userId}`);

      const { passwordHash, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error(`Error updating profile: ${error.message}`);
      throw error;
    }
  }
  async getProfile(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Backfill Referral Code if missing
    if (!user.referralCode) {
      const newCode = await this.generateUniqueReferralCode(user.firstName);
      await this.prisma.user.update({
        where: { id: userId },
        data: { referralCode: newCode, updatedAt: new Date() }
      });
      user.referralCode = newCode;
    }

    // Get current usage stats
    const clientsCount = await this.prisma.client.count({
      where: {
        userId: user.id,
        isActive: true
      }
    });

    // Get limits from Plan Features
    const planType = (user.subscription?.planType || 'demo').toLowerCase();
    // Import PLAN_FEATURES dynamically to avoid circular dependency issues if any, or just import at top
    // For now assuming we can import. If not, we'll fix it.
    // Actually, let's look at imports.
    // We need to add import { PLAN_FEATURES } from '../payments/plan-features'; at the top.

    const limits = (await import('../payments/plan-features')).PLAN_FEATURES[planType];

    const { passwordHash, ...result } = user;
    return {
      ...result,
      usage: {
        clientsCount
      },
      limits: {
        maxClients: limits?.maxClients ?? 3 // Default fallback
      }
    };
  }
}