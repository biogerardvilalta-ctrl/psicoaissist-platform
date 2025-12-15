'use client';

import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Heart, User, BarChart3, Clock, BookOpen } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { StatsCard, RecentActivity, QuickActions, ProgressChart } from '@/components/dashboard';
import { useEffect, useState } from 'react';
import { DashboardAPI, DashboardStats } from '@/lib/dashboard-api';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await DashboardAPI.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: "Error al cargar datos",
          description: "No se pudieron obtener las estadísticas del dashboard.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="PSYCHOLOGIST">
      <div className="min-h-screen bg-gray-50">
        {/* Main content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Welcome section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Bienvenido, {user?.firstName}! 👋
            </h2>
            <p className="text-gray-600">
              Tu asistente de inteligencia artificial para psicología está listo para ayudarte.
            </p>
          </div>

          {/* Enhanced stats with realistic demo data */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Pacientes Activos"
              value={stats?.activeClients.toString() || "0"}
              icon={User}
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
              subtitle="Total registrados"
              trend={stats?.clientTrend}
            />

            <StatsCard
              title="Sesiones Realizadas"
              value={stats?.totalSessions.toString() || "0"}
              icon={BarChart3}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
              subtitle="Total histórico"
              trend={stats?.sessionTrend}
            />

            <StatsCard
              title="Horas de Consulta"
              value="0"
              icon={Clock}
              iconBgColor="bg-purple-100"
              iconColor="text-purple-600"
              subtitle="Este mes"
              trend={{ value: "8%", isPositive: true }}
            />

            <StatsCard
              title="Informes Generados"
              value={stats?.totalReports.toString() || "0"}
              icon={BookOpen}
              iconBgColor="bg-orange-100"
              iconColor="text-orange-600"
              subtitle="Total histórico"
              trend={stats?.reportTrend}
            />
          </div>

          {/* Charts and analytics section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ProgressChart
              title="Sesiones por Tipo"
              totalValue={stats?.totalSessions || 0}
              trend={{ percentage: 12, isPositive: true, period: "este mes" }}
              data={[
                { label: "Individual", value: 32, color: "bg-blue-500" },
                { label: "Grupal", value: 12, color: "bg-green-500" },
                { label: "Familiar", value: 4, color: "bg-purple-500" }
              ]}
            />

            <ProgressChart
              title="Técnicas Terapéuticas"
              totalValue={85}
              trend={{ percentage: 8, isPositive: true, period: "este mes" }}
              data={[
                { label: "TCC", value: 35, color: "bg-indigo-500" },
                { label: "Mindfulness", value: 25, color: "bg-cyan-500" },
                { label: "EMDR", value: 15, color: "bg-pink-500" },
                { label: "Otras", value: 10, color: "bg-gray-500" }
              ]}
            />
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Quick actions */}
            <QuickActions />

            {/* Recent activity */}
            <RecentActivity />
          </div>

          {/* Welcome message for new users */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ¡Bienvenido a PsycoAI! 🚀
                </h3>
                <p className="text-gray-600 mb-4">
                  Tu plataforma de inteligencia artificial diseñada específicamente para profesionales de la psicología.
                  Aquí podrás acceder a herramientas avanzadas de IA para mejorar tu práctica clínica.
                </p>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Asistente AI especializado en psicología
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Gestión segura de pacientes e historias clínicas
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Análisis y seguimiento de progreso
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}