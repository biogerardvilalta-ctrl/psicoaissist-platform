import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SystemMetrics {
  activeUsers: number;
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
  databaseConnections: number;
  memoryUsage: NodeJS.MemoryUsage;
  uptime: number;
}

export interface RequestLog {
  id: string;
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  userId?: string;
  ip: string;
  userAgent?: string;
  timestamp: Date;
  error?: string;
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private requestsCount = 0;
  private totalResponseTime = 0;
  private errorCount = 0;

  constructor(private prisma: PrismaService) {}

  /**
   * Log request for monitoring purposes
   */
  async logRequest(request: Partial<RequestLog>): Promise<void> {
    try {
      this.requestsCount++;
      
      if (request.duration) {
        this.totalResponseTime += request.duration;
      }
      
      if (request.statusCode && request.statusCode >= 400) {
        this.errorCount++;
      }

      // Store in database for historical analysis
      await this.prisma.auditLog.create({
        data: {
          action: 'READ', // Using READ as generic action for HTTP requests
          resourceType: 'HTTP_REQUEST',
          resourceId: request.url || null,
          userId: request.userId || null,
          ipAddress: request.ip || '127.0.0.1',
          userAgent: request.userAgent,
          method: request.method,
          url: request.url,
          metadata: {
            statusCode: request.statusCode,
            duration: request.duration,
            error: request.error,
          },
          isSuccess: !request.error && (request.statusCode || 0) < 400,
          errorMessage: request.error,
          createdAt: request.timestamp || new Date(),
        },
      });
    } catch (error) {
      this.logger.error('Failed to log request', error);
    }
  }

  /**
   * Get current system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const [activeUsers] = await Promise.all([
        this.getActiveUsersCount(),
      ]);

      const avgResponseTime = this.requestsCount > 0 
        ? this.totalResponseTime / this.requestsCount 
        : 0;

      const errorRate = this.requestsCount > 0 
        ? (this.errorCount / this.requestsCount) * 100 
        : 0;

      return {
        activeUsers,
        totalRequests: this.requestsCount,
        errorRate: Math.round(errorRate * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime * 100) / 100,
        databaseConnections: await this.getDatabaseConnectionCount(),
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
      };
    } catch (error) {
      this.logger.error('Failed to get system metrics', error);
      throw error;
    }
  }

  /**
   * Get health check status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    timestamp: Date;
  }> {
    const checks: Record<string, boolean> = {};

    try {
      // Database connectivity check
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch {
      checks.database = false;
    }

    // Memory usage check (warn if > 80% of 2GB)
    const memUsage = process.memoryUsage();
    checks.memory = memUsage.heapUsed < (2 * 1024 * 1024 * 1024 * 0.8);

    // Error rate check (warn if > 5%)
    const errorRate = this.requestsCount > 0 
      ? (this.errorCount / this.requestsCount) * 100 
      : 0;
    checks.errorRate = errorRate < 5;

    const healthyChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (healthyChecks === 0) {
      status = 'unhealthy';
    } else if (healthyChecks < totalChecks) {
      status = 'degraded';
    }

    return {
      status,
      checks,
      timestamp: new Date(),
    };
  }

  /**
   * Reset metrics (useful for testing or periodic resets)
   */
  resetMetrics(): void {
    this.requestsCount = 0;
    this.totalResponseTime = 0;
    this.errorCount = 0;
    this.logger.log('Metrics reset successfully');
  }

  private async getActiveUsersCount(): Promise<number> {
    try {
      // Consider users active if they've logged in within the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const count = await this.prisma.user.count({
        where: {
          lastLogin: {
            gte: oneHourAgo,
          },
          status: 'ACTIVE',
        },
      });
      return count;
    } catch (error) {
      this.logger.error('Failed to get active users count', error);
      return 0;
    }
  }

  private async getDatabaseConnectionCount(): Promise<number> {
    try {
      // This is a simplified approach - in production you might want
      // to use more sophisticated connection pool monitoring
      const result = await this.prisma.$queryRaw<[{ count: number }]>`
        SELECT count(*) as count FROM pg_stat_activity 
        WHERE datname = current_database()
      `;
      return Number(result[0]?.count || 0);
    } catch (error) {
      this.logger.error('Failed to get database connection count', error);
      return 0;
    }
  }
}