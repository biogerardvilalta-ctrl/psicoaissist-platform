import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Primero intentar extraer del cookie (suele ser más fiable/actualizado por el backend)
        (request) => {
          return request?.cookies?.accessToken;
        },
        // Luego el header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    // Extract token to check blacklist
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req) || req?.cookies?.accessToken;
    if (token) {
      const isBlacklisted = await this.cacheManager.get(`blacklist_${token}`);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token invalidado (logout)');
      }
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        dashboardLayout: true,
        googleRefreshToken: true,
        verified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (user.status !== UserStatus.ACTIVE) {
      // Allow INACTIVE if verified (for payment completion)
      if (user.status === UserStatus.INACTIVE && (user as any).verified) {
        // Allowed
      } else {
        throw new UnauthorizedException('Usuario inactivo');
      }
    }

    return user;
  }
}