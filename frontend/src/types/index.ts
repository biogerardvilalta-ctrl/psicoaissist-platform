export interface User {
  id: string
  email: string
  role: UserRole
  plan: UserPlan
  verified: boolean
  createdAt: string
  updatedAt: string
  dashboardLayout?: string[]
}

export enum UserRole {
  PSYCHOLOGIST_BASIC = 'PSYCHOLOGIST_BASIC',
  PSYCHOLOGIST_PRO = 'PSYCHOLOGIST_PRO',
  PSYCHOLOGIST_PREMIUM = 'PSYCHOLOGIST_PREMIUM',
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

export enum UserPlan {
  BASIC = 'BASIC',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM',
  STUDENT = 'STUDENT',
}

export interface Client {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  birthDate?: string
  tags: string[]
  riskLevel: RiskLevel
  isActive: boolean
  createdAt: string
  updatedAt: string
  consents: Consent[]
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface Consent {
  type: ConsentType
  granted: boolean
  grantedAt: string
  revokedAt?: string
  version: string
}

export enum ConsentType {
  AUDIO_RECORDING = 'AUDIO_RECORDING',
  AI_PROCESSING = 'AI_PROCESSING',
  DATA_STORAGE = 'DATA_STORAGE',
  THIRD_PARTY_SHARING = 'THIRD_PARTY_SHARING',
}

export interface Session {
  id: string
  clientId: string
  userId: string
  startTime: string
  endTime?: string
  duration?: number
  transcription?: string
  notes?: string
  aiSuggestions?: AISuggestion[]
  sessionType: SessionType
  status: SessionStatus
  createdAt: string
}

export enum SessionType {
  INDIVIDUAL = 'INDIVIDUAL',
  GROUP = 'GROUP',
  FAMILY = 'FAMILY',
  COUPLE = 'COUPLE',
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface AISuggestion {
  id: string
  type: SuggestionType
  content: string
  confidence: number
  timestamp: string
}

export enum SuggestionType {
  QUESTION = 'QUESTION',
  TECHNIQUE = 'TECHNIQUE',
  OBSERVATION = 'OBSERVATION',
  WARNING = 'WARNING',
}

export interface Report {
  id: string
  clientId: string
  userId: string
  title: string
  content: string
  type: ReportType
  status: ReportStatus
  createdAt: string
  updatedAt: string
}

export enum ReportType {
  INITIAL_EVALUATION = 'INITIAL_EVALUATION',
  PROGRESS = 'PROGRESS',
  DISCHARGE = 'DISCHARGE',
  REFERRAL = 'REFERRAL',
  LEGAL = 'LEGAL',
  CUSTOM = 'CUSTOM',
}

export enum ReportStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export interface DashboardData {
  clientsCount: number
  sessionsThisMonth: number
  reportsCount: number
  upcomingAppointments: number
  aiSuggestions: AISuggestion[]
  recentActivity: Activity[]
}

export interface Activity {
  id: string
  type: ActivityType
  description: string
  createdAt: string
  metadata?: Record<string, any>
}

export enum ActivityType {
  CLIENT_CREATED = 'CLIENT_CREATED',
  CLIENT_UPDATED = 'CLIENT_UPDATED',
  SESSION_COMPLETED = 'SESSION_COMPLETED',
  REPORT_GENERATED = 'REPORT_GENERATED',
  LOGIN = 'LOGIN',
}

// API Response types
export interface AuthResponse {
  user: User
  accessToken: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Form types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  country: string
  userType: 'psychologist' | 'student'
  professionalNumber?: string
  speciality?: string
  plan: UserPlan
  acceptTerms: boolean
  acceptPrivacy: boolean
}

export interface CreateClientData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  birthDate?: string
  initialNotes?: string
  tags?: string[]
  riskLevel?: RiskLevel
  consents: ConsentData[]
}

export interface ConsentData {
  type: ConsentType
  granted: boolean
  notes?: string
}

// Filter types
export interface ClientFilters {
  tags?: string[]
  riskLevel?: RiskLevel
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface Pagination {
  page: number
  limit: number
  skip?: number
  take?: number
}