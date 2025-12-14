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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const encryption_service_1 = require("../encryption/encryption.service");
const client_1 = require("@prisma/client");
let UsersService = UsersService_1 = class UsersService {
    constructor(prisma, encryptionService) {
        this.prisma = prisma;
        this.encryptionService = encryptionService;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async create(createUserDto) {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: createUserDto.email.toLowerCase() },
            });
            if (existingUser) {
                throw new common_1.ConflictException('El email ya está registrado');
            }
            const passwordHash = await this.encryptionService.hashPassword(createUserDto.password);
            const user = await this.prisma.user.create({
                data: {
                    email: createUserDto.email.toLowerCase(),
                    passwordHash,
                    firstName: createUserDto.firstName,
                    lastName: createUserDto.lastName,
                    role: createUserDto.role || client_1.UserRole.PSYCHOLOGIST,
                    plan: client_1.UserPlan.BASIC,
                    status: client_1.UserStatus.ACTIVE,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            this.logger.log(`User created: ${user.email}`);
            return this.mapToResponseDto(user);
        }
        catch (error) {
            this.logger.error(`Error creating user: ${error.message}`);
            throw error;
        }
    }
    async findAll(page = 1, limit = 10) {
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
        }
        catch (error) {
            this.logger.error(`Error fetching users: ${error.message}`);
            throw error;
        }
    }
    async findOne(id) {
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
                },
            });
            if (!user) {
                throw new common_1.NotFoundException('Usuario no encontrado');
            }
            return this.mapToResponseDto(user);
        }
        catch (error) {
            this.logger.error(`Error fetching user: ${error.message}`);
            throw error;
        }
    }
    async findByEmail(email) {
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
        }
        catch (error) {
            this.logger.error(`Error fetching user by email: ${error.message}`);
            throw error;
        }
    }
    async update(id, updateUserDto) {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { id },
            });
            if (!existingUser) {
                throw new common_1.NotFoundException('Usuario no encontrado');
            }
            if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
                const emailInUse = await this.prisma.user.findUnique({
                    where: { email: updateUserDto.email.toLowerCase() },
                });
                if (emailInUse) {
                    throw new common_1.ConflictException('El email ya está en uso');
                }
            }
            const updateData = {
                ...updateUserDto,
                updatedAt: new Date(),
            };
            if (updateUserDto.email) {
                updateData.email = updateUserDto.email.toLowerCase();
            }
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
        }
        catch (error) {
            this.logger.error(`Error updating user: ${error.message}`);
            throw error;
        }
    }
    async remove(id) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
            });
            if (!user) {
                throw new common_1.NotFoundException('Usuario no encontrado');
            }
            await this.prisma.user.update({
                where: { id },
                data: {
                    status: client_1.UserStatus.INACTIVE,
                    updatedAt: new Date(),
                },
            });
            this.logger.log(`User deleted: ${user.email}`);
            return { message: 'Usuario eliminado exitosamente' };
        }
        catch (error) {
            this.logger.error(`Error deleting user: ${error.message}`);
            throw error;
        }
    }
    async changeRole(id, newRole) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
            });
            if (!user) {
                throw new common_1.NotFoundException('Usuario no encontrado');
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
        }
        catch (error) {
            this.logger.error(`Error changing user role: ${error.message}`);
            throw error;
        }
    }
    mapToResponseDto(user) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService])
], UsersService);
//# sourceMappingURL=users.service.js.map