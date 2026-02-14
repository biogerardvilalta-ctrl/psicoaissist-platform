import type { Metadata } from 'next';
import AdminRoute from '@/components/auth/AdminRoute';
import { AdminHeader } from '@/components/layout';
import AdminSudoGate from '@/components/auth/AdminSudoGate';

export const metadata: Metadata = {
  title: 'Panel de Administración - PsicoAIssist',
  description: 'Panel de administración para gestionar usuarios y suscripciones de PsicoAIssist',
};

import { NotificationProvider } from '@/context/NotificationContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRoute>
      <NotificationProvider>
        <AdminSudoGate>
          <div className="min-h-screen bg-gray-50">
            <AdminHeader />
            <main>
              {children}
            </main>
          </div>
        </AdminSudoGate>
      </NotificationProvider>
    </AdminRoute>
  );
}