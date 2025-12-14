import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MonitoringService } from '../monitoring/monitoring.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'System health status' })
  @Get()
  async healthCheck() {
    const health = await this.monitoringService.getHealthStatus();
    return {
      status: health.status,
      timestamp: health.timestamp,
      checks: health.checks,
    };
  }

  @ApiOperation({ summary: 'System metrics for monitoring' })
  @ApiResponse({ status: 200, description: 'System performance metrics' })
  @Get('metrics')
  async getMetrics() {
    const metrics = await this.monitoringService.getSystemMetrics();
    return {
      metrics,
      timestamp: new Date(),
    };
  }

  @ApiOperation({ summary: 'Detailed system status' })
  @ApiResponse({ status: 200, description: 'Comprehensive system status' })
  @Get('status')
  async getStatus() {
    const [health, metrics] = await Promise.all([
      this.monitoringService.getHealthStatus(),
      this.monitoringService.getSystemMetrics(),
    ]);

    return {
      health: health.status,
      uptime: metrics.uptime,
      memory: {
        used: Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(metrics.memoryUsage.heapTotal / 1024 / 1024),
        percentage: Math.round(
          (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100
        ),
      },
      performance: {
        totalRequests: metrics.totalRequests,
        avgResponseTime: metrics.avgResponseTime,
        errorRate: metrics.errorRate,
      },
      users: {
        active: metrics.activeUsers,
      },
      database: {
        connections: metrics.databaseConnections,
      },
      timestamp: new Date(),
    };
  }
}