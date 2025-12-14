export declare enum PlanLimits {
    BASIC_MAX_CLIENTS = 25,
    BASIC_TRANSCRIPTION_HOURS = 50,
    BASIC_REPORTS = 100,
    PRO_TRANSCRIPTION_HOURS = 200,
    UNLIMITED = -1
}
export interface PlanFeatures {
    maxClients: number;
    transcriptionHours: number;
    reportsPerMonth: number;
    supportLevel: 'email' | 'priority' | 'phone';
    advancedAnalytics?: boolean;
    apiAccess?: boolean;
    customBranding?: boolean;
    ssoIntegration?: boolean;
    prioritySupport?: boolean;
}
export declare const PLAN_FEATURES: Record<string, PlanFeatures>;
