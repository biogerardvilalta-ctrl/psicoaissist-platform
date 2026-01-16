export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  role: 'PSYCHOLOGIST' | 'ADMIN' | 'SUPER_ADMIN' | 'AGENDA_MANAGER' | 'PROFESSIONAL_GROUP';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  subscription?: {
    id: string;
    planType: 'BASIC' | 'PRO' | 'PREMIUM' | 'DEMO';
    status: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
  };
  enableReminders: boolean;
  defaultDuration?: number;
  bufferTime?: number;
  workStartHour?: string;
  workEndHour?: string;
  hourlyRate?: number;
  scheduleConfig?: {
    weekly?: Record<number, { enabled: boolean; start: string; end: string }>;
    holidays?: string[];
    blockedBlocks?: Array<{ date: string; start: string; end: string; reason?: string }>;
  };
  preferredLanguage?: string;
  dashboardLayout?: string[];
  groupMembers?: { id: string; firstName: string; lastName: string }[];
  googleRefreshToken?: string;
  googleImportCalendar?: boolean;
  referralCode?: string;
  referralsCount?: number;
  simulatorUsageCount?: number;
  agendaManagerEnabled?: boolean;
  brandingConfig?: {
    companyName?: string;
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    showLogo?: boolean;
  };
  usage?: {
    clientsCount: number;
  };
  limits?: {
    maxClients: number;
  };
  hasOnboardingPack?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface EncryptionKey {
  id: string;
  key: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  encryptionKey: EncryptionKey | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'PSYCHOLOGIST' | 'ADMIN';
  professionalNumber: string;
  country: string;
  referralCode?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  encryptionKey?: EncryptionKey;
}