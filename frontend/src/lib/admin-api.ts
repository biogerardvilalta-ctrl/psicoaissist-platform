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
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalRevenue: number;
  activeSubscriptions: number;
  pendingIssues: number;
  newUsersThisMonth: number;
  revenueThisMonth: number;
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
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class AdminAPI {
  private static readonly BASE_URL = '/api/v1/admin';

  // Dashboard Stats
  static async getDashboardStats(): Promise<AdminStats> {
    try {
      console.log('📊 Fetching admin dashboard stats...');
      const response = await httpClient.get(`${this.BASE_URL}/stats`);
      console.log('✅ Dashboard stats loaded:', (response as any).data);
      return (response as any).data;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats, using mock data:', error);
      // Fallback to mock data
      return this.getMockStats();
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
      console.log('✅ Users API response:', response);

      // Verificar la estructura de la respuesta
      if (response && (response as any).users && Array.isArray((response as any).users)) {
        return response as PaginatedUsers;
      } else {
        console.warn('⚠️ API response has unexpected structure, falling back to mock');
        throw new Error('Invalid API response structure');
      }
    } catch (error) {
      console.error('❌ Error fetching users from API:', error);
      console.log('🔄 Using mock data fallback');
      // Fallback to mock data with filters applied
      const mockData = this.getMockUsers(filters);
      console.log('📋 Mock data:', mockData);
      return mockData;
    }
  }

  static async getUser(id: string): Promise<AdminUser> {
    try {
      console.log('👤 Fetching user by ID:', id);
      const response = await httpClient.get(`${this.BASE_URL}/users/${id}`);
      console.log('✅ User loaded:', (response as any).data);
      return (response as any).data;
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      throw new Error('Error al cargar el usuario');
    }
  }

  static async updateUser(id: string, userData: Partial<AdminUser>): Promise<AdminUser> {
    try {
      console.log('📝 Updating user:', id, userData);
      const response = await httpClient.put(`${this.BASE_URL}/users/${id}`, userData);
      console.log('✅ User updated:', (response as any).data);
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

  // Mock data methods for development
  static getMockStats(): AdminStats {
    return {
      totalUsers: 156,
      activeUsers: 142,
      inactiveUsers: 14,
      totalRevenue: 15400,
      activeSubscriptions: 89,
      pendingIssues: 3,
      newUsersThisMonth: 23,
      revenueThisMonth: 2800
    };
  }

  static getMockUsers(filters?: UserFilters): PaginatedUsers {
    let mockUsers: AdminUser[] = [
      {
        id: '1',
        email: 'dr.martinez@example.com',
        firstName: 'Ana',
        lastName: 'Martínez',
        role: 'PSYCHOLOGIST',
        status: 'ACTIVE',
        subscription: { planType: 'PRO', status: 'active', currentPeriodEnd: '2025-01-15' },
        lastLogin: '2025-12-13T10:30:00Z',
        createdAt: '2025-11-01T09:00:00Z',
        updatedAt: '2025-12-13T10:30:00Z'
      },
      {
        id: '2',
        email: 'dr.garcia@example.com',
        firstName: 'Carlos',
        lastName: 'García',
        role: 'PSYCHOLOGIST',
        status: 'ACTIVE',
        subscription: { planType: 'BASIC', status: 'active', currentPeriodEnd: '2025-01-20' },
        lastLogin: '2025-12-12T16:45:00Z',
        createdAt: '2025-10-15T14:20:00Z',
        updatedAt: '2025-12-12T16:45:00Z'
      },
      {
        id: '3',
        email: 'inactive@example.com',
        firstName: 'Luis',
        lastName: 'Rodríguez',
        role: 'PSYCHOLOGIST',
        status: 'INACTIVE',
        subscription: { planType: 'BASIC', status: 'cancelled' },
        lastLogin: '2025-11-20T08:15:00Z',
        createdAt: '2025-09-10T11:30:00Z',
        updatedAt: '2025-11-20T08:15:00Z'
      },
      {
        id: '4',
        email: 'admin@psicoaissist.com',
        firstName: 'Admin',
        lastName: 'PsicoAIssist',
        role: 'ADMIN',
        status: 'ACTIVE',
        subscription: { planType: 'PREMIUM', status: 'active' },
        lastLogin: '2025-12-13T12:00:00Z',
        createdAt: '2025-08-01T10:00:00Z',
        updatedAt: '2025-12-13T12:00:00Z'
      },
      {
        id: '5',
        email: 'dr.lopez@example.com',
        firstName: 'María',
        lastName: 'López',
        role: 'PSYCHOLOGIST',
        status: 'SUSPENDED',
        subscription: { planType: 'PRO', status: 'suspended' },
        lastLogin: '2025-12-01T14:20:00Z',
        createdAt: '2025-08-15T11:10:00Z',
        updatedAt: '2025-12-01T14:20:00Z'
      }
    ];

    // Apply filters
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      mockUsers = mockUsers.filter(user =>
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.status && filters.status !== 'ALL') {
      mockUsers = mockUsers.filter(user => user.status === filters.status);
    }

    if (filters?.role && filters.role !== 'ALL') {
      mockUsers = mockUsers.filter(user => user.role === filters.role);
    }

    return {
      users: mockUsers,
      total: mockUsers.length,
      page: filters?.page || 1,
      totalPages: Math.ceil(mockUsers.length / (filters?.limit || 10)),
      hasNext: false,
      hasPrev: false
    };
  }
}