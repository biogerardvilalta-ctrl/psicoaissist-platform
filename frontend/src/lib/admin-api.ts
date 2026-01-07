import { httpClient } from './http-client';

export interface AdminUser {
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
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    sessions: number;
    reports: number;
  };
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number; // Added missing property
  activeSubscriptions: number;
  totalRevenue: number;
  recentSignups: number;
  totalSessions: number;
  totalReports: number;
  subscriptionStats: Record<string, Record<string, number>>;
}

export interface AuditLog {
  id: string;
  action: string;
  resourceType: string;
  userId?: string;
  user?: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
  isSuccess: boolean;
  errorMessage?: string;
  createdAt: string;
  metadata?: any;
}

export interface PaginatedLogs {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
}

export interface UserFilters {
  search?: string;
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  role?: 'ALL' | 'PSYCHOLOGIST' | 'ADMIN';
  page?: number;
  limit?: number;
}

export interface PaginatedUsers {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class AdminAPI {
  private static readonly BASE_URL = '/api/v1/admin';

  // Dashboard Stats
  static async getDashboardStats(): Promise<AdminStats> {
    try {
      console.log('📊 Fetching admin dashboard stats...');
      const response = await httpClient.get(`${this.BASE_URL}/dashboard`);
      console.log('✅ Dashboard stats loaded:', (response as any).data);
      return (response as any).data;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Logs
  static async getLogs(page = 1, limit = 20, errorOnly = false, userId?: string): Promise<PaginatedLogs> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (errorOnly) params.append('errorOnly', 'true');
      if (userId) params.append('userId', userId);

      const queryString = params.toString();
      const url = `${this.BASE_URL}/logs${queryString ? `?${queryString}` : ''}`;

      const response = await httpClient.get(url);
      return (response as any).data;
    } catch (error) {
      console.error('❌ Error fetching logs:', error);
      throw error;
    }
  }

  // Plans
  static async getPlans(): Promise<{ plans: AdminPlan[] }> {
    try {
      const response = await httpClient.get(`${this.BASE_URL}/plans`);
      return (response as any).data;
    } catch (error) {
      console.error('❌ Error fetching plans:', error);
      throw error; // Or return fallback
    }
  }

  // User Management
  static async getUsers(filters?: UserFilters): Promise<PaginatedUsers> {
    console.log('👥 Fetching users with filters:', filters);

    try {
      const params = new URLSearchParams();

      if (filters?.search) params.append('search', filters.search);
      if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters?.role && filters.role !== 'ALL') params.append('role', filters.role);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const url = `${this.BASE_URL}/users${queryString ? `?${queryString}` : ''}`;

      console.log('🌐 Making request to:', url);
      const response = await httpClient.get(url);

      return (response as any).data;
    } catch (error) {
      console.error('❌ Error fetching users from API:', error);
      throw error;
    }
  }

  static async getUser(id: string): Promise<AdminUser> {
    try {
      console.log('👤 Fetching user by ID:', id);
      const response = await httpClient.get(`${this.BASE_URL}/users/${id}`);
      return (response as any).data;
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      throw new Error('Error al cargar el usuario');
    }
  }

  static async updateUser(id: string, userData: Partial<AdminUser>): Promise<AdminUser> {
    try {
      console.log('📝 Updating user:', id, userData);
      const response = await httpClient.patch(`${this.BASE_URL}/users/${id}`, userData);
      return (response as any).data;
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw new Error('Error al actualizar el usuario');
    }
  }

  static async deleteUser(id: string): Promise<void> {
    try {
      console.log('🗑️ Deleting user:', id);
      await httpClient.delete(`${this.BASE_URL}/users/${id}`);
      console.log('✅ User deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw new Error('Error al eliminar el usuario');
    }
  }
}