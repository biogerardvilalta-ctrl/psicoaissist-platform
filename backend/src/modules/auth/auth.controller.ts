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
import { JwtService } from '@nestjs/jwt';

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

  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) { }

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

    // Frontend URL Logic: Prefer ENV, fallback to headers (dynamic), then localhost default
    let frontendUrl = process.env.FRONTEND_URL;

    // Smart detection for Nginx/Proxy environments if ENV is missing
    if (!frontendUrl && req.headers.host) {
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      // Use the host header (which will be the domain name in Nginx)
      // Fix for Local Dev: If host is backend port (3001), don't use it as frontend base
      if (req.headers.host.includes(':3001')) {
        frontendUrl = 'http://localhost:3000';
      } else {
        frontendUrl = `${protocol}://${req.headers.host}`;
      }
      console.log('Dynamically detected FRONTEND_URL from headers:', frontendUrl);
    }

    // Ultimate fallback
    if (!frontendUrl) {
      frontendUrl = 'http://localhost:3000';
    }

    // Handle Guard Error (Fix for Headers Sent issue)
    if (user && user._isError) {
      const errorType = user.errorType || 'auth_failed';
      const errorDesc = user.message || 'Unknown error';
      console.warn('Handling authentication error in controller:', errorDesc);

      return res.redirect(`${frontendUrl}/auth/login?error=${errorType}&error_description=${encodeURIComponent(errorDesc)}`);
    }

    console.log('--------------------------------------------------');
    console.log('DEBUG GOOGLE REDIRECT:');
    console.log('process.env.FRONTEND_URL:', process.env.FRONTEND_URL);
    console.log('Computed frontendUrl:', frontendUrl);
    console.log('--------------------------------------------------');

    // Handle Pending Registration
    if (user.isPendingRegistration) {
      const token = await this.authService.generateRegistrationToken(user);

      let redirectUrl = `${frontendUrl}/auth/complete-profile?token=${token}&email=${user.email}&name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}`;

      // Preserve plan info
      if ((user as any).plan) redirectUrl += `&plan=${(user as any).plan}`;
      if ((user as any).interval) redirectUrl += `&interval=${(user as any).interval}`;

      // CRITICAL: Clear any existing session to prevent Admin/Old user bleeding
      if (!res.headersSent) {
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
      } else {
        console.warn('Headers already sent in googleAuthRedirect, cannot redirect or clear cookies.');
        return;
      }
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

    if (!res.headersSent) {
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
    } else {
      console.warn('Headers already sent in googleAuthRedirect (login flow), cannot redirect.');
    }
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
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Extract token manually since we removed the Guard to allow clearing cookies even with expired tokens
    const authHeader = req.headers.authorization;
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = this.jwtService.decode(token) as any;
        if (payload && payload.sub) {
          userId = payload.sub;
        }
      } catch (e) {
        // Ignore invalid tokens, we just want to clear cookies
      }
    }

    try {
      if (userId) {
        await this.authService.logout(userId);
        this.logger.log(`User logged out: ${userId}`);
      } else {
        this.logger.log(`Anonymous/Invalid Session Logout`);
      }

      // Limpiar cookies
      response.clearCookie('accessToken', { path: '/' });
      response.clearCookie('refreshToken', { path: '/' });

      return { message: 'Logout exitoso' };
    } catch (error) {
      this.logger.error(`Logout error: ${error.message}`);
      // Don't throw, just ensure cookies are cleared
      response.clearCookie('accessToken', { path: '/' });
      response.clearCookie('refreshToken', { path: '/' });
      return { message: 'Logout exitoso (con error interno controlado)' };
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