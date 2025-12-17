import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { LoginDto, RegisterDto, TokensDto, AuthResponseDto } from './dto/auth.dto';
import { UserRole, UserStatus } from '@prisma/client';
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
  ) { }

  /**
   * Valida las credenciales del usuario
   */
  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
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
        throw new ConflictException('El email ya está registrado');
      }

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
          status: UserStatus.PENDING_REVIEW,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log(`New user registered: ${user.email}`);

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
      this.logger.log(`User logged out: ${userId}`);

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
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
          resourceType: 'USER',
          metadata: { timestamp: new Date(), success },
          ipAddress: '', // Se puede obtener del request
          userAgent: '', // Se puede obtener del request
          isSuccess: success,
        },
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
          preferredLanguage: data.preferredLanguage,
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
}