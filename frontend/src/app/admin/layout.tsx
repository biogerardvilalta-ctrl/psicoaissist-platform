import type { Metadata } from 'next';
import AdminRoute from '@/components/auth/AdminRoute';

export const metadata: Metadata = {
  title: 'Panel de Administración - PsycoAI',
  description: 'Panel de administración para gestionar usuarios y suscripciones de PsycoAI',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRoute>
      <div className="admin-layout">
        {children}
      </div>
    </AdminRoute>
  );
}