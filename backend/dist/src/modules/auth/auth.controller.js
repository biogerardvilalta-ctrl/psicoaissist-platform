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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const auth_dto_1 = require("./dto/auth.dto");
let AuthController = AuthController_1 = class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    async login(loginDto, response) {
        try {
            const result = await this.authService.login(loginDto);
            response.cookie('accessToken', result.tokens.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000,
            });
            response.cookie('refreshToken', result.tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            this.logger.log(`User logged in: ${result.user.email}`);
            return {
                message: 'Login exitoso',
                user: result.user,
                tokens: result.tokens,
            };
        }
        catch (error) {
            this.logger.error(`Login error: ${error.message}`);
            throw error;
        }
    }
    async register(registerDto, response) {
        try {
            const result = await this.authService.register(registerDto);
            response.cookie('accessToken', result.tokens.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000,
            });
            response.cookie('refreshToken', result.tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            this.logger.log(`New user registered: ${result.user.email}`);
            return {
                message: 'Usuario registrado exitosamente',
                user: result.user,
                tokens: result.tokens,
            };
        }
        catch (error) {
            this.logger.error(`Registration error: ${error.message}`);
            throw error;
        }
    }
    async refreshToken(refreshTokenDto, response) {
        try {
            const tokens = await this.authService.refreshToken(refreshTokenDto.refreshToken);
            response.cookie('accessToken', tokens.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000,
            });
            response.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return {
                message: 'Token renovado exitosamente',
                tokens
            };
        }
        catch (error) {
            this.logger.error(`Token refresh error: ${error.message}`);
            throw error;
        }
    }
    async logout(req, response) {
        try {
            await this.authService.logout(req.user.id);
            response.clearCookie('accessToken');
            response.clearCookie('refreshToken');
            this.logger.log(`User logged out: ${req.user.id}`);
            return { message: 'Logout exitoso' };
        }
        catch (error) {
            this.logger.error(`Logout error: ${error.message}`);
            throw error;
        }
    }
    async getProfile(req) {
        return {
            user: req.user,
        };
    }
    async changePassword(req, changePasswordDto) {
        try {
            const result = await this.authService.changePassword(req.user.id, changePasswordDto.currentPassword, changePasswordDto.newPassword);
            this.logger.log(`Password changed for user: ${req.user.id}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Change password error: ${error.message}`);
            throw error;
        }
    }
    getPublicKey() {
        return { publicKey: this.authService.getPublicKey() };
    }
    async updateProfile(req, updateProfileDto) {
        try {
            const result = await this.authService.updateProfile(req.user.id, updateProfileDto);
            return result;
        }
        catch (error) {
            this.logger.error(`Update profile error: ${error.message}`);
            throw error;
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Login de usuario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login exitoso', type: auth_dto_1.AuthResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Credenciales incorrectas' }),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Registro de nuevo usuario' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Usuario registrado exitosamente', type: auth_dto_1.AuthResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email ya registrado' }),
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Renovar token de acceso' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token renovado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token de refresh inválido' }),
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RefreshTokenDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Logout de usuario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logout exitoso' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obtener información del usuario actual' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Información del usuario' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Cambiar contraseña' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contraseña cambiada exitosamente' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('change-password'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obtener clave pública para encriptación de login' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Clave pública RSA (PEM)' }),
    (0, common_1.Get)('public-key'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getPublicKey", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar perfil del usuario actual' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Perfil actualizado exitosamente' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('me'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map