'use client';

import { useAuth } from '@/contexts/auth-context';
import { User } from '@/types/auth';

export function useRole() {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (requiredRole: User['role']): boolean => {
    if (!isAuthenticated || !user) return false;
    return user.role === requiredRole;
  };

  const hasAnyRole = (requiredRoles: User['role'][]): boolean => {
    if (!isAuthenticated || !user) return false;
    return requiredRoles.includes(user.role);
  };

  const isAdmin = (): boolean => {
    return hasRole('ADMIN') || hasRole('SUPER_ADMIN');
  };

  const isPsychologist = (): boolean => {
    return hasRole('PSYCHOLOGIST');
  };

  const isSuperAdmin = (): boolean => {
    return hasRole('SUPER_ADMIN');
  };

  return {
    user,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isAdmin,
    isPsychologist,
    isSuperAdmin,
    currentRole: user?.role
  };
}