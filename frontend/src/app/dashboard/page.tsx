'use client';

import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  BarChart3,
  Euro,
  Calendar,
  AlertCircle,
  XCircle,
  CheckCircle,
  TrendingUp,
  CalendarDays,
  PlusCircle,
  Trash2
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { RecentActivity, TodaysSessions } from '@/components/dashboard';
import { useEffect, useState } from 'react';
import { DashboardAPI, DashboardStats } from '@/lib/dashboard-api';
import { SessionsAPI } from '@/lib/sessions-api';
import { calculateAdvancedStats, AdvancedStats } from '@/lib/analytics-helper';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { StatsWidget } from '@/components/dashboard/widgets/StatsWidget';
import { SessionsChartWidget } from '@/components/dashboard/widgets/SessionsChartWidget';
import { WeeklyChartWidget } from '@/components/dashboard/widgets/WeeklyChartWidget';
import { UserAPI } from '@/lib/user-api';

// New Imports
import { ThemesWidget } from '@/components/dashboard/widgets/ThemesWidget';
import { SentimentWidget } from '@/components/dashboard/widgets/SentimentWidget';
import { DistributionWidget } from '@/components/dashboard/widgets/DistributionWidget';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const ALL_WIDGETS = [
  { id: 'todaysSessions', label: 'Agenda de Hoy', category: 'Operational' },
  { id: 'sessionsThisMonth', label: 'Sesiones (Mes)', category: 'Analytics' },
  { id: 'activePatients', label: 'Pacientes Activos', category: 'Analytics' },
  { id: 'monthIncome', label: 'Ingresos Estimados', category: 'Analytics' },
  { id: 'sessionsNextWeek', label: 'Agenda (7 días)', category: 'Operational' },
  { id: 'attendanceRate', label: 'Tasa Asistencia', category: 'Analytics' },
  { id: 'cancellationRate', label: 'Tasa Cancelación', category: 'Analytics' },
  { id: 'pendingNotes', label: 'Notas Pendientes', category: 'Operational' },
  { id: 'sessionsChart', label: 'Gráfico Evolución', category: 'Charts' },
  { id: 'weeklyChart', label: 'Gráfico Carga Semanal', category: 'Charts' },
  // New Widgets
  { id: 'themesWidget', label: 'Temas Recurrentes', category: 'Charts' },
  { id: 'sentimentWidget', label: 'Tendencia Bienestar', category: 'Charts' },
  { id: 'sessionTypesWidget', label: 'Tipos de Sesión', category: 'Charts' },
  { id: 'testsWidget', label: 'Pruebas Realizadas', category: 'Analítica Clínica' },
  { id: 'techniquesWidget', label: 'Técnicas Terapéuticas', category: 'Analítica Clínica' },
];

const DEFAULT_LAYOUT = [
  'todaysSessions',
  'sessionsThisMonth',
  'activePatients',
  'monthIncome',

  // Operational Block
  'sessionsNextWeek',
  'pendingNotes',
  'weeklyChart', // Moved here as requested

  // Analytics
  'attendanceRate',
  'cancellationRate',
  'sessionsChart',

  // Clinical
  'themesWidget',
  'sentimentWidget',
  // 'testsWidget', // By default maybe? User said "falta añadir", implying availability or presence. I'll add them to default.
  'testsWidget',
  'techniquesWidget',
  'sessionTypesWidget'
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [advancedStats, setAdvancedStats] = useState<AdvancedStats | null>(null);
  const [dashboardStats, setDashboardStats] = useState<any | null>(null);
  const [layout, setLayout] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Initialize layout
  useEffect(() => {
    if (user) {
      if (user.dashboardLayout && Array.isArray(user.dashboardLayout) && user.dashboardLayout.length > 0) {
        setLayout(user.dashboardLayout);
      } else {
        setLayout(DEFAULT_LAYOUT);
      }
      setIsLoaded(true);
    }
  }, [user]);

  // Fetch Data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashData, allSessions, backendStats] = await Promise.all([
          DashboardAPI.getStats(),
          SessionsAPI.getAll(),
          DashboardAPI.getStats() // Fetching backend stats just in case
        ]);
        setStats(dashData);
        setDashboardStats(backendStats);
        const adv = calculateAdvancedStats(allSessions, 60);
        setAdvancedStats(adv);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: "Error al cargar datos",
          description: "No se pudieron obtener las estadísticas.",
          variant: "destructive",
        });
      }
    };
    fetchStats();
  }, []);

  const handleSaveLayout = async (newLayout: string[]) => {
    if (!user) return;
    try {
      setLayout(newLayout);
      // Persist to backend
      const updatedUser = await UserAPI.updateDashboardLayout(user.id, newLayout);

      // Update local context - CRITICAL FIX
      updateUser(updatedUser);

      toast({
        title: "Diseño guardado",
        description: "Tu configuración de dashboard se ha actualizado correclamente.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    }
  };

  const handleAddWidget = (widgetId: string) => {
    if (!layout.includes(widgetId)) {
      const newLayout = [...layout, widgetId];
      handleSaveLayout(newLayout);
    } else {
      const newLayout = layout.filter(id => id !== widgetId);
      handleSaveLayout(newLayout);
    }
  };

  const handleCardClick = (id: string) => {
    let url = '/dashboard/statistics?tab=overview';
    switch (id) {
      case 'sessionsThisMonth': url += '&metric=sessions'; break;
      case 'activePatients': url += '&metric=patients'; break;
      case 'monthIncome': url += '&metric=income'; break;
      case 'attendanceRate': url = '/dashboard/statistics?tab=patients'; break;
      case 'cancellationRate': url = '/dashboard/statistics?tab=patients'; break;
      case 'sessionsNextWeek': url += '&metric=sessions'; break;
      default: break;
    }
    router.push(url);
  };

  const renderItem = (id: string) => {
    if (!stats || !advancedStats) return <div className="h-full bg-slate-50 animate-pulse rounded-xl"></div>;

    switch (id) {
      case 'todaysSessions': return <TodaysSessions />;
      case 'sessionsChart': return <SessionsChartWidget data={advancedStats.sessionsLast30Days} />;
      case 'weeklyChart': return <WeeklyChartWidget data={advancedStats.weeklyLoad} />;

      // New Widgets
      case 'themesWidget': return <ThemesWidget data={stats.topThemes} />;
      case 'sentimentWidget': return <SentimentWidget data={stats.sentimentTrend} />;
      case 'sessionTypesWidget':
        return <DistributionWidget
          title="Sesiones por Tipo"
          subtitle="Distribución"
          totalValue={dashboardStats?.totalSessions || 0}
          trend={dashboardStats?.sessionTrend || { value: 'N/A', isPositive: true }}
          data={dashboardStats?.sessionTypes || []}
        />;
      case 'testsWidget':
        return <DistributionWidget
          title="Pruebas Realizadas"
          subtitle="IA sugeridas"
          totalValue={dashboardStats?.tests?.reduce((acc: number, t: any) => acc + t.value, 0) || 0}
          trend={{ value: "Total", isPositive: true }}
          data={dashboardStats?.tests || []}
        />;
      case 'techniquesWidget':
        return <DistributionWidget
          title="Técnicas Terapéuticas"
          subtitle="Detectadas"
          totalValue={dashboardStats?.techniques?.reduce((acc: number, t: any) => acc + t.value, 0) || 0}
          trend={{ value: "Total", isPositive: true }}
          data={dashboardStats?.techniques || []}
        />;

      case 'sessionsThisMonth': return <StatsWidget id={id} data={{ title: "Sesiones", value: advancedStats.sessionsThisMonth.toString(), icon: BarChart3, iconBgColor: "bg-blue-100", iconColor: "text-blue-600", subtitle: "Este Mes", trend: { value: "Realizadas", isPositive: true }, onClick: () => handleCardClick(id) }} />;
      case 'activePatients': return <StatsWidget id={id} data={{ title: "Pacientes", value: stats.activeClients.toString(), icon: User, iconBgColor: "bg-blue-100", iconColor: "text-blue-600", subtitle: "Activos", trend: stats.clientTrend, onClick: () => handleCardClick(id) }} />;
      case 'monthIncome': return <StatsWidget id={id} data={{ title: "Ingresos (Est)", value: `${advancedStats.monthIncome}€`, icon: Euro, iconBgColor: "bg-emerald-100", iconColor: "text-emerald-600", subtitle: "Este Mes", trend: { value: `Estimado`, isPositive: true }, onClick: () => handleCardClick(id) }} />;
      case 'sessionsNextWeek': return <StatsWidget id={id} data={{ title: "Agenda (7d)", value: advancedStats.sessionsNextWeek.toString(), icon: Calendar, iconBgColor: "bg-indigo-100", iconColor: "text-indigo-600", subtitle: "Sesiones", trend: { value: "Vista", isPositive: true }, onClick: () => handleCardClick(id) }} />;
      case 'attendanceRate': return <StatsWidget id={id} data={{ title: "Asistencia", value: advancedStats.attendanceRate > 0 ? `${advancedStats.attendanceRate}%` : "-", icon: CheckCircle, iconBgColor: "bg-green-100", iconColor: "text-green-600", subtitle: "Tasa Global", trend: { value: "General", isPositive: true }, onClick: () => handleCardClick(id) }} />;
      case 'cancellationRate': return <StatsWidget id={id} data={{ title: "Cancelaciones", value: `${advancedStats.cancellationRate}%`, icon: XCircle, iconBgColor: "bg-red-100", iconColor: "text-red-600", subtitle: "Tasa Global", trend: advancedStats.cancellationRate > 15 ? { value: "Alta", isPositive: false } : { value: "Baja", isPositive: true }, onClick: () => handleCardClick(id) }} />;
      case 'pendingNotes': return <StatsWidget id={id} data={{ title: "Notas", value: advancedStats.pendingNotes.toString(), icon: AlertCircle, iconBgColor: "bg-orange-100", iconColor: "text-orange-600", subtitle: "Pendientes", trend: advancedStats.pendingNotes > 0 ? { value: "Revisar", isPositive: false } : { value: "Al día", isPositive: true }, onClick: () => handleCardClick(id) }} />;
      default: return <div>Widget desconocido: {id}</div>;
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              Hola, {user?.firstName || 'Doctor/a'}
            </h1>
            <p className="text-slate-500 mt-2">
              Bienvenido a tu asistente clínico inteligente.
            </p>
          </div>

          <Sheet open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Librería de Widgets
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Librería de Widgets</SheetTitle>
                <SheetDescription>
                  Activa o desactiva los widgets que quieres ver en tu dashboard.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4 h-[calc(100vh-140px)] overflow-y-auto pr-2 pb-4">
                {ALL_WIDGETS.map(widget => {
                  const isActive = layout.includes(widget.id);
                  return (
                    <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                      <div>
                        <h4 className="font-medium text-sm">{widget.label}</h4>
                        <span className="text-xs text-muted-foreground">{widget.category}</span>
                      </div>
                      <Button
                        variant={isActive ? "secondary" : "default"}
                        size="sm"
                        onClick={() => handleAddWidget(widget.id)}
                      >
                        {isActive ? 'Ocultar' : 'Añadir'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {isLoaded ? (
          <DashboardGrid
            items={layout}
            renderItem={renderItem}
            onSave={handleSaveLayout}
            defaultItems={DEFAULT_LAYOUT}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        <div className="mt-8">
          <RecentActivity />
        </div>
      </div>
    </ProtectedRoute>
  );
}