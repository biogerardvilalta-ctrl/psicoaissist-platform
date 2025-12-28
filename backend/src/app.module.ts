import { Module } from '@nestjs/common';
// Force rebuild for Prisma Client update
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ScheduleModule } from '@nestjs/schedule';

// Configuration
import { DatabaseConfig } from './config/database.config';
import { JwtConfig } from './config/jwt.config';
import { RedisConfig } from './config/redis.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AiModule } from './modules/ai/ai.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuditModule } from './modules/audit/audit.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { GoogleModule } from './modules/google/google.module';
import { SimulatorModule } from './modules/simulator/simulator.module';
// import { HealthModule } from './modules/health/health.module';

// Shared services
import { PrismaModule } from './common/prisma/prisma.module';
import { MonitoringModule } from './common/monitoring.module';
import { EncryptionModule } from './modules/encryption/encryption.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [DatabaseConfig, JwtConfig, RedisConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Cron Jobs
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'default',
          ttl: config.get('THROTTLE_TTL') || 60000, // 1 minute
          limit: config.get('THROTTLE_LIMIT') || 100, // 100 requests per minute
        },
        {
          name: 'auth',
          ttl: config.get('AUTH_THROTTLE_TTL') || 900000, // 15 minutes
          limit: config.get('AUTH_THROTTLE_LIMIT') || 5, // 5 auth attempts per 15 min
        },
      ],
    }),

    // Cache with Redis
    // TODO: Fix Redis configuration
    /*
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST') || 'localhost',
        port: config.get('REDIS_PORT') || 6379,
        password: config.get('REDIS_PASSWORD'),
        ttl: config.get('CACHE_TTL') || 300, // 5 minutes default
      }),
      isGlobal: true,
    }),
    */

    // Core modules
    PrismaModule,
    MonitoringModule,
    EncryptionModule,

    // Feature modules
    AuthModule,
    UsersModule,
    PaymentsModule,
    AdminModule,
    ClientsModule,
    DashboardModule,
    SessionsModule,
    ReportsModule,
    AiModule,
    AuditModule,
    RemindersModule,
    GoogleModule,
    SimulatorModule, // Clinical Simulator
    // HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }