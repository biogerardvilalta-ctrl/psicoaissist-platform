'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode, useRef } from 'react';
import { AuthAPI } from '@/lib/auth-api';
import type { AuthState, AuthTokens, User, LoginRequest, RegisterRequest, EncryptionKey } from '@/types/auth';

// Auth Actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; tokens: AuthTokens; encryptionKey?: EncryptionKey } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; tokens?: AuthTokens; encryptionKey?: EncryptionKey } }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: { user: User; tokens: AuthTokens; encryptionKey?: EncryptionKey } }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESTORE_SESSION'; payload: { user: User; tokens: AuthTokens; encryptionKey?: EncryptionKey } };

// Auth Context Interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest, remember?: boolean) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
  reloadUser: () => Promise<void>;
  loginWithTokens: (user: User, tokens: AuthTokens, encryptionKey?: EncryptionKey) => Promise<void>;
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
        tokens: action.payload.tokens || null,
        encryptionKey: action.payload.encryptionKey || state.encryptionKey || null,
        isAuthenticated: !!action.payload.tokens,
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
  ACCESS_TOKEN: 'psychoai_access_token',
  REFRESH_TOKEN: 'psychoai_refresh_token',
  USER: 'psychoai_user',
  ENCRYPTION_KEY: 'psychoai_encryption_key',
} as const;

// Storage Utilities
const storage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      // Check localStorage first
      const local = localStorage.getItem(key);
      if (local) return local;
      // Then check sessionStorage
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem: (key: string, value: string, remember: boolean = true): void => {
    if (typeof window === 'undefined') return;
    try {
      if (remember) {
        localStorage.setItem(key, value);
        sessionStorage.removeItem(key); // Ensure it's not in session
      } else {
        sessionStorage.setItem(key, value);
        localStorage.removeItem(key); // Ensure it's not in local
      }
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
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

  // Save tokens and user to storage
  const saveSession = useCallback((user: User, tokens: AuthTokens, encryptionKey?: EncryptionKey, remember: boolean = true) => {
    storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken, remember);
    storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken, remember);
    storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user), remember);
    if (encryptionKey) {
      storage.setItem(STORAGE_KEYS.ENCRYPTION_KEY, JSON.stringify(encryptionKey), remember);
    }
  }, []);

  // Clear session from storage
  const clearSession = useCallback(() => {
    storage.clear();
  }, []);

  // Restore session from storage
  const restoreSession = useCallback(async () => {
    try {
      console.log('🔄 AuthProvider: Checking for existing session...');

      // Attempt to verify session with backend (Cookie or Token based)
      try {
        const user = await AuthAPI.getCurrentUser();
        console.log('✅ Session verified via Backend for:', user.email);

        // Retrieve stored artifacts if available
        const accessToken = storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const refreshToken = storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const encryptionKeyStr = storage.getItem(STORAGE_KEYS.ENCRYPTION_KEY);

        // Use stored tokens or fallback to cookie-session markers
        // This ensures the app considers the user "logged in" even if only cookies are present
        const tokens: AuthTokens = {
          accessToken: accessToken || 'cookie-session',
          refreshToken: refreshToken || 'cookie-session'
        };

        let encryptionKey: EncryptionKey | undefined;
        if (encryptionKeyStr) {
          try {
            encryptionKey = JSON.parse(encryptionKeyStr);
          } catch (e) {
            console.error('Error parsing encryption key', e);
          }
        }

        dispatch({ type: 'RESTORE_SESSION', payload: { user, tokens, encryptionKey } });
        return true;

      } catch (verifyError) {
        console.warn('ℹ️ Backend session check failed. Attempting to restore from LocalStorage fallback...', verifyError);

        // Fallback: Try to restore from LocalStorage even if backend check failed (resilience)
        const accessToken = storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const refreshToken = storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const userStr = storage.getItem(STORAGE_KEYS.USER);
        const encryptionKeyStr = storage.getItem(STORAGE_KEYS.ENCRYPTION_KEY);

        if (accessToken && userStr) {
          console.log('⚠️ Restoring offline/fallback session from storage.');
          const user = JSON.parse(userStr);
          const tokens: AuthTokens = { accessToken, refreshToken: refreshToken || '' };

          let encryptionKey: EncryptionKey | undefined;
          if (encryptionKeyStr) {
            try { encryptionKey = JSON.parse(encryptionKeyStr); } catch (e) { }
          }

          dispatch({ type: 'RESTORE_SESSION', payload: { user, tokens, encryptionKey } });
          return true;
        } else {
          // Only clear if we really have nothing
          clearSession();
        }
      }

    } catch (error) {
      console.error('Error restoring session:', error);
      clearSession();
    }

    dispatch({ type: 'SET_LOADING', payload: false });
    return false;
  }, [clearSession]);

  // Login function
  const login = useCallback(async (credentials: LoginRequest, remember: boolean = false) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      console.log('🔐 Login attempt:', credentials.email);

      const response = await AuthAPI.login(credentials);

      const { user, tokens, encryptionKey } = response;

      if (!user || !tokens) {
        throw new Error('Respuesta de login inválida');
      }

      saveSession(user, tokens, encryptionKey, remember);
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
  const register = useCallback(async (userData: RegisterRequest): Promise<boolean> => {
    dispatch({ type: 'REGISTER_START' });

    try {
      console.log('📝 Register attempt:', userData.email);

      const response = await AuthAPI.register(userData);
      const { user, tokens, encryptionKey, verificationRequired } = response;

      if (verificationRequired || !tokens) {
        // Verification required flow
        console.log('ℹ️ Verification required for:', user.email);
        dispatch({ type: 'REGISTER_SUCCESS', payload: { user } });
        return false; // Not logged in
      }

      // Default to true (persistent) for registration
      saveSession(user, tokens, encryptionKey, true);
      dispatch({ type: 'REGISTER_SUCCESS', payload: { user, tokens, encryptionKey } });

      console.log('✅ Register successful for:', user.email);
      return true; // Logged in

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error en el registro';
      dispatch({ type: 'REGISTER_FAILURE', payload: message });
      clearSession();
      throw error;
    }
  }, [saveSession, clearSession]);

  // Login with existing tokens (e.g. after email verification)
  const loginWithTokens = useCallback(async (user: User, tokens: AuthTokens, encryptionKey?: EncryptionKey) => {
    saveSession(user, tokens, encryptionKey, true);
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, tokens, encryptionKey } });
  }, [saveSession]);

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

      if (!tokens) {
        throw new Error('No se recibieron tokens al refrescar sesión');
      }

      saveSession(user, tokens, encryptionKey);
      dispatch({ type: 'REFRESH_TOKEN_SUCCESS', payload: { user, tokens, encryptionKey } });

    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout();
    }
  }, [saveSession, logout]);

  // Update user function
  const updateUser = useCallback((user: User) => {
    storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  // Reload user function
  const reloadUser = useCallback(async () => {
    try {
      const user = await AuthAPI.getCurrentUser();
      if (user) {
        // Update storage and state
        storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        dispatch({ type: 'SET_USER', payload: user });
      }
    } catch (error) {
      console.error('Failed to reload user:', error);
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const initialized = useRef(false);

  // Restore session on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      console.log('🔄 AuthProvider: Checking for existing session...');
      restoreSession();
    }

    // Listen for unauthorized events (401)
    const handleUnauthorized = () => {
      console.log('⛔ Unauthorized event received, logging out...');
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = React.useMemo<AuthContextType>(() => ({
    ...state,
    login,
    register,
    logout,
    refreshToken,
    clearError,
    updateUser,
    reloadUser,
    loginWithTokens
  }), [state, login, register, logout, refreshToken, clearError, updateUser, reloadUser, loginWithTokens]);

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