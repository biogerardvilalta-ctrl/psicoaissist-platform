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
                clients: number;
                sessions: number;
                reports: number;
            };
            subscription: {
                id: string;
                userId: string;
                stripeSubscriptionId: string;
                status: string;
                planType: string;
                currentPeriodStart: Date;
                currentPeriodEnd: Date;
                canceledAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
            id: string;
            status: import(".prisma/client").$Enums.UserStatus;
            createdAt: Date;
            updatedAt: Date;
            email: string;
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
            enableReminders: boolean;
            defaultDuration: number;
            bufferTime: number;
            workStartHour: string;
            workEndHour: string;
            scheduleConfig: import("@prisma/client/runtime/library").JsonValue | null;
            preferredLanguage: string;
            stripeCustomerId: string | null;
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
        _count: {
            clients: number;
            sessions: number;
            reports: number;
        };
        clients: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            encryptedPersonalData: Buffer;
            encryptedClinicalData: Buffer | null;
            encryptedSensitiveData: Buffer | null;
            tags: string[];
            riskLevel: import(".prisma/client").$Enums.RiskLevel;
            isActive: boolean;
            encryptionKeyId: string;
            dataVersion: number;
            sendEmailReminders: boolean;
            sendWhatsappReminders: boolean;
            firstSessionAt: Date | null;
            lastSessionAt: Date | null;
            lastModifiedBy: string;
        }[];
        sessions: {
            id: string;
            userId: string;
            status: import(".prisma/client").$Enums.SessionStatus;
            createdAt: Date;
            updatedAt: Date;
            encryptionKeyId: string | null;
            clientId: string;
            startTime: Date;
            endTime: Date | null;
            duration: number | null;
            sessionType: import(".prisma/client").$Enums.SessionType;
            isMinor: boolean;
            reminderSent: boolean;
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
            status: import(".prisma/client").$Enums.ReportStatus;
            createdAt: Date;
            updatedAt: Date;
            encryptionKeyId: string;
            clientId: string;
            sessionId: string | null;
            title: string;
            reportType: import(".prisma/client").$Enums.ReportType;
            version: number;
            encryptedContent: Buffer;
            encryptedMetadata: Buffer | null;
            templateId: string | null;
            aiGenerated: boolean;
            aiConfidence: number | null;
            professionalSignature: string | null;
            humanReviewConfirmed: boolean;
            logMetadata: import("@prisma/client/runtime/library").JsonValue | null;
            completedAt: Date | null;
        }[];
        subscription: {
            id: string;
            userId: string;
            stripeSubscriptionId: string;
            status: string;
            planType: string;
            currentPeriodStart: Date;
            currentPeriodEnd: Date;
            canceledAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        email: string;
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
        enableReminders: boolean;
        defaultDuration: number;
        bufferTime: number;
        workStartHour: string;
        workEndHour: string;
        scheduleConfig: import("@prisma/client/runtime/library").JsonValue | null;
        preferredLanguage: string;
        stripeCustomerId: string | null;
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
            stripeSubscriptionId: string;
            status: string;
            planType: string;
            currentPeriodStart: Date;
            currentPeriodEnd: Date;
            canceledAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
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
