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
export declare class MonitoringService {
    private prisma;
    private readonly logger;
    private requestsCount;
    private totalResponseTime;
    private errorCount;
    constructor(prisma: PrismaService);
    logRequest(request: Partial<RequestLog>): Promise<void>;
    getSystemMetrics(): Promise<SystemMetrics>;
    getHealthStatus(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        checks: Record<string, boolean>;
        timestamp: Date;
    }>;
    resetMetrics(): void;
    private getActiveUsersCount;
    private getDatabaseConnectionCount;
}
