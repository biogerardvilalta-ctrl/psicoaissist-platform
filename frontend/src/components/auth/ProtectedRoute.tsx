'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { User } from '@/types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: User['role'];
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
        console.log('🔒 Not authenticated, redirecting to:', redirectTo);
        router.push(redirectTo);
        return;
      }

      // Authenticated but wrong role - redirect based on user role
      if (requiredRole && user?.role !== requiredRole) {
        console.log('🚫 Insufficient permissions. Required:', requiredRole, 'Current:', user?.role);
        
        // Redirect based on user's actual role
        if (user?.role === 'ADMIN') {
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando autenticación...</p>
          </div>
        </div>
      )
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null; // Router push will handle redirect
  }

  // Wrong role
  if (requiredRole && user?.role !== requiredRole) {
    return null; // Router push will handle redirect
  }

  // All checks passed - render children
  return <>{children}</>;
}