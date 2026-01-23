import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  UseGuards,
  Get,
  Req,
  Patch,
  Logger,
  Header,
  Query,
} from '@nestjs/common';

import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  ChangePasswordDto,
  RefreshTokenDto,
} from './dto/auth.dto';
import { CompleteGoogleRegisterDto } from './dto/complete-google-register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) { }

  @ApiOperation({ summary: 'Login con Google' })
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {
    // Initiates the Google OAuth2 login flow
  }

  @ApiOperation({ summary: 'Callback de Google Login' })
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const user = req.user;

    console.log('DEBUG: googleAuthRedirect user:', {
      email: user.email,
      id: user.id,
      role: user.role,
      isPendingRegistration: user.isPendingRegistration
    });

    // Frontend URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Handle Pending Registration
    if (user.isPendingRegistration) {
      const token = await this.authService.generateRegistrationToken(user);

      let redirectUrl = `${frontendUrl}/auth/complete-profile?token=${token}&email=${user.email}&name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}`;

      // Preserve plan info
      if ((user as any).plan) redirectUrl += `&plan=${(user as any).plan}`;
      if ((user as any).interval) redirectUrl += `&interval=${(user as any).interval}`;

      console.log('Redirecting to complete profile with:', redirectUrl);

      // CRITICAL: Clear any existing session to prevent Admin/Old user bleeding
      // Since we are entering a registration flow, we must ensure no other user is logged in
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/'
      };

      res.clearCookie('accessToken', cookieOptions);
      res.clearCookie('refreshToken', cookieOptions);
      // Try clearing without options just in case (for older cookies)
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      // Redirect to completion page
      return res.redirect(redirectUrl);
    }

    // Generate tokens
    const tokens = await this.authService.generateTokens(user);

    // Redirect with tokens in query params
    let redirectUrl = `${frontendUrl}/auth/login?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;

    // If plan info was preserved from registration state, pass it back to frontend
    // If plan info was preserved from registration state, pass it back to frontend
    if ((user as any).plan) {
      redirectUrl += `&plan=${(user as any).plan}`;
    }
    if ((user as any).interval) {
      redirectUrl += `&interval=${(user as any).interval}`;
    }

    // CRITICAL: Overwrite any existing session cookies (e.g. Admin) to prevent session bleeding
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    return res.redirect(redirectUrl);
  }

  @ApiOperation({ summary: 'Completar registro con Google' })
  @ApiResponse({ status: 200, description: 'Registro completado exitosamente', type: AuthResponseDto })
  @Post('google/complete')
  async completeGoogleRegistration(
    @Body() dto: CompleteGoogleRegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.completeGoogleRegistration(dto);

    if (result.tokens) {
      // Configurar cookies HttpOnly para seguridad (igual que en login/register) to overwrite any old session
      response.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutos
      });

      response.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });
    }

    return result;
  }

  @ApiOperation({ summary: 'Login de usuario' })
  @ApiResponse({ status: 200, description: 'Login exitoso', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const result = await this.authService.login(loginDto);

      // Configurar cookies HttpOnly para seguridad
      response.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutos
      });

      response.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      this.logger.log(`User logged in: ${result.user.email}`);

      return {
        message: 'Login exitoso',
        user: result.user,
        tokens: result.tokens,
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Registro de nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const result = await this.authService.register(registerDto);

      if (!result.tokens) {
        // Verification required case
        return {
          message: 'Usuario registrado. Por favor verifica tu email.',
          user: result.user,
          verificationRequired: true
        };
      }

      // Configurar cookies HttpOnly para seguridad
      response.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutos
      });

      response.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      this.logger.log(`New user registered: ${result.user.email}`);

      return {
        message: 'Usuario registrado exitosamente',
        user: result.user,
        tokens: result.tokens,
      };
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Renovar token de acceso' })
  @ApiResponse({ status: 200, description: 'Token renovado exitosamente' })
  @ApiResponse({ status: 401, description: 'Token de refresh inválido' })
  @Post('refresh')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const tokens = await this.authService.refreshToken(refreshTokenDto.refreshToken);

      // Actualizar cookies
      response.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutos
      });

      response.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      return {
        message: 'Token renovado exitosamente',
        tokens
      };
    } catch (error) {
      this.logger.error(`Token refresh error: ${error.message}`);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Verificar email' })
  @ApiResponse({ status: 200, description: 'Email verificado correctamente y usuario logueado', type: AuthResponseDto })
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string): Promise<AuthResponseDto> {
    return this.authService.verifyEmail(token);
  }

  @ApiOperation({ summary: 'Logout de usuario' })
  @ApiResponse({ status: 200, description: 'Logout exitoso' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: Request & { user: any },
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      await this.authService.logout(req.user.id);

      // Limpiar cookies
      response.clearCookie('accessToken', { path: '/' });
      response.clearCookie('refreshToken', { path: '/' });

      this.logger.log(`User logged out: ${req.user.id}`);

      return { message: 'Logout exitoso' };
    } catch (error) {
      this.logger.error(`Logout error: ${error.message}`);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Obtener información del usuario actual' })
  @ApiResponse({ status: 200, description: 'Información del usuario' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  async getProfile(@Req() req: Request & { user: any }) {
    return this.authService.getProfile(req.user.id);
  }

  @ApiOperation({ summary: 'Cambiar contraseña' })
  @ApiResponse({ status: 200, description: 'Contraseña cambiada exitosamente' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Req() req: Request & { user: any },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    try {
      const result = await this.authService.changePassword(
        req.user.id,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
      );

      this.logger.log(`Password changed for user: ${req.user.id}`);

      return result;
    } catch (error) {
      this.logger.error(`Change password error: ${error.message}`);
      throw error;
    }
  }
  @ApiOperation({ summary: 'Obtener clave pública para encriptación de login' })
  @ApiResponse({ status: 200, description: 'Clave pública RSA (PEM)' })
  @Get('public-key')
  getPublicKey() {
    return { publicKey: this.authService.getPublicKey() };
  }

  @ApiOperation({ summary: 'Actualizar perfil del usuario actual' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @Req() req: Request & { user: any },
    @Body() updateProfileDto: any, // Debería ser UpdateProfileDto, pero para evitar import circular si es necesario
  ) {
    try {
      const result = await this.authService.updateProfile(req.user.id, updateProfileDto);
      return result;
    } catch (error) {
      this.logger.error(`Update profile error: ${error.message}`);
      throw error;
    }
  }
}