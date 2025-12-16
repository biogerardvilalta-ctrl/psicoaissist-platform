'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { AuthAPI } from '@/lib/auth-api';
import type { AuthState, AuthTokens, User, LoginRequest, RegisterRequest, EncryptionKey } from '@/types/auth';

// Auth Actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; tokens: AuthTokens; encryptionKey?: EncryptionKey } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; tokens: AuthTokens; encryptionKey?: EncryptionKey } }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: { user: User; tokens: AuthTokens; encryptionKey?: EncryptionKey } }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESTORE_SESSION'; payload: { user: User; tokens: AuthTokens; encryptionKey?: EncryptionKey } };

// Auth Context Interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
}

// Initial State
const initialState: AuthState = {
  user: null,
  tokens: null,
  encryptionKey: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check for existing session
  error: null,
};

// Auth Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
    case 'REFRESH_TOKEN_SUCCESS':
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        encryptionKey: action.payload.encryptionKey || state.encryptionKey || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        encryptionKey: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Storage Keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'psycoai_access_token',
  REFRESH_TOKEN: 'psycoai_refresh_token',
  USER: 'psycoai_user',
  ENCRYPTION_KEY: 'psycoai_encryption_key',
} as const;

// Storage Utilities
const storage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Save tokens and user to localStorage
  const saveSession = useCallback((user: User, tokens: AuthTokens, encryptionKey?: EncryptionKey) => {
    storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    if (encryptionKey) {
      storage.setItem(STORAGE_KEYS.ENCRYPTION_KEY, JSON.stringify(encryptionKey));
    }
  }, []);

  // Clear session from localStorage
  const clearSession = useCallback(() => {
    storage.clear();
  }, []);

  // Restore session from localStorage
  const restoreSession = useCallback(() => {
    try {
      const accessToken = storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const userStr = storage.getItem(STORAGE_KEYS.USER);
      const encryptionKeyStr = storage.getItem(STORAGE_KEYS.ENCRYPTION_KEY);

      console.log('🔄 Checking localStorage for session...');
      console.log('- Access Token:', accessToken ? 'Found' : 'Not found');
      console.log('- Refresh Token:', refreshToken ? 'Found' : 'Not found');
      console.log('- User Data:', userStr ? 'Found' : 'Not found');

      if (accessToken && refreshToken && userStr) {
        const user = JSON.parse(userStr);
        const tokens = { accessToken, refreshToken };
        let encryptionKey: EncryptionKey | undefined;

        if (encryptionKeyStr) {
          try {
            encryptionKey = JSON.parse(encryptionKeyStr);
          } catch (e) {
            console.error('Error parsing encryption key', e);
          }
        }

        console.log('🔄 Restoring session for user:', user.email);
        dispatch({ type: 'RESTORE_SESSION', payload: { user, tokens, encryptionKey } });
        return true;
      } else {
        console.log('❌ No valid session found in localStorage');
      }
    } catch (error) {
      console.error('Error restoring session:', error);
      clearSession();
    }

    dispatch({ type: 'SET_LOADING', payload: false });
    return false;
  }, [clearSession]);

  // Login function
  const login = useCallback(async (credentials: LoginRequest) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      console.log('🔐 Login attempt:', credentials.email);

      const response = await AuthAPI.login(credentials);

      const { user, tokens, encryptionKey } = response;

      if (!user || !tokens) {
        throw new Error('Respuesta de login inválida');
      }

      saveSession(user, tokens, encryptionKey);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, tokens, encryptionKey } });

      console.log('✅ Login successful for:', user.email);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error en el login';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      clearSession();
      throw error;
    }
  }, [saveSession, clearSession]);

  // Register function
  const register = useCallback(async (userData: RegisterRequest) => {
    dispatch({ type: 'REGISTER_START' });

    try {
      console.log('📝 Register attempt:', userData.email);

      const response = await AuthAPI.register(userData);
      const { user, tokens, encryptionKey } = response;

      saveSession(user, tokens, encryptionKey);
      dispatch({ type: 'REGISTER_SUCCESS', payload: { user, tokens, encryptionKey } });

      console.log('✅ Register successful for:', user.email);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error en el registro';
      dispatch({ type: 'REGISTER_FAILURE', payload: message });
      clearSession();
      throw error;
    }
  }, [saveSession, clearSession]);

  // Logout function
  const logout = useCallback(() => {
    console.log('👋 Logging out user');
    clearSession();
    dispatch({ type: 'LOGOUT' });
  }, [clearSession]);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const currentRefreshToken = storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('🔄 Refreshing token...');

      const response = await AuthAPI.refreshToken(currentRefreshToken);
      const { user, tokens, encryptionKey } = response;

      saveSession(user, tokens, encryptionKey);
      dispatch({ type: 'REFRESH_TOKEN_SUCCESS', payload: { user, tokens, encryptionKey } });

    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout();
    }
  }, [state.user, state.tokens, saveSession, logout]);

  // Update user function
  const updateUser = useCallback((user: User) => {
    storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Restore session on mount
  useEffect(() => {
    console.log('🔄 AuthProvider: Checking for existing session...');
    restoreSession();

    // Listen for unauthorized events (401)
    const handleUnauthorized = () => {
      console.log('⛔ Unauthorized event received, logging out...');
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [restoreSession, logout]);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    clearError,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// useAuth hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}