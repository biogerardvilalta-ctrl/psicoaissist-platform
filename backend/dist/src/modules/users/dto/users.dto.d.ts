import { UserRole, UserStatus } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    professionalNumber: string;
    country: string;
}
export declare class UpdateUserDto {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    status?: UserStatus;
}
export declare class UserResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: UserStatus;
    createdAt: Date;
    lastLogin?: Date;
}
export declare class ChangeRoleDto {
    role: UserRole;
}
