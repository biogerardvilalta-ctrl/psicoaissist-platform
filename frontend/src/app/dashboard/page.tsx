'use client';

import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import {
  User as UserIcon,
  BarChart3,
  Euro,
  Calendar,
  AlertCircle,
  XCircle,
  CheckCircle,
  TrendingUp,
  CalendarDays,
  PlusCircle,
  Trash2,
  ArrowRight
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
import { User } from '@/types/auth'; // Type import
import { useRole } from '@/hooks/useRole';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

  // Agenda Manager State
  const { isAgendaManager } = useRole();
  const [managedProfessionals, setManagedProfessionals] = useState<User[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('all');

  useEffect(() => {
    // Check role safely without dependency
    const checkAndLoad = async () => {
      if (user?.role === 'AGENDA_MANAGER') {
        try {
          const pros = await UserAPI.getManagedProfessionals();
          setManagedProfessionals(pros);
        } catch (e) {
          console.error(e);
        }
      }
    };
    checkAndLoad();
  }, [user?.role]); // Only re-run if role changes

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
          DashboardAPI.getStats(undefined, isAgendaManager() ? selectedProfessionalId : undefined),
          SessionsAPI.getAll({ professionalId: isAgendaManager() ? selectedProfessionalId : undefined }),
          DashboardAPI.getStats(undefined, isAgendaManager() ? selectedProfessionalId : undefined) // Fetching backend stats just in case
        ]);
        setStats(dashData);
        setDashboardStats(backendStats);
        const adv = calculateAdvancedStats(allSessions, user?.hourlyRate || 60);
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
  }, [toast, user?.hourlyRate, selectedProfessionalId]);

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

      case 'sessionsThisMonth': return <StatsWidget id={id} data={{ title: "Sesiones", value: advancedStats.sessionsThisMonth.toString(), icon: BarChart3, iconBgColor: "bg-primary/10", iconColor: "text-primary", subtitle: "Este Mes", trend: { value: "Realizadas", isPositive: true }, onClick: () => handleCardClick(id) }} />;
      case 'activePatients': return <StatsWidget id={id} data={{ title: "Pacientes", value: stats.activeClients.toString(), icon: UserIcon, iconBgColor: "bg-primary/10", iconColor: "text-primary", subtitle: "Activos", trend: stats.clientTrend, onClick: () => handleCardClick(id) }} />;
      case 'monthIncome': return <StatsWidget id={id} data={{ title: "Ingresos (Est)", value: `${advancedStats.monthIncome}€`, icon: Euro, iconBgColor: "bg-emerald-100", iconColor: "text-emerald-700", subtitle: "Este Mes", trend: { value: "60€/h", isPositive: true }, onClick: () => handleCardClick(id) }} />;
      case 'sessionsNextWeek': return <StatsWidget id={id} data={{ title: "Agenda (7d)", value: advancedStats.sessionsNextWeek.toString(), icon: Calendar, iconBgColor: "bg-violet-100", iconColor: "text-violet-700", subtitle: "Sesiones", trend: { value: "Vista", isPositive: true }, onClick: () => handleCardClick(id) }} />;
      case 'attendanceRate': return <StatsWidget id={id} data={{ title: "Asistencia", value: advancedStats.attendanceRate > 0 ? `${advancedStats.attendanceRate}%` : "-", icon: CheckCircle, iconBgColor: "bg-emerald-100", iconColor: "text-emerald-700", subtitle: "Tasa Global", trend: { value: "General", isPositive: true }, onClick: () => handleCardClick(id) }} />;
      case 'cancellationRate': return <StatsWidget id={id} data={{ title: "Cancelaciones", value: `${advancedStats.cancellationRate}%`, icon: XCircle, iconBgColor: "bg-rose-100", iconColor: "text-rose-700", subtitle: "Tasa Global", trend: advancedStats.cancellationRate > 15 ? { value: "Alta", isPositive: false } : { value: "Baja", isPositive: true }, onClick: () => handleCardClick(id) }} />;
      case 'pendingNotes': return <StatsWidget id={id} data={{ title: "Notas", value: advancedStats.pendingNotes.toString(), icon: AlertCircle, iconBgColor: "bg-amber-100", iconColor: "text-amber-700", subtitle: "Pendientes", trend: advancedStats.pendingNotes > 0 ? { value: "Revisar", isPositive: false } : { value: "Al día", isPositive: true }, onClick: () => handleCardClick(id) }} />;
      default: return <div>Widget desconocido: {id}</div>;
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              {isAgendaManager() ? `Hola, ${user?.firstName || 'Gestor/a'}` : `Hola, ${user?.firstName || 'Doctor/a'}`}
            </h1>
            <p className="text-slate-500 mt-2">
              {isAgendaManager()
                ? 'Gestiona la agenda y pacientes de tus profesionales asignados.'
                : 'Bienvenido a tu asistente clínico inteligente.'}
            </p>
            {isAgendaManager() && managedProfessionals.length === 0 && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">Sin profesionales asignados</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Parece que tienes el rol de Gestor de Agenda pero no tienes profesionales asignados.
                    Por favor, pide a un profesional que te vincule desde su panel de control.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!isAgendaManager() && (
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
            )}
          </div>
        </div>

        {isAgendaManager() ? (
          // Simplified view for Agenda Managers - Professional Cards Only
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-800">Profesionales Asignados</h2>
            {managedProfessionals.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <UserIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No tienes profesionales asignados todavía.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {managedProfessionals.map(pro => (
                  <Card
                    key={pro.id}
                    className="cursor-pointer hover:shadow-lg hover:border-blue-400 transition-all duration-200 group"
                    onClick={() => router.push(`/dashboard/sessions?professionalId=${pro.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 ring-2 ring-slate-100 group-hover:ring-blue-200 transition-all">
                          <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {pro.firstName?.[0]}{pro.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                            {pro.firstName} {pro.lastName}
                          </h3>
                          <p className="text-sm text-slate-500">{pro.email}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Full dashboard for Psychologists
          <>
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
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}