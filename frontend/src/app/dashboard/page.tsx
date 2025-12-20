'use client';

import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Heart, User, BarChart3, Clock, BookOpen, Euro, Calendar, AlertCircle, XCircle, CheckCircle } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatsCard, RecentActivity, TodaysSessions } from '@/components/dashboard';
import { useEffect, useState } from 'react';
import { DashboardAPI, DashboardStats } from '@/lib/dashboard-api';
import { SessionsAPI, Session, SessionStatus } from '@/lib/sessions-api';
import { ClientsAPI, Client } from '@/lib/clients-api';
import { isSameMonth, parseISO, addDays, isAfter, isBefore } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [extraStats, setExtraStats] = useState({
    sessionsNextWeek: 0,
    pendingNotes: 0,
    cancellationRate: 0,
    attendanceRate: 0,
    monthIncome: 0,
    sessionsThisMonth: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashData, allSessions] = await Promise.all([
          DashboardAPI.getStats(),
          SessionsAPI.getAll()
        ]);
        setStats(dashData);

        // --- Calculate New Metrics ---
        const now = new Date();

        // 1. Next 7 Days
        const nextWeek = addDays(now, 7);
        const sessionsNextWeek = allSessions.filter(s =>
          s.status === 'SCHEDULED' &&
          isAfter(parseISO(s.startTime), now) &&
          isBefore(parseISO(s.startTime), nextWeek)
        ).length;

        // 2. Pending Notes (Completed with empty notes)
        const pendingNotes = allSessions.filter(s =>
          s.status === SessionStatus.COMPLETED &&
          (!s.notes || s.notes.trim().length === 0)
        ).length;

        // 3. Month Income (Est. 60€/session)
        const completedThisMonth = allSessions.filter(s =>
          s.status === SessionStatus.COMPLETED &&
          isSameMonth(parseISO(s.startTime), now)
        ).length;
        const monthIncome = completedThisMonth * 60;

        // 4. Rates (Attendance & Cancellation)
        const completed = allSessions.filter(s => s.status === SessionStatus.COMPLETED).length;
        const cancelled = allSessions.filter(s => s.status === SessionStatus.CANCELLED || s.status === SessionStatus.NO_SHOW).length;
        const totalForRate = completed + cancelled;

        const cancellationRate = totalForRate > 0 ? Math.round((cancelled / totalForRate) * 100) : 0;
        const attendanceRate = totalForRate > 0 ? Math.round((completed / totalForRate) * 100) : 100;

        setExtraStats({
          sessionsNextWeek,
          pendingNotes,
          monthIncome,
          cancellationRate,
          attendanceRate,
          sessionsThisMonth: completedThisMonth
        });

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

          <div className="flex justify-end mb-4">
            <Link href="/dashboard/statistics" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
              Ver estadísticas detalladas <BarChart3 className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {/* Enhanced stats with realistic demo data */}
          {/* Top Section: Agenda (Left) and Stats (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left Col: Today's Scheduler */}
            <div className="h-full">
              <TodaysSessions />
            </div>

            {/* Right Col: Key Business Metrics (2x2) */}
            <div className="grid grid-cols-2 gap-4 h-fit">
              <StatsCard
                title="Sesiones"
                value={extraStats.sessionsThisMonth.toString()}
                icon={BarChart3}
                iconBgColor="bg-blue-100"
                iconColor="text-blue-600"
                subtitle="Este Mes"
                trend={{ value: "Realizadas", isPositive: true }}
              />

              <StatsCard
                title="Pacientes"
                value={stats?.activeClients.toString() || "0"}
                icon={User}
                iconBgColor="bg-blue-100"
                iconColor="text-blue-600"
                subtitle="Activos"
                trend={stats?.clientTrend}
              />

              <StatsCard
                title="Ingresos (Est)"
                value={`${extraStats.monthIncome}€`}
                icon={Euro}
                iconBgColor="bg-emerald-100"
                iconColor="text-emerald-600"
                subtitle="Este Mes"
                trend={{ value: "~60€/h", isPositive: true }}
              />

              <StatsCard
                title="Agenda (7d)"
                value={extraStats.sessionsNextWeek.toString()}
                icon={Calendar}
                iconBgColor="bg-indigo-100"
                iconColor="text-indigo-600"
                subtitle="Sesiones"
                trend={{ value: "Vista", isPositive: true }}
              />
            </div>
          </div>

          {/* Secondary Metrics Row: Quality & Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Notas"
              value={extraStats.pendingNotes.toString()}
              icon={AlertCircle}
              iconBgColor="bg-orange-100"
              iconColor="text-orange-600"
              subtitle="Pendientes"
              trend={extraStats.pendingNotes > 0 ? { value: "Revisar", isPositive: false } : { value: "Al día", isPositive: true }}
            />

            <StatsCard
              title="Asistencia"
              value={extraStats.attendanceRate > 0 ? `${extraStats.attendanceRate}%` : "-"}
              icon={CheckCircle}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
              subtitle="Tasa Global"
              trend={{ value: "General", isPositive: true }}
            />

            <StatsCard
              title="Cancelaciones"
              value={`${extraStats.cancellationRate}%`}
              icon={XCircle}
              iconBgColor="bg-red-100"
              iconColor="text-red-600"
              subtitle="Tasa Global"
              trend={extraStats.cancellationRate > 15 ? { value: "Alta", isPositive: false } : { value: "Baja", isPositive: true }}
            />
          </div>



          {/* Main content grid */}
          <div className="mb-8">
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
                  ¡Bienvenido a PsicoAIssist! 🚀
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
      </div >
    </ProtectedRoute >
  );
}