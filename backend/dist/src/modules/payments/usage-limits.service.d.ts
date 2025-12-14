import { PrismaService } from '../../common/prisma/prisma.service';
export declare class UsageLimitsService {
    private prisma;
    constructor(prisma: PrismaService);
    checkClientLimit(userId: string): Promise<void>;
    checkTranscriptionLimit(userId: string, hoursToAdd?: number): Promise<void>;
    checkReportsLimit(userId: string): Promise<void>;
    getUserUsage(userId: string): Promise<{
        planType: string;
        planFeatures: import("./plan-features").PlanFeatures;
        currentUsage: {
            clients: number;
            reportsThisMonth: number;
            transcriptionHours: number;
        };
        limits: {
            clients: number;
            reportsPerMonth: number;
            transcriptionHours: number;
        };
    }>;
}
