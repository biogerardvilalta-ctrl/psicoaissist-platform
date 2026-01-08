'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminAPI, AdminUser, AdminStats, UserFilters, PaginatedUsers } from '@/lib/admin-api';

// Demo data removed
const demoStats: AdminStats | null = null;
const demoUsers: AdminUser[] = [];

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await AdminAPI.getDashboardStats();
      setStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar estadísticas';
      setError(message);
      console.error('Error fetching admin stats:', err);
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

      const data = await AdminAPI.getUsers(newFilters || filters);
      setUsers(data.users);
      setPagination({
        total: data.pagination.total,
        page: data.pagination.page,
        totalPages: data.pagination.pages,
        hasNext: data.pagination.page < data.pagination.pages,
        hasPrev: data.pagination.page > 1
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar usuarios';
      setError(message);
      console.error('Error fetching admin users:', err);
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
      const user = await AdminAPI.getUser(id);
      return user;
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
      const updatedUser = await AdminAPI.updateUser(id, data);
      await fetchUsers(filters); // Reload users
      return updatedUser;
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