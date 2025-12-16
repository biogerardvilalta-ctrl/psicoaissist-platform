import { UsersService } from '../users/users.service';
import { PaymentsService } from '../payments/payments.service';
import { PrismaService } from '../../common/prisma/prisma.service';
export declare class AdminController {
    private readonly usersService;
    private readonly paymentsService;
    private readonly prisma;
    constructor(usersService: UsersService, paymentsService: PaymentsService, prisma: PrismaService);
    getDashboardStats(): Promise<{
        totalUsers: number;
        activeSubscriptions: number;
        totalRevenue: number;
        recentSignups: number;
        subscriptionStats: Record<string, Record<string, number>>;
    }>;
    getUsers(page?: string, limit?: string, search?: string, plan?: string, status?: string): Promise<{
        users: {
            passwordHash: any;
            _count: {
                sessions: number;
                reports: number;
                clients: number;
            };
            subscription: {
                id: string;
                userId: string;
                createdAt: Date;
                status: string;
                updatedAt: Date;
                stripeSubscriptionId: string;
                planType: string;
                currentPeriodStart: Date;
                currentPeriodEnd: Date;
                canceledAt: Date | null;
            };
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.UserStatus;
            updatedAt: Date;
            email: string;
            stripeCustomerId: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            verified: boolean;
            verificationToken: string | null;
            resetPasswordToken: string | null;
            resetPasswordExpires: Date | null;
            firstName: string | null;
            lastName: string | null;
            phone: string | null;
            country: string | null;
            professionalNumber: string | null;
            speciality: string | null;
            lastLogin: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getUserDetails(id: string): Promise<{
        passwordHash: any;
        sessions: {
            id: string;
            userId: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.SessionStatus;
            encryptionKeyId: string | null;
            updatedAt: Date;
            clientId: string;
            startTime: Date;
            endTime: Date | null;
            duration: number | null;
            sessionType: import(".prisma/client").$Enums.SessionType;
            isMinor: boolean;
            encryptedTranscription: Buffer | null;
            encryptedNotes: Buffer | null;
            encryptedAudioPath: string | null;
            aiSuggestions: import("@prisma/client/runtime/library").JsonValue | null;
            aiMetadata: import("@prisma/client/runtime/library").JsonValue | null;
            audioQuality: import(".prisma/client").$Enums.AudioQuality | null;
            recordingConsent: boolean;
            consentSigned: boolean;
            consentTimestamp: Date | null;
            consentVersion: string | null;
            startedAt: Date | null;
        }[];
        reports: {
            id: string;
            userId: string;
            createdAt: Date;
            title: string;
            reportType: import(".prisma/client").$Enums.ReportType;
            status: import(".prisma/client").$Enums.ReportStatus;
            version: number;
            encryptedContent: Buffer;
            encryptedMetadata: Buffer | null;
            templateId: string | null;
            aiGenerated: boolean;
            aiConfidence: number | null;
            professionalSignature: string | null;
            humanReviewConfirmed: boolean;
            logMetadata: import("@prisma/client/runtime/library").JsonValue | null;
            encryptionKeyId: string;
            updatedAt: Date;
            completedAt: Date | null;
            clientId: string;
            sessionId: string | null;
        }[];
        _count: {
            sessions: number;
            reports: number;
            clients: number;
        };
        clients: {
            id: string;
            userId: string;
            isActive: boolean;
            createdAt: Date;
            encryptionKeyId: string;
            updatedAt: Date;
            encryptedPersonalData: Buffer;
            encryptedClinicalData: Buffer | null;
            encryptedSensitiveData: Buffer | null;
            tags: string[];
            riskLevel: import(".prisma/client").$Enums.RiskLevel;
            dataVersion: number;
            firstSessionAt: Date | null;
            lastSessionAt: Date | null;
            lastModifiedBy: string;
        }[];
        subscription: {
            id: string;
            userId: string;
            createdAt: Date;
            status: string;
            updatedAt: Date;
            stripeSubscriptionId: string;
            planType: string;
            currentPeriodStart: Date;
            currentPeriodEnd: Date;
            canceledAt: Date | null;
        };
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.UserStatus;
        updatedAt: Date;
        email: string;
        stripeCustomerId: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        verified: boolean;
        verificationToken: string | null;
        resetPasswordToken: string | null;
        resetPasswordExpires: Date | null;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        country: string | null;
        professionalNumber: string | null;
        speciality: string | null;
        lastLogin: Date | null;
    }>;
    updateUserStatus(id: string, body: {
        status: string;
        reason?: string;
    }): Promise<import("../users/dto/users.dto").UserResponseDto>;
    deleteUser(id: string, body: {
        reason: string;
    }): Promise<{
        message: string;
    }>;
    getSubscriptions(page?: string, limit?: string, status?: string, plan?: string): Promise<{
        subscriptions: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            userId: string;
            createdAt: Date;
            status: string;
            updatedAt: Date;
            stripeSubscriptionId: string;
            planType: string;
            currentPeriodStart: Date;
            currentPeriodEnd: Date;
            canceledAt: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    cancelSubscription(id: string, body: {
        reason: string;
    }): Promise<{
        message: string;
    }>;
    private calculateTotalRevenue;
    private getSubscriptionStats;
    private logAdminAction;
}
