import { UserRole } from '@prisma/client';
export declare class LoginDto {
    email?: string;
    password?: string;
    encryptedData?: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    professionalNumber: string;
    country: string;
}
export declare class TokensDto {
    accessToken: string;
    refreshToken: string;
}
export declare class UserResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: string;
    enableReminders: boolean;
    defaultDuration: number;
    bufferTime: number;
    workStartHour: string;
    workEndHour: string;
    preferredLanguage: string;
    scheduleConfig?: any;
    dashboardLayout?: string[];
}
export declare class AuthResponseDto {
    user: UserResponseDto;
    tokens: TokensDto;
    encryptionKey: {
        id: string;
        key: string;
    };
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    professionalNumber?: string;
    country?: string;
    enableReminders?: boolean;
    defaultDuration?: number;
    bufferTime?: number;
    workStartHour?: string;
    workEndHour?: string;
    preferredLanguage?: string;
    scheduleConfig?: any;
}
