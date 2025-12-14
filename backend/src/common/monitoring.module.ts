import { Module, Global } from '@nestjs/common';
import { MonitoringService } from './monitoring/monitoring.service';
import { HealthController } from './health/health.controller';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { PrismaModule } from './prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [MonitoringService, LoggingInterceptor],
  controllers: [HealthController],
  exports: [MonitoringService, LoggingInterceptor],
})
export class MonitoringModule {}