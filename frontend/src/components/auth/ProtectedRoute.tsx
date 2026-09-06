'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from '@/navigation';
import { useAuth } from '@/contexts/auth-context';
import { User } from '@/types/auth';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: User['role'] | User['role'][];
  redirectTo?: string;
  fallback?: ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/auth/login',
  fallback
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Authenticated but wrong role - redirect based on user role
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : requiredRole ? [requiredRole] : [];
      const hasPermission =
        requiredRoles.length === 0 ||
        requiredRoles.includes(user?.role as User['role']) ||
        (requiredRoles.includes('ADMIN') && user?.role === 'SUPER_ADMIN');

      if (!hasPermission) {
        // Redirect based on user's actual role
        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRole, router, redirectTo]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null; // Router push will handle redirect
  }

  // Wrong role
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : requiredRole ? [requiredRole] : [];
  const hasPermission =
    requiredRoles.length === 0 ||
    requiredRoles.includes(user?.role as User['role']) ||
    (requiredRoles.includes('ADMIN') && user?.role === 'SUPER_ADMIN');
  if (!hasPermission) {
    return null; // Router push will handle redirect
  }

  // All checks passed - render children
  return <>{children}</>;
}