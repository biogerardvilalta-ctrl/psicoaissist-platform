import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { LoginDto, RegisterDto, TokensDto, AuthResponseDto } from './dto/auth.dto';
import { CompleteGoogleRegisterDto } from './dto/complete-google-register.dto';
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
        include: {
          subscription: true,
          adminTasks: true
        },
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

      if (user.status !== UserStatus.ACTIVE && user.status !== UserStatus.VALIDATED && user.status !== UserStatus.DELETED) {
        this.logger.warn(`Login attempt with inactive user: ${email}`);
        throw new UnauthorizedException('Cuenta inactiva. Contacte al administrador.');
      }

      if (!user.verified) {
        this.logger.warn(`Login attempt with unverified user: ${email}`);
        throw new UnauthorizedException('Cuenta no verificada. Por favor revisa tu correo electrónico para verificar tu cuenta.');
      }

      let isPasswordValid = false;
      try {
        isPasswordValid = await this.encryptionService.comparePassword(password, user.passwordHash);
      } catch (bcryptError) {
        this.logger.error(`Bcrypt comparison failed for user ${email}: ${bcryptError.message}`);
        // Treat as invalid password rather than crashing
        isPasswordValid = false;
      }

      if (!isPasswordValid) {
        this.logger.warn(`Failed login attempt for user: ${email} (Invalid Password)`);
        console.log(`[DEBUG] Password mismatch for ${email}. Provided: ${password.substring(0, 3)}***`);
        await this.logAuthAttempt(user.id, false);
        return null;
      }

      await this.logAuthAttempt(user.id, true);
      const { passwordHash, ...result } = user;
      return result;
    } catch (error) {
      console.log(`[DEBUG] Error validating user ${email}:`, error);
      // Log the full stack trace for internal server errors
      this.logger.error(`Error validating user ${email}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Genera un token JWT para el proceso de registro con Google.
   * Este token contiene información del perfil de Google para ser usada en el registro final.
   */


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

    // Auto-Reactivation Logic
    if (user.status === UserStatus.DELETED) {
      this.logger.log(`Reactivating deleted user: ${user.email}`);
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          status: UserStatus.ACTIVE,
          updatedAt: new Date()
        }
      });
      user.status = UserStatus.ACTIVE; // Update local object for token generation

      await this.auditService.log({
        userId: user.id,
        action: AuditAction.UPDATE,
        resourceType: 'USER',
        resourceId: user.id,
        details: 'Usuario reactivado automáticamente por Login',
      });
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
        hasOnboardingPack: user.adminTasks ? user.adminTasks.some((t: any) => t.type === 'ONBOARDING_SETUP' && t.status !== 'CANCELLED') : false,
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
          // New Behavior: Don't archive, tell them to login
          throw new ConflictException('Tu cuenta está en periodo de gracia. Por favor inicia sesión para reactivarla.');
          /*
          const newEmail = `archived_${Date.now()}_${existingUser.email}`;
          this.logger.log(`Archiving old inactive/deleted user to allow re-registration: ${existingUser.email} -> ${newEmail}`);
          await this.prisma.user.update({
            where: { id: existingUser.id },
            data: {
              email: newEmail,
              status: UserStatus.DELETED
            }
          });
          */
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
          status: UserStatus.INACTIVE, // Changed from ACTIVE to INACTIVE to wait for payment
          updatedAt: new Date(),
          referralCode,
          referredBy: referredByUserId,
          preferredLanguage: registerDto.preferredLanguage || 'es', // Default to 'es' if not provided
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

      // Enviar email de verificación - REMOVED: Verification/Welcome email will be sent after Payment
      const verificationToken = uuidv4();

      // Update user with verification token (kept for future use or manual verification)
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken,
          verified: false
        }
      });

      /* 
       * DISABLED: We do not send verification email now. 
       * User must pay first. Verification will be implicit via Payment Webhook.
       
      try {
        await this.emailService.sendVerificationEmail(
          user.email,
          `${user.firstName} ${user.lastName}`,
          verificationToken,
          registerDto.plan,
          registerDto.interval,
          user.preferredLanguage
        );
      } catch (emailError) {
        this.logger.warn(`Failed to send verification email to ${user.email}: ${emailError.message}`);
      }
      */

      // No generamos tokens ni login automático
      // Devolvemos solo el usuario y flag de verificación/pago requerido

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
          hasOnboardingPack: false,
        },
        tokens: null, // No tokens
        encryptionKey: null, // No key access yet
        // Custom flag to tell frontend to redirect to payment
        // We can reuse verificationRequired or add a new one if DTO allows.
        // For now using verificationRequired as "Steps Required" signal, but ideally we'd add `paymentRequired` to DTO.
        // Since DTO is strict in NestJS if validation pipes are on, we might need to update DTO or just rely on status=INACTIVE check.
        // Let's assume we can add a dynamic property or use existing structure.
        // Checking AuthResponseDto... it has `message`.
        message: 'Registro iniciado. Por favor completa el pago para activar tu cuenta.',
      };
    } catch (error) {
      this.logger.error(`Error registering user: ${error.message}`);
      throw error;
    }
  }
  /**
   * Completa el registro de un usuario de Google
   */
  async completeGoogleRegistration(dto: CompleteGoogleRegisterDto): Promise<AuthResponseDto> {
    const { token, professionalNumber, country, referralCode } = dto;

    try {
      // Decode registration token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      if (!payload.email || !payload.isRegistration) {
        throw new UnauthorizedException('Token de registro inválido');
      }

      const user = await this.prisma.user.findUnique({
        where: { email: payload.email },
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }


      // Check if user is already active (idempotency)
      if (!(user as any).isPendingRegistration && user.status === UserStatus.ACTIVE) {
        const tokens = await this.generateTokens(user);
        return {
          message: 'Usuario ya registrado',
          user: user as any,
          tokens
        };
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          professionalNumber,
          country,
          isPendingRegistration: false,
          status: UserStatus.INACTIVE, // Changed to INACTIVE to require payment
          verified: false, // Verification/Payment required
          role: UserRole.PSYCHOLOGIST,
          updatedAt: new Date(),
        } as any,
      });

      // Similar to standard register, we return user but NO tokens
      return {
        message: 'Registro de Google completado. Por favor completa el pago para activar tu cuenta.',
        user: updatedUser as any,
        tokens: null,
        encryptionKey: null,
      };

    } catch (error) {
      this.logger.error(`Error completing google registration: ${error.message}`);
      throw new UnauthorizedException('Token de registro inválido o expirado');
    }
  }

  async generateRegistrationToken(user: any): Promise<string> {
    const payload = {
      email: user.email,
      sub: user.id,
      isRegistration: true,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '1h',
    });
  }

  private async generateUniqueReferralCode(firstName: string): Promise<string> {
    const safeName = firstName || 'USER';
    const prefix = safeName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PSY');
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
   * Verificar email de usuario
   */
  /**
   * Verificar email de usuario y retornar tokens para login automático
   */
  async verifyEmail(token: string): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
      include: { subscription: true },
    });

    if (!user) {
      throw new UnauthorizedException('Token de verificación inválido');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        verificationToken: null,
        status: UserStatus.ACTIVE // Ensure active if it wasn't
      },
    });

    await this.auditService.log({
      userId: user.id,
      action: AuditAction.EMAIL_VERIFICATION,
      resourceType: 'USER',
      resourceId: user.id,
      details: 'Email verificado exitosamente',
      isSuccess: true,
    });

    // Send welcome email NOW after verification
    try {
      await this.emailService.sendWelcomeEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        user.preferredLanguage
      );
    } catch (e) {
      this.logger.warn(`Could not send welcome email after verification: ${e.message}`);
    }

    // Generate Tokens for Auto-Login
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
        hasOnboardingPack: false, // Default or fetch
      },
      tokens,
      encryptionKey: {
        id: encryptionKey.id,
        key: encryptionKey.keyValue,
      },
    };
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
      include: {
        subscription: true,
        adminTasks: true,
      },
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
      },
      hasOnboardingPack: user.adminTasks ? user.adminTasks.some((t: any) => t.type === 'ONBOARDING_SETUP' && t.status !== 'CANCELLED') : false,
    };
  }
  /**
   * Valida o registra un usuario proveniente de Google
   */
  async validateGoogleUser(
    googleUser: { email: string; firstName: string; lastName: string; picture: string; accessToken: string },
    isRegistering: boolean = false,
    plan?: string,
    interval?: string
  ) {
    console.log('DEBUG validateGoogleUser:', { email: googleUser.email, isRegistering, plan });
    const { email, firstName, lastName, picture } = googleUser;

    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { subscription: true }
    });

    if (user) {
      if (user.status !== UserStatus.ACTIVE && user.status !== UserStatus.VALIDATED) {
        if (user.status === UserStatus.DELETED || user.status === UserStatus.INACTIVE) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: { status: UserStatus.ACTIVE }
          });
        }
      }
    } else {
      // User does NOT exist
      if (!isRegistering) {
        // Strict Login Mode: Failure
        this.logger.warn(`Google Login failed: User ${email} not found and isRegistering=false`);
        throw new UnauthorizedException('No existe ninguna cuenta con este email. Por favor, regístrate primero.');
      }

      // Create new user (Registration Mode)
      const referralCode = await this.generateUniqueReferralCode(firstName);
      const randomPassword = Math.random().toString(36).slice(-10) + uuidv4();
      const passwordHash = await this.encryptionService.hashPassword(randomPassword);

      user = await this.prisma.user.create({
        data: {
          email: email.toLowerCase(),
          firstName: firstName || null,
          lastName: lastName || null,
          passwordHash,
          referralCode,
          role: UserRole.PSYCHOLOGIST,
          status: UserStatus.ACTIVE,
          verified: true,
          verificationToken: null,
          isPendingRegistration: true, // Force profile completion (prof number, country, terms)
        },
        include: { subscription: true }
      });

      await this.auditService.log({
        userId: user.id,
        action: AuditAction.CREATE,
        resourceType: 'USER',
        resourceId: user.id,
        details: `Usuario registrado via Google: ${user.email}`,
        isSuccess: true,
      });

      try {
        await this.emailService.sendWelcomeEmail(
          user.email,
          `${user.firstName} ${user.lastName}`,
          user.preferredLanguage
        );
      } catch (e) {
        this.logger.warn(`Could not send welcome email after Google register: ${e.message}`);
      }
    }

    return user;
  }
}