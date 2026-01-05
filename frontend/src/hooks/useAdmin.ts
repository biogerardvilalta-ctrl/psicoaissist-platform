'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminAPI, AdminUser, AdminStats, UserFilters, PaginatedUsers } from '@/lib/admin-api';

// Demo data para cuando las APIs fallen
const demoStats: AdminStats = {
  totalUsers: 147,
  activeUsers: 132,
  inactiveUsers: 15,
  totalRevenue: 42350,
  activeSubscriptions: 89,
  pendingIssues: 2,
  newUsersThisMonth: 23,
  revenueThisMonth: 6100,
  totalSessions: 1250,
  totalReports: 850,
  subscriptionStats: {
    BASIC: { ACTIVE: 45, CANCELLED: 5 },
    PRO: { ACTIVE: 30, CANCELLED: 2 },
    PREMIUM: { ACTIVE: 14, CANCELLED: 1 }
  }
};

const demoUsers: AdminUser[] = [
  {
    id: '1',
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana.garcia@psychoai.com',
    role: 'PSYCHOLOGIST',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    subscription: {
      planType: 'PRO',
      status: 'ACTIVE'
    }
  },
  {
    id: '2',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    email: 'carlos.mendoza@email.com',
    role: 'PSYCHOLOGIST',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    subscription: {
      planType: 'PREMIUM',
      status: 'ACTIVE'
    }
  },
  {
    id: '3',
    firstName: 'María',
    lastName: 'López',
    email: 'maria.lopez@email.com',
    role: 'PSYCHOLOGIST',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    subscription: {
      planType: 'BASIC',
      status: 'ACTIVE'
    }
  },
  {
    id: '4',
    firstName: 'Jorge',
    lastName: 'Ramírez',
    email: 'jorge.ramirez@email.com',
    role: 'PSYCHOLOGIST',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    firstName: 'Laura',
    lastName: 'Fernández',
    email: 'laura.fernandez@email.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    subscription: {
      planType: 'PREMIUM',
      status: 'ACTIVE'
    }
  },
  {
    id: '6',
    firstName: 'Miguel',
    lastName: 'Sánchez',
    email: 'miguel.sanchez@email.com',
    role: 'PSYCHOLOGIST',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    subscription: {
      planType: 'PRO',
      status: 'ACTIVE'
    }
  },
  {
    id: '7',
    firstName: 'Elena',
    lastName: 'Ruiz',
    email: 'elena.ruiz@email.com',
    role: 'PSYCHOLOGIST',
    status: 'INACTIVE',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '8',
    firstName: 'Roberto',
    lastName: 'Morales',
    email: 'roberto.morales@email.com',
    role: 'PSYCHOLOGIST',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    subscription: {
      planType: 'BASIC',
      status: 'ACTIVE'
    }
  },
  {
    id: '9',
    firstName: 'Patricia',
    lastName: 'Torres',
    email: 'patricia.torres@email.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    subscription: {
      planType: 'PREMIUM',
      status: 'ACTIVE'
    }
  },
  {
    id: '10',
    firstName: 'Fernando',
    lastName: 'Jiménez',
    email: 'fernando.jimenez@email.com',
    role: 'PSYCHOLOGIST',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  }
];

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Intentar cargar datos reales
      try {
        const data = await AdminAPI.getDashboardStats();
        setStats(data);
      } catch (apiError) {
        console.warn('API admin/stats no disponible, usando datos demo:', apiError);
        // Usar datos demo si la API falla
        setTimeout(() => {
          setStats(demoStats);
        }, 500);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar estadísticas';
      setError(message);
      console.error('Error fetching admin stats:', err);
      // En caso de error total, usar datos demo
      setStats(demoStats);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export function useAdminUsers(filters?: UserFilters) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (newFilters?: UserFilters) => {
    try {
      setLoading(true);
      setError(null);

      // Intentar cargar datos reales
      try {
        const data = await AdminAPI.getUsers(newFilters || filters);
        setUsers(data.users);
        setPagination({
          total: data.pagination.total,
          page: data.pagination.page,
          totalPages: data.pagination.pages,
          hasNext: data.pagination.page < data.pagination.pages,
          hasPrev: data.pagination.page > 1
        });
      } catch (apiError) {
        console.warn('API admin/users no disponible, usando datos demo:', apiError);
        // Usar datos demo si la API falla
        const currentFilters = newFilters || filters; // Capture current filters
        const limit = currentFilters?.limit || 10;
        const search = currentFilters?.search?.toLowerCase() || '';

        // Filtrar usuarios demo por búsqueda si existe
        let filteredUsers = demoUsers;
        if (search) {
          filteredUsers = demoUsers.filter(user =>
            user.firstName.toLowerCase().includes(search) ||
            user.lastName.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search)
          );
        }

        const usersToShow = filteredUsers.slice(0, limit);

        setTimeout(() => {
          setUsers(usersToShow);
          setPagination({
            total: filteredUsers.length,
            page: 1,
            totalPages: Math.ceil(filteredUsers.length / limit),
            hasNext: filteredUsers.length > limit,
            hasPrev: false
          });
        }, 300);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar usuarios';
      setError(message);
      console.error('Error fetching admin users:', err);
      // En caso de error total, usar datos demo
      setUsers(demoUsers.slice(0, 5));
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  }, [filters]); // Removed 'filters' comment, added it as dependency since it IS used inside via closure or if we want to reset it

  useEffect(() => {
    fetchUsers(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const getUserById = useCallback(async (id: string): Promise<AdminUser | null> => {
    try {
      setLoading(true);
      setError(null);
      await AdminAPI.getUser(id);
      return null; // Placeholder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuario');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, data: Partial<AdminUser>): Promise<AdminUser | null> => {
    try {
      setLoading(true);
      setError(null);
      await AdminAPI.updateUser(id, data);
      await fetchUsers(filters); // Reload users
      return null; // Placeholder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar usuario');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, filters]);

  return {
    users,
    pagination,
    loading,
    error,
    refetch: fetchUsers,
    getUserById,
    updateUser
  };
}