import { UserRole } from '@prisma/client';
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
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
}
export declare class AuthResponseDto {
    user: UserResponseDto;
    tokens: TokensDto;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
