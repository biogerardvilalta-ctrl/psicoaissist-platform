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
var UsersController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const users_dto_1 = require("./dto/users.dto");
const client_1 = require("@prisma/client");
let UsersController = UsersController_1 = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
        this.logger = new common_1.Logger(UsersController_1.name);
    }
    async create(createUserDto) {
        try {
            const result = await this.usersService.create(createUserDto);
            this.logger.log(`User created via admin: ${createUserDto.email}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error creating user: ${error.message}`);
            throw error;
        }
    }
    async findAll(page = 1, limit = 10) {
        try {
            return await this.usersService.findAll(page, limit);
        }
        catch (error) {
            this.logger.error(`Error fetching users: ${error.message}`);
            throw error;
        }
    }
    async findOne(id) {
        try {
            return await this.usersService.findOne(id);
        }
        catch (error) {
            this.logger.error(`Error fetching user: ${error.message}`);
            throw error;
        }
    }
    async update(id, updateUserDto) {
        try {
            const result = await this.usersService.update(id, updateUserDto);
            this.logger.log(`User updated: ${id}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error updating user: ${error.message}`);
            throw error;
        }
    }
    async remove(id) {
        try {
            const result = await this.usersService.remove(id);
            this.logger.log(`User deleted: ${id}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error deleting user: ${error.message}`);
            throw error;
        }
    }
    async updateDashboardLayout(id, body) {
        try {
            return await this.usersService.updateDashboardLayout(id, body.layout);
        }
        catch (error) {
            this.logger.error(`Error updating dashboard layout: ${error.message}`);
            throw error;
        }
    }
    async changeRole(id, changeRoleDto) {
        try {
            const result = await this.usersService.changeRole(id, changeRoleDto.role);
            this.logger.log(`User role changed: ${id} -> ${changeRoleDto.role}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error changing user role: ${error.message}`);
            throw error;
        }
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Crear nuevo usuario (solo administradores)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Usuario creado exitosamente', type: users_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email ya registrado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acceso denegado' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todos los usuarios con paginación' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de usuarios' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Número de página' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Elementos por página' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obtener usuario por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usuario encontrado', type: users_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario no encontrado' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.PSYCHOLOGIST),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar usuario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usuario actualizado exitosamente', type: users_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario no encontrado' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, users_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar usuario (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usuario eliminado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario no encontrado' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar layout del dashboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Layout actualizado', type: users_dto_1.UserResponseDto }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.PSYCHOLOGIST, client_1.UserRole.PSYCHOLOGIST_BASIC, client_1.UserRole.PSYCHOLOGIST_PRO, client_1.UserRole.PSYCHOLOGIST_PREMIUM),
    (0, common_1.Patch)(':id/dashboard-layout'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateDashboardLayout", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Cambiar rol de usuario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rol cambiado exitosamente', type: users_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario no encontrado' }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Patch)(':id/role'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, users_dto_1.ChangeRoleDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changeRole", null);
exports.UsersController = UsersController = UsersController_1 = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map