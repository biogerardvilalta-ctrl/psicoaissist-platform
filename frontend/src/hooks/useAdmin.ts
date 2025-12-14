'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminAPI, AdminUser, AdminStats, UserFilters, PaginatedUsers } from '@/lib/admin-api';

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
      setLoading(false);
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
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrev: data.hasPrev
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar usuarios';
      setError(message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUser = async (id: string, userData: Partial<AdminUser>) => {
    try {
      await AdminAPI.updateUser(id, userData);
      // Refresh the users list
      await fetchUsers();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar usuario';
      setError(message);
      console.error('Error updating user:', err);
      return false;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await AdminAPI.deleteUser(id);
      // Refresh the users list
      await fetchUsers();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar usuario';
      setError(message);
      console.error('Error deleting user:', err);
      return false;
    }
  };

  return {
    users,
    pagination,
    loading,
    error,
    refetch: fetchUsers,
    updateUser,
    deleteUser
  };
}