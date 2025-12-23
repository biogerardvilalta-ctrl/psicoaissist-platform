'use client';
import { useCallback } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { User } from '@/types/auth';

export function useRole() {
  const { user, isAuthenticated } = useAuth();

  const hasRole = useCallback((requiredRole: User['role']): boolean => {
    if (!isAuthenticated || !user) return false;
    return user.role === requiredRole;
  }, [user, isAuthenticated]);

  const hasAnyRole = useCallback((requiredRoles: User['role'][]): boolean => {
    if (!isAuthenticated || !user) return false;
    return requiredRoles.includes(user.role);
  }, [user, isAuthenticated]);

  const isAdmin = useCallback((): boolean => {
    return hasRole('ADMIN') || hasRole('SUPER_ADMIN');
  }, [hasRole]);

  const isPsychologist = useCallback((): boolean => {
    return hasRole('PSYCHOLOGIST');
  }, [hasRole]);


  const isSuperAdmin = useCallback((): boolean => {
    return hasRole('SUPER_ADMIN');
  }, [hasRole]);

  const isAgendaManager = useCallback((): boolean => {
    return hasRole('AGENDA_MANAGER');
  }, [hasRole]);
  return {
    user,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isAdmin,
    isPsychologist,
    isSuperAdmin,
    isAgendaManager,
    currentRole: user?.role

  };
}