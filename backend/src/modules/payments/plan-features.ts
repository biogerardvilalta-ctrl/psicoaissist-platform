export enum PlanLimits {
  BASIC_MAX_CLIENTS = 25,
  BASIC_TRANSCRIPTION_HOURS = 50,
  BASIC_REPORTS = 100,

  PRO_TRANSCRIPTION_HOURS = 200,
  
  // -1 significa ilimitado
  UNLIMITED = -1,
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

export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  basic: {
    maxClients: PlanLimits.BASIC_MAX_CLIENTS,
    transcriptionHours: PlanLimits.BASIC_TRANSCRIPTION_HOURS,
    reportsPerMonth: PlanLimits.BASIC_REPORTS,
    supportLevel: 'email',
  },
  pro: {
    maxClients: PlanLimits.UNLIMITED,
    transcriptionHours: PlanLimits.PRO_TRANSCRIPTION_HOURS,
    reportsPerMonth: PlanLimits.UNLIMITED,
    supportLevel: 'priority',
    advancedAnalytics: true,
    apiAccess: true,
  },
  premium: {
    maxClients: PlanLimits.UNLIMITED,
    transcriptionHours: PlanLimits.UNLIMITED,
    reportsPerMonth: PlanLimits.UNLIMITED,
    supportLevel: 'phone',
    advancedAnalytics: true,
    apiAccess: true,
    customBranding: true,
    ssoIntegration: true,
    prioritySupport: true,
  },
};