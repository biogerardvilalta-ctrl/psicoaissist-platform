export enum PlanLimits {
  BASIC_MAX_CLIENTS = 25,
  BASIC_TRANSCRIPTION_HOURS = 50,
  BASIC_REPORTS = 100,
  BASIC_SIMULATOR_CASES = 0,
  BASIC_SIMULATOR_MINUTES = 0,

  PRO_MAX_CLIENTS = -1,
  PRO_TRANSCRIPTION_HOURS = 15,
  PRO_REPORTS = -1,
  PRO_SIMULATOR_CASES = 5,
  PRO_SIMULATOR_MINUTES = 900,

  TEAM_MAX_CLIENTS = -1,
  TEAM_TRANSCRIPTION_HOURS = 350,
  TEAM_REPORTS = -1,
  TEAM_SIMULATOR_CASES = 15,
  TEAM_SIMULATOR_MINUTES = 450,
  TEAM_MAX_PROFESSIONALS = 3,

  PREMIUM_MAX_CLIENTS = -1,
  PREMIUM_TRANSCRIPTION_HOURS = -1,
  PREMIUM_REPORTS = -1,
  PREMIUM_SIMULATOR_CASES = -1,
  PREMIUM_SIMULATOR_MINUTES = -1,

  // -1 significa ilimitado
  UNLIMITED = -1,
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
  team: {
    maxClients: PlanLimits.UNLIMITED,
    transcriptionHours: PlanLimits.TEAM_TRANSCRIPTION_HOURS,
    reportsPerMonth: PlanLimits.UNLIMITED,
    simulatorCases: PlanLimits.TEAM_SIMULATOR_CASES,
    simulatorMinutes: PlanLimits.TEAM_SIMULATOR_MINUTES,
    maxProfessionals: PlanLimits.TEAM_MAX_PROFESSIONALS,
    supportLevel: 'priority',
    advancedAnalytics: true,
    apiAccess: false,
    isTeam: true,
  },
  premium: {
    maxClients: PlanLimits.UNLIMITED,
    transcriptionHours: PlanLimits.UNLIMITED,
    reportsPerMonth: PlanLimits.UNLIMITED,
    simulatorCases: PlanLimits.UNLIMITED,
    simulatorMinutes: PlanLimits.UNLIMITED,
    supportLevel: 'phone',
    advancedAnalytics: true,
    apiAccess: true,
    customBranding: true,
    ssoIntegration: true,
    prioritySupport: true,
  },
};