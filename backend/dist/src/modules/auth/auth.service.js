"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const encryption_service_1 = require("../encryption/encryption.service");
const users_service_1 = require("../users/users.service");
const email_service_1 = require("../email/email.service");
const client_1 = require("@prisma/client");
const config_1 = require("@nestjs/config");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, encryptionService, usersService, configService, emailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.encryptionService = encryptionService;
        this.usersService = usersService;
        this.configService = configService;
        this.emailService = emailService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async validateUser(email, password) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: email.toLowerCase() },
            });
            if (!user) {
                this.logger.warn(`Login attempt with non-existent email: ${email}`);
                return null;
            }
            if (user.status === client_1.UserStatus.PENDING_REVIEW) {
                this.logger.warn(`Login attempt with pending user: ${email}`);
                throw new common_1.UnauthorizedException('Tu cuenta está en revisión. Te notificaremos cuando sea validada.');
            }
            if (user.status === client_1.UserStatus.REJECTED) {
                this.logger.warn(`Login attempt with rejected user: ${email}`);
                throw new common_1.UnauthorizedException('Tu solicitud de registro ha sido rechazada.');
            }
            if (user.status !== client_1.UserStatus.ACTIVE && user.status !== client_1.UserStatus.VALIDATED) {
                this.logger.warn(`Login attempt with inactive user: ${email}`);
                throw new common_1.UnauthorizedException('Cuenta inactiva. Contacte al administrador.');
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
        }
        catch (error) {
            this.logger.error(`Error validating user: ${error.message}`);
            throw error;
        }
    }
    async login(loginDto) {
        let email = loginDto.email;
        let password = loginDto.password;
        if (loginDto.encryptedData) {
            try {
                const decryptedJson = await this.encryptionService.decryptAsymmetric(loginDto.encryptedData);
                const credentials = JSON.parse(decryptedJson);
                email = credentials.email;
                password = credentials.password;
            }
            catch (error) {
                throw new common_1.UnauthorizedException('Fallo al desencriptar credenciales: ' + error.message);
            }
        }
        if (!email || !password) {
            throw new common_1.UnauthorizedException('Email y contraseña son requeridos');
        }
        const user = await this.validateUser(email, password);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales incorrectas');
        }
        const tokens = await this.generateTokens(user);
        const encryptionKey = await this.encryptionService.getOrCreateEncryptionKey(user.id);
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
                scheduleConfig: user.scheduleConfig,
            },
            tokens,
            encryptionKey: {
                id: encryptionKey.id,
                key: encryptionKey.keyValue,
            },
        };
    }
    async register(registerDto) {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: registerDto.email.toLowerCase() },
            });
            if (existingUser) {
                throw new common_1.ConflictException('El email ya está registrado');
            }
            const passwordHash = await this.encryptionService.hashPassword(registerDto.password);
            const user = await this.prisma.user.create({
                data: {
                    email: registerDto.email.toLowerCase(),
                    passwordHash,
                    firstName: registerDto.firstName,
                    lastName: registerDto.lastName,
                    professionalNumber: registerDto.professionalNumber,
                    country: registerDto.country,
                    role: registerDto.role || client_1.UserRole.PSYCHOLOGIST,
                    status: client_1.UserStatus.PENDING_REVIEW,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            this.logger.log(`New user registered: ${user.email}`);
            try {
                await this.emailService.sendWelcomeEmail(user.email, `${user.firstName} ${user.lastName}`);
            }
            catch (emailError) {
                this.logger.warn(`Failed to send welcome email to ${user.email}: ${emailError.message}`);
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
                    enableReminders: user.enableReminders,
                    defaultDuration: user.defaultDuration,
                    bufferTime: user.bufferTime,
                    workStartHour: user.workStartHour,
                    workEndHour: user.workEndHour,
                    preferredLanguage: user.preferredLanguage,
                    scheduleConfig: user.scheduleConfig,
                },
                tokens,
                encryptionKey: {
                    id: encryptionKey.id,
                    key: encryptionKey.keyValue,
                },
            };
        }
        catch (error) {
            this.logger.error(`Error registering user: ${error.message}`);
            throw error;
        }
    }
    async generateTokens(user) {
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
    async refreshToken(refreshToken) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user || user.status !== client_1.UserStatus.ACTIVE) {
                throw new common_1.UnauthorizedException('Usuario no válido');
            }
            return this.generateTokens(user);
        }
        catch (error) {
            this.logger.error(`Error refreshing token: ${error.message}`);
            throw new common_1.UnauthorizedException('Token de refresh inválido');
        }
    }
    async logout(userId) {
        try {
            this.logger.log(`User logged out: ${userId}`);
            return { message: 'Logout exitoso' };
        }
        catch (error) {
            this.logger.error(`Error during logout: ${error.message}`);
            throw error;
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Usuario no encontrado');
            }
            const isCurrentPasswordValid = await this.encryptionService.comparePassword(currentPassword, user.passwordHash);
            if (!isCurrentPasswordValid) {
                throw new common_1.UnauthorizedException('Contraseña actual incorrecta');
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
        }
        catch (error) {
            this.logger.error(`Error changing password: ${error.message}`);
            throw error;
        }
    }
    async logAuthAttempt(userId, success) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId,
                    action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
                    resourceType: 'USER',
                    metadata: { timestamp: new Date(), success },
                    ipAddress: '',
                    userAgent: '',
                    isSuccess: success,
                },
            });
        }
        catch (error) {
            this.logger.error(`Error logging auth attempt: ${error.message}`);
        }
    }
    getPublicKey() {
        return this.encryptionService.getPublicKey();
    }
    async updateProfile(userId, data) {
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
                    scheduleConfig: data.scheduleConfig,
                    preferredLanguage: data.preferredLanguage,
                    updatedAt: new Date(),
                },
            });
            this.logger.log(`Profile updated for user: ${userId}`);
            const { passwordHash, ...result } = user;
            return result;
        }
        catch (error) {
            this.logger.error(`Error updating profile: ${error.message}`);
            throw error;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        encryption_service_1.EncryptionService,
        users_service_1.UsersService,
        config_1.ConfigService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map