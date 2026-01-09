'use client';

import { useAdminStats } from '@/hooks/useAdmin';
import { AdminAPI, AdminUser } from '@/lib/admin-api';
import { useState, useEffect } from 'react';
import { Users, CreditCard, Shield, AlertCircle, RefreshCw, LogOut, DollarSign, TrendingUp, MessageSquare, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { AdminStatsCard, RecentUsers, AdminActivityFeed, AdminCharts, EvolutionCharts } from '@/components/admin';

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

      const usersData = await AdminAPI.getUsers({ limit: 5 });
      console.log('📝 Users data received:', usersData);

      if (usersData && Array.isArray(usersData.users)) {
        setUsers(usersData.users);
      } else {
        throw new Error('Estructura de datos inválida');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar usuarios';
      setUsersError(message);
      console.error('Error loading users:', err);
    } finally {
      setUsersLoading(false);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <AdminStatsCard
            title="Usuarios Activos"
            value={stats?.activeUsers || 0}
            icon={Users}
            iconColor="text-blue-600"
            subtitle={`${stats?.activeSubscriptions || 0} Suscripciones + ${stats?.agendaManagersCount || 0} Gestores`}
            action={{ label: "Ver usuarios", onClick: () => router.push('/admin/users') }}
          />

          <AdminStatsCard
            title="Ingresos Estimados"
            value={`€${stats?.totalRevenue || 0}`}
            icon={DollarSign}
            iconColor="text-purple-600"
            subtitle="Facturación mensual recurrente"
            action={{ label: "Ver facturación", onClick: () => router.push('/admin/billing') }}
          />

          <AdminStatsCard
            title="Sesiones Totales"
            value={stats?.totalSessions || 0}
            icon={MessageSquare}
            iconColor="text-indigo-600"
            subtitle="Sesiones realizadas"
          />

          <AdminStatsCard
            title="Reportes Generados"
            value={stats?.totalReports || 0}
            icon={FileText}
            iconColor="text-orange-600"
            subtitle="Informes generados por AI"
          />
          <AdminStatsCard
            title="Uso de Recursos"
            value="Consumo IA"
            icon={TrendingUp}
            iconColor="text-pink-600"
            subtitle={
              <div className="flex flex-col gap-1">
                <span>{stats?.totalTranscriptionMinutes || 0} min transcritos</span>
                <span>{stats?.totalSimulatorSessions || 0} sesiones simulador</span>
              </div>
            }
          />
        </div>

        {/* Charts Section */}
        <div className="mb-8 space-y-8">
          <AdminCharts
            revenueData={stats?.revenueData}
            loading={statsLoading}
          />

          <EvolutionCharts />
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
            <AdminActivityFeed activities={stats?.recentActivity} />
          </div>
        </div>
      </main>
    </div>
  );
}