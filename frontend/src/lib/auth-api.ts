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
    console.log('🔐 AuthAPI.login llamado con:', { email: credentials.email });

    let payload: any = credentials;
    try {
      const publicKey = await this.getPublicKey();
      if (publicKey) {
        const { CryptoService } = await import('./crypto');
        const encrypted = await CryptoService.encryptRSA(credentials, publicKey);
        payload = { encryptedData: encrypted };
        console.log('🔐 Credentials encrypted successfully');
      }
    } catch (e) {
      console.error('Login encryption failed, falling back to plaintext', e);
    }

    try {
      const response = await httpClient.post(`${this.BASE_URL}/login`, payload);
      console.log('✅ Login response:', response);
      return (response as any).data || response;
    } catch (error) {
      console.error('❌ Error en AuthAPI.login:', error);
      throw error;
    }
  }

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    console.log('📝 AuthAPI.register llamado con:', {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName
    });

    try {
      const response = await httpClient.post(`${this.BASE_URL}/register`, userData);
      console.log('✅ Register response:', response);
      return (response as any).data || response;
    } catch (error) {
      console.error('❌ Error en AuthAPI.register:', error);
      throw error;
    }
  }

  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    console.log('🔄 AuthAPI.refreshToken llamado');

    try {
      const response = await httpClient.post(`${this.BASE_URL}/refresh`, {
        refreshToken
      });
      console.log('✅ Refresh token response:', response);
      return (response as any).data || response;
    } catch (error) {
      console.error('❌ Error en AuthAPI.refreshToken:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    console.log('👋 AuthAPI.logout llamado');

    try {
      await httpClient.post(`${this.BASE_URL}/logout`);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Error en AuthAPI.logout:', error);
      // No throw error on logout, just log it
    }
  }

  static async getCurrentUser(): Promise<User> {
    console.log('👤 AuthAPI.getCurrentUser llamado');

    try {
      const response = await httpClient.get(`${this.BASE_URL}/me`);
      console.log('✅ Get current user response:', response);
      return (response as any).data || response;
    } catch (error) {
      console.error('❌ Error en AuthAPI.getCurrentUser:', error);
      throw error;
    }
  }

  static async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    console.log('🔑 AuthAPI.changePassword llamado');

    try {
      await httpClient.patch(`${this.BASE_URL}/change-password`, {
        oldPassword,
        newPassword
      });
      console.log('✅ Change password successful');
    } catch (error) {
      console.error('❌ Error en AuthAPI.changePassword:', error);
      throw error;
    }
  }
}