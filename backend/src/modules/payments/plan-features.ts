export enum PlanLimits {
  BASIC_MAX_CLIENTS = 25,
  BASIC_TRANSCRIPTION_MINUTES = 600, // 10 hours
  BASIC_REPORTS = 100,
  BASIC_SIMULATOR_CASES = 0,
  BASIC_SIMULATOR_MINUTES = 0,

  FREE_MAX_CLIENTS = 3,
  FREE_TRANSCRIPTION_MINUTES = 30, // 30 mins demo
  FREE_REPORTS = 5,
  FREE_SIMULATOR_CASES = 0,
  FREE_SIMULATOR_MINUTES = 0,

  PRO_MAX_CLIENTS = -1,
  PRO_TRANSCRIPTION_MINUTES = 900, // 15 hours
  PRO_REPORTS = -1,
  PRO_SIMULATOR_CASES = 5,
  PRO_SIMULATOR_MINUTES = 900,



  PREMIUM_MAX_CLIENTS = -1,
  PREMIUM_TRANSCRIPTION_MINUTES = 3000, // 50 hours
  PREMIUM_REPORTS = -1,
  PREMIUM_SIMULATOR_CASES = -1,
  PREMIUM_SIMULATOR_MINUTES = 3000,

  CLINICS_MAX_CLIENTS = -1,
  CLINICS_TRANSCRIPTION_MINUTES = 30000, // 500 hours
  CLINICS_REPORTS = -1,
  CLINICS_SIMULATOR_CASES = -1,
  CLINICS_SIMULATOR_MINUTES = 5000,

  // -1 significa ilimitado
  UNLIMITED = -1,

  // Fair Use Limits (Safety Caps for Unlimited Plans)
  FAIR_USE_TRANSCRIPTION_MINUTES = 18000, // 300 hours
  FAIR_USE_CLIENTS = 5000,
  FAIR_USE_REPORTS = 3000,
  FAIR_USE_SIMULATOR_CASES = 500,
}

export interface PlanFeatures {
  maxClients: number;
  transcriptionMinutes: number;
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
  demo: {
    maxClients: PlanLimits.FREE_MAX_CLIENTS,
    transcriptionMinutes: PlanLimits.FREE_TRANSCRIPTION_MINUTES,
    reportsPerMonth: PlanLimits.FREE_REPORTS,
    simulatorCases: PlanLimits.FREE_SIMULATOR_CASES,
    simulatorMinutes: PlanLimits.FREE_SIMULATOR_MINUTES,
    supportLevel: 'email',
  },
  basic: {
    maxClients: PlanLimits.BASIC_MAX_CLIENTS,
    transcriptionMinutes: PlanLimits.BASIC_TRANSCRIPTION_MINUTES,
    reportsPerMonth: PlanLimits.BASIC_REPORTS,
    simulatorCases: PlanLimits.BASIC_SIMULATOR_CASES,
    simulatorMinutes: PlanLimits.BASIC_SIMULATOR_MINUTES,
    supportLevel: 'email',
  },
  pro: {
    maxClients: PlanLimits.UNLIMITED,
    transcriptionMinutes: PlanLimits.PRO_TRANSCRIPTION_MINUTES,
    reportsPerMonth: PlanLimits.UNLIMITED,
    simulatorCases: PlanLimits.PRO_SIMULATOR_CASES,
    simulatorMinutes: PlanLimits.PRO_SIMULATOR_MINUTES,
    supportLevel: 'priority',
    advancedAnalytics: true,
    apiAccess: true,
  },

  premium: {
    maxClients: PlanLimits.UNLIMITED,
    transcriptionMinutes: PlanLimits.PREMIUM_TRANSCRIPTION_MINUTES,
    reportsPerMonth: PlanLimits.UNLIMITED,
    simulatorCases: PlanLimits.UNLIMITED,
    simulatorMinutes: PlanLimits.PREMIUM_SIMULATOR_MINUTES,
    supportLevel: 'priority',
    advancedAnalytics: true,
    apiAccess: true,
    customBranding: true,
    ssoIntegration: true,
    prioritySupport: true,
  },
  premium_plus: {
    maxClients: PlanLimits.UNLIMITED,
    transcriptionMinutes: PlanLimits.PREMIUM_TRANSCRIPTION_MINUTES,
    reportsPerMonth: PlanLimits.UNLIMITED,
    simulatorCases: PlanLimits.UNLIMITED,
    simulatorMinutes: PlanLimits.PREMIUM_SIMULATOR_MINUTES,
    supportLevel: 'priority',
    advancedAnalytics: true,
    apiAccess: true,
    customBranding: true,
    ssoIntegration: true,
    prioritySupport: true,
  },
  business: {
    maxClients: PlanLimits.UNLIMITED,
    transcriptionMinutes: PlanLimits.CLINICS_TRANSCRIPTION_MINUTES,
    reportsPerMonth: PlanLimits.UNLIMITED,
    simulatorCases: PlanLimits.UNLIMITED,
    simulatorMinutes: PlanLimits.CLINICS_SIMULATOR_MINUTES,
    supportLevel: 'priority',
    advancedAnalytics: true,
    apiAccess: true,
    customBranding: true,
    ssoIntegration: true,
    prioritySupport: true,
    isTeam: true,
  },
  clinics: {
    maxClients: PlanLimits.UNLIMITED,
    transcriptionMinutes: PlanLimits.CLINICS_TRANSCRIPTION_MINUTES,
    reportsPerMonth: PlanLimits.UNLIMITED,
    simulatorCases: PlanLimits.UNLIMITED,
    simulatorMinutes: PlanLimits.CLINICS_SIMULATOR_MINUTES,
    supportLevel: 'phone',
    advancedAnalytics: true,
    apiAccess: true,
    customBranding: true,
    ssoIntegration: true,
    prioritySupport: true,
  },
};

export const EXTRA_PACKS = {
  MINUTES_PACK: {
    id: 'minutes_pack',
    minutes: 500,
    price: 1500, // in cents? Frontend says 15 eur.
    name: 'Pack 500 Minutos'
  },
  AGENDA_MANAGER_PACK: {
    id: 'agenda_manager_pack',
    price: 1500, // 15 EUR
    name: 'Pack Agenda Manager'
  }
};