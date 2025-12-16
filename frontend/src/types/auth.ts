export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'PSYCHOLOGIST' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  subscription?: {
    planType: 'BASIC' | 'PRO' | 'PREMIUM';
    status: string;
    currentPeriodEnd?: string;
  };
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
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  encryptionKey?: EncryptionKey;
}