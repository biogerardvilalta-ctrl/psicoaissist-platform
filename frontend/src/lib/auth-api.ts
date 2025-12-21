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
        payload = { encryptedData: encrypted };
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

  static async getCurrentUser(): Promise<User> {
    try {
      const response = await httpClient.get(`${this.BASE_URL}/me`);
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
}