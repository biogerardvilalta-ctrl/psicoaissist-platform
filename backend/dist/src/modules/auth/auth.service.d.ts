import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { LoginDto, RegisterDto, TokensDto, AuthResponseDto } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly encryptionService;
    private readonly usersService;
    private readonly configService;
    private readonly emailService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, encryptionService: EncryptionService, usersService: UsersService, configService: ConfigService, emailService: EmailService);
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    generateTokens(user: any): Promise<TokensDto>;
    refreshToken(refreshToken: string): Promise<TokensDto>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    private logAuthAttempt;
    getPublicKey(): string;
    updateProfile(userId: string, data: any): Promise<any>;
}
