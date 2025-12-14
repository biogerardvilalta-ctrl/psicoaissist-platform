import { MonitoringService } from '../monitoring/monitoring.service';
export declare class HealthController {
    private readonly monitoringService;
    constructor(monitoringService: MonitoringService);
    healthCheck(): Promise<{
        status: "healthy" | "degraded" | "unhealthy";
        timestamp: Date;
        checks: Record<string, boolean>;
    }>;
    getMetrics(): Promise<{
        metrics: import("../monitoring/monitoring.service").SystemMetrics;
        timestamp: Date;
    }>;
    getStatus(): Promise<{
        health: "healthy" | "degraded" | "unhealthy";
        uptime: number;
        memory: {
            used: number;
            total: number;
            percentage: number;
        };
        performance: {
            totalRequests: number;
            avgResponseTime: number;
            errorRate: number;
        };
        users: {
            active: number;
        };
        database: {
            connections: number;
        };
        timestamp: Date;
    }>;
}
