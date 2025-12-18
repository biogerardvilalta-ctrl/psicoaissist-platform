'use client';

import { useAdminStats } from '@/hooks/useAdmin';
import { AdminAPI, AdminUser } from '@/lib/admin-api';
import { useState, useEffect } from 'react';
import { Users, CreditCard, Shield, AlertCircle, RefreshCw, LogOut, DollarSign, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { AdminStatsCard, RecentUsers, AdminActivityFeed, AdminCharts } from '@/components/admin';

export default function AdminDashboard() {
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useAdminStats();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    loadUsersData();
  }, []);

  const loadUsersData = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      console.log('🔄 Loading users data...');

      // Intentar cargar datos reales primero
      try {
        const usersData = await AdminAPI.getUsers({ limit: 5 });
        console.log('📝 Users data received:', usersData);

        if (usersData && Array.isArray(usersData.users)) {
          setUsers(usersData.users);
          console.log('✅ Users set successfully:', usersData.users.length, 'users');
        } else {
          throw new Error('Estructura de datos inválida');
        }
      } catch (apiError) {
        console.warn('API admin/users no disponible, usando datos demo:', apiError);

        // Datos demo cuando la API falle
        const demoUsers: AdminUser[] = [
          {
            id: '1',
            firstName: 'Ana',
            lastName: 'García',
            email: 'ana.garcia@psicoaissist.com',
            role: 'PSYCHOLOGIST',
            status: 'ACTIVE',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            subscription: { planType: 'PRO', status: 'ACTIVE' }
          },
          {
            id: '2',
            firstName: 'Carlos',
            lastName: 'Mendoza',
            email: 'carlos.mendoza@email.com',
            role: 'PSYCHOLOGIST',
            status: 'ACTIVE',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            subscription: { planType: 'PREMIUM', status: 'ACTIVE' }
          },
          {
            id: '3',
            firstName: 'María',
            lastName: 'López',
            email: 'maria.lopez@email.com',
            role: 'PSYCHOLOGIST',
            status: 'ACTIVE',
            createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            subscription: { planType: 'BASIC', status: 'ACTIVE' }
          },
          {
            id: '4',
            firstName: 'Jorge',
            lastName: 'Ramírez',
            email: 'jorge.ramirez@email.com',
            role: 'PSYCHOLOGIST',
            status: 'ACTIVE',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '5',
            firstName: 'Laura',
            lastName: 'Fernández',
            email: 'laura.fernandez@email.com',
            role: 'ADMIN',
            status: 'ACTIVE',
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            subscription: { planType: 'PREMIUM', status: 'ACTIVE' }
          }
        ];

        setTimeout(() => {
          setUsers(demoUsers);
          console.log('✅ Demo users loaded successfully');
        }, 500);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar usuarios';
      setUsersError(message);
      console.error('Error loading users:', err);
    } finally {
      setTimeout(() => setUsersLoading(false), 600);
    }
  };

  if (statsLoading && usersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (statsError && usersError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de acceso</h2>
          <p className="text-gray-600 mb-4">{statsError || usersError}</p>
          <button
            onClick={() => {
              refetchStats();
              loadUsersData();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="mt-1 text-sm text-gray-600">Gestiona usuarios y suscripciones de PsicoAIssist</p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AdminStatsCard
            title="Total Usuarios"
            value={stats?.totalUsers || 0}
            icon={Users}
            iconColor="text-blue-600"
            subtitle="Registrados en la plataforma"
            trend={{ value: "12%", isPositive: true, period: "este mes" }}
            action={{ label: "Ver usuarios", onClick: () => router.push('/admin/users') }}
          />

          <AdminStatsCard
            title="Suscripciones Activas"
            value={stats?.activeSubscriptions || 0}
            icon={CreditCard}
            iconColor="text-green-600"
            subtitle="Planes premium activos"
            trend={{ value: "8%", isPositive: true, period: "este mes" }}
            action={{ label: "Ver suscripciones", onClick: () => console.log('Ver suscripciones') }}
          />

          <AdminStatsCard
            title="Ingresos Mensuales"
            value="€6,100"
            icon={DollarSign}
            iconColor="text-purple-600"
            subtitle="Facturación actual"
            trend={{ value: "15%", isPositive: true, period: "vs mes anterior" }}
            action={{ label: "Ver reportes", onClick: () => console.log('Ver reportes') }}
          />

          <AdminStatsCard
            title="Tasa de Conversión"
            value="24.5%"
            icon={TrendingUp}
            iconColor="text-orange-600"
            subtitle="Free a Premium"
            trend={{ value: "3%", isPositive: true, period: "este mes" }}
            action={{ label: "Analizar", onClick: () => console.log('Analizar conversión') }}
          />
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <AdminCharts loading={statsLoading} />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Users - 2 columns */}
          <div className="lg:col-span-2">
            <RecentUsers
              users={users}
              loading={usersLoading}
              error={usersError}
              onRefresh={loadUsersData}
              onViewAll={() => router.push('/admin/users')}
            />
          </div>

          {/* Activity Feed - 1 column */}
          <div className="lg:col-span-1">
            <AdminActivityFeed />
          </div>
        </div>
      </main>
    </div>
  );
}