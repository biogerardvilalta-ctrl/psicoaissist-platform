'use client';

import { ReactNode } from 'react';
import ProtectedRoute from './ProtectedRoute';

interface AdminRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AdminRoute({ children, fallback }: AdminRouteProps) {
  return (
    <ProtectedRoute
      requiredRole="ADMIN"
      redirectTo="/dashboard"
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
}