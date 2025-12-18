import type { Metadata } from 'next';
import AdminRoute from '@/components/auth/AdminRoute';
import { AdminHeader } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Panel de Administración - PsicoAIssist',
  description: 'Panel de administración para gestionar usuarios y suscripciones de PsicoAIssist',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <main>
          {children}
        </main>
      </div>
    </AdminRoute>
  );
}