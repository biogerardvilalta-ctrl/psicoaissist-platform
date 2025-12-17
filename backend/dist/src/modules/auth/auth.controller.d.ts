import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ChangePasswordDto, RefreshTokenDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    private readonly logger;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, response: Response): Promise<{
        message: string;
        user: import("./dto/auth.dto").UserResponseDto;
        tokens: import("./dto/auth.dto").TokensDto;
    }>;
    register(registerDto: RegisterDto, response: Response): Promise<{
        message: string;
        user: import("./dto/auth.dto").UserResponseDto;
        tokens: import("./dto/auth.dto").TokensDto;
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto, response: Response): Promise<{
        message: string;
        tokens: import("./dto/auth.dto").TokensDto;
    }>;
    logout(req: Request & {
        user: any;
    }, response: Response): Promise<{
        message: string;
    }>;
    getProfile(req: Request & {
        user: any;
    }): Promise<{
        user: any;
    }>;
    changePassword(req: Request & {
        user: any;
    }, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getPublicKey(): {
        publicKey: string;
    };
    updateProfile(req: Request & {
        user: any;
    }, updateProfileDto: any): Promise<any>;
}
