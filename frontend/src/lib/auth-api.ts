import { httpClient } from './http-client';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/auth';

export class AuthAPI {
  private static readonly BASE_URL = '/api/v1/auth';

  static async getPublicKey(): Promise<string> {
    try {
      const response = await httpClient.get<{ publicKey: string }>(`${this.BASE_URL}/public-key`);
      return response.publicKey;
    } catch (e) {
      console.error('Failed to get public key, falling back to plaintext', e);
      return '';
    }
  }

  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    let payload: any = credentials;
    try {
      const publicKey = await this.getPublicKey();
      if (publicKey) {
        const { CryptoService } = await import('./crypto');
        const encrypted = await CryptoService.encryptRSA(credentials, publicKey);
        if (encrypted) {
          payload = { encryptedData: encrypted };
        }
      }
    } catch (e) {
      console.error('Login encryption failed, falling back to plaintext', e);
    }

    try {
      const response = await httpClient.post(`${this.BASE_URL}/login`, payload);
      return (response as any).data || response;
    } catch (error) {
      throw error;
    }
  }

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await httpClient.post(`${this.BASE_URL}/register`, userData);
      return (response as any).data || response;
    } catch (error) {
      throw error;
    }
  }

  static async completeGoogleRegistration(data: {
    token: string;
    professionalNumber: string;
    country: string;
    referralCode?: string;
    acceptTerms: boolean;
  }): Promise<AuthResponse> {
    try {
      const response = await httpClient.post(`${this.BASE_URL}/google/complete`, data);
      return (response as any).data || response;
    } catch (error) {
      throw error;
    }
  }

  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await httpClient.post(`${this.BASE_URL}/refresh`, {
        refreshToken
      });
      return (response as any).data || response;
    } catch (error) {
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      await httpClient.post(`${this.BASE_URL}/logout`);
    } catch (error) {
      // Ignore errors on logout
    }
  }

  static async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response = await httpClient.get<AuthResponse>(`${this.BASE_URL}/verify-email?token=${token}`);
      return (response as any).data || response;
    } catch (error) {
      throw error;
    }
  }

  static async getCurrentUser(): Promise<User> {
    try {
      // Add timestamp to prevent browser caching
      const response = await httpClient.get(`${this.BASE_URL}/me?_t=${Date.now()}`);
      return (response as any).data || response;
    } catch (error) {
      throw error;
    }
  }

  static async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await httpClient.patch(`${this.BASE_URL}/change-password`, {
        oldPassword,
        newPassword
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await httpClient.patch(`${this.BASE_URL}/me`, data);
      return (response as any).data || response;
    } catch (error) {
      throw error;
    }
  }
  static async uploadLogo(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    // Bypass httpClient to handle FormData correctly via fetch
    const token = typeof window !== 'undefined' ? localStorage.getItem('psychoai_access_token') : null;

    // Determine base URL, handling if it already includes /api/v1 or not
    let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

    // Remove trailing slash
    baseUrl = baseUrl.replace(/\/$/, '');

    // Ensure we don't duplicate /api/v1 if it's already in the base URL
    const apiEndpoint = baseUrl.endsWith('/api/v1')
      ? `${baseUrl}/users/upload-logo`
      : `${baseUrl}/api/v1/users/upload-logo`;

    try {
      console.log('Uploading logo to:', apiEndpoint);
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }


  static async deleteAccount(): Promise<void> {
    try {
      await httpClient.delete(`${this.BASE_URL.replace('/auth', '/users')}/me`);
    } catch (error) {
      throw error;
    }
  }

  static async exportData(): Promise<any> {
    try {
      // Returns JSON
      return await httpClient.get(`${this.BASE_URL.replace('/auth', '/users')}/me/export`);
    } catch (error) {
      throw error;
    }
  }

  static async exportDataCsv(): Promise<Blob> {
    try {
      // Returns Blob (CSV)
      return await httpClient.get(`${this.BASE_URL.replace('/auth', '/users')}/me/export/csv`, {
        responseType: 'blob'
      } as any);
    } catch (error) {
      throw error;
    }
  }
}