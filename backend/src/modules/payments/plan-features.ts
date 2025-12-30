export enum PlanLimits {
  BASIC_MAX_CLIENTS = 25,
  BASIC_TRANSCRIPTION_HOURS = 10,
  BASIC_REPORTS = 100,
  BASIC_SIMULATOR_CASES = 0,
  BASIC_SIMULATOR_MINUTES = 0,

  PRO_MAX_CLIENTS = -1,
  PRO_TRANSCRIPTION_HOURS = 15,
  PRO_REPORTS = -1,
  PRO_SIMULATOR_CASES = 5,
  PRO_SIMULATOR_MINUTES = 900,

  BUSINESS_MAX_CLIENTS = -1,
  BUSINESS_TRANSCRIPTION_HOURS = 350,
  BUSINESS_REPORTS = -1,
  BUSINESS_SIMULATOR_CASES = 15,
  BUSINESS_SIMULATOR_MINUTES = 2000,
  BUSINESS_MAX_PROFESSIONALS = 3,

  PREMIUM_PLUS_MAX_CLIENTS = -1,
  PREMIUM_PLUS_TRANSCRIPTION_HOURS = -1,
  PREMIUM_PLUS_REPORTS = -1,
  PREMIUM_PLUS_SIMULATOR_CASES = -1,
  PREMIUM_PLUS_SIMULATOR_MINUTES = 3000,

  // -1 significa ilimitado
  UNLIMITED = -1,

  // Fair Use Limits (Safety Caps for Unlimited Plans)
  FAIR_USE_TRANSCRIPTION_HOURS = 300,
  FAIR_USE_CLIENTS = 5000,
  FAIR_USE_REPORTS = 3000,
  FAIR_USE_SIMULATOR_CASES = 500,
}

export interface PlanFeatures {
  maxClients: number;
  transcriptionHours: number;
  reportsPerMonth: number;
  simulatorCases: number;
  simulatorMinutes: number;
  maxProfessionals?: number;
  supportLevel: 'email' | 'priority' | 'phone';
  advancedAnalytics?: boolean;
  apiAccess?: boolean;
  customBranding?: boolean;
  ssoIntegration?: boolean;
  prioritySupport?: boolean;
  isTeam?: boolean;
}

export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  basic: {
    maxClients: PlanLimits.BASIC_MAX_CLIENTS,
    transcriptionHours: PlanLimits.BASIC_TRANSCRIPTION_HOURS,
    reportsPerMonth: PlanLimits.BASIC_REPORTS,
    simulatorCases: PlanLimits.BASIC_SIMULATOR_CASES,
    simulatorMinutes: PlanLimits.BASIC_SIMULATOR_MINUTES,
    supportLevel: 'email',
  },
  pro: {
    maxClients: PlanLimits.UNLIMITED,
    transcriptionHours: PlanLimits.PRO_TRANSCRIPTION_HOURS,
    reportsPerMonth: PlanLimits.UNLIMITED,
    simulatorCases: PlanLimits.PRO_SIMULATOR_CASES,
    simulatorMinutes: PlanLimits.PRO_SIMULATOR_MINUTES,
    supportLevel: 'priority',
    advancedAnalytics: true,
    apiAccess: true,
  },
  business: {
    maxClients: PlanLimits.UNLIMITED,
    transcriptionHours: PlanLimits.BUSINESS_TRANSCRIPTION_HOURS,
    reportsPerMonth: PlanLimits.UNLIMITED,
    simulatorCases: PlanLimits.BUSINESS_SIMULATOR_CASES,
    simulatorMinutes: PlanLimits.BUSINESS_SIMULATOR_MINUTES,
    maxProfessionals: PlanLimits.BUSINESS_MAX_PROFESSIONALS,
    supportLevel: 'priority',
    advancedAnalytics: true,
    apiAccess: false,
    isTeam: true,
  },
  premium_plus: {
    maxClients: PlanLimits.UNLIMITED,
    transcriptionHours: PlanLimits.UNLIMITED,
    reportsPerMonth: PlanLimits.UNLIMITED,
    simulatorCases: PlanLimits.UNLIMITED,
    simulatorMinutes: PlanLimits.PREMIUM_PLUS_SIMULATOR_MINUTES,
    supportLevel: 'priority',
    advancedAnalytics: true,
    apiAccess: true,
    customBranding: true,
    ssoIntegration: true,
    prioritySupport: true,
  },
  premium: {
    maxClients: PlanLimits.UNLIMITED,
    transcriptionHours: PlanLimits.UNLIMITED,
    reportsPerMonth: PlanLimits.UNLIMITED,
    simulatorCases: PlanLimits.UNLIMITED,
    simulatorMinutes: PlanLimits.PREMIUM_PLUS_SIMULATOR_MINUTES,
    supportLevel: 'priority',
    advancedAnalytics: true,
    apiAccess: true,
    customBranding: true,
    ssoIntegration: true,
    prioritySupport: true,
  },
};