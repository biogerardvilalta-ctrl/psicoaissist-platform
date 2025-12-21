'use client';

import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Heart, User, BarChart3, Clock, BookOpen, Euro, Calendar, AlertCircle, XCircle, CheckCircle, Settings, TrendingUp, CalendarDays } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatsCard, RecentActivity, TodaysSessions } from '@/components/dashboard';
import { useEffect, useState } from 'react';
import { DashboardAPI, DashboardStats } from '@/lib/dashboard-api';
import { SessionsAPI, Session, SessionStatus } from '@/lib/sessions-api';
import { ClientsAPI, Client } from '@/lib/clients-api';
import { calculateAdvancedStats, AdvancedStats } from '@/lib/analytics-helper';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Configuration Interface
interface DashboardConfig {
  hourlyRate: number;
  visibleMetrics: string[];
}

const DEFAULT_CONFIG: DashboardConfig = {
  hourlyRate: 60,
  visibleMetrics: ['activePatients', 'sessionsThisMonth', 'attendanceRate']
};

const METRIC_DEFINITIONS = [
  { id: 'sessionsThisMonth', label: 'Sesiones (Este Mes)', icon: BarChart3 },
  { id: 'activePatients', label: 'Pacientes Activos', icon: User },
  { id: 'monthIncome', label: 'Ingresos Estimados', icon: Euro },
  { id: 'sessionsNextWeek', label: 'Agenda (7 días)', icon: Calendar },
  { id: 'attendanceRate', label: 'Tasa de Asistencia', icon: CheckCircle },
  { id: 'cancellationRate', label: 'Tasa de Cancelación', icon: XCircle },
  { id: 'pendingNotes', label: 'Notas Pendientes', icon: AlertCircle },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [advancedStats, setAdvancedStats] = useState<AdvancedStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Config State
  const [config, setConfig] = useState<DashboardConfig>(DEFAULT_CONFIG);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  // Load Config on Mount
  useEffect(() => {
    const saved = localStorage.getItem('dashboardConfig');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      } catch (e) {
        console.error("Error parsing dashboard config", e);
      }
    }
    setIsConfigLoaded(true);
  }, []);

  // Save Config on Change (only after load)
  useEffect(() => {
    if (isConfigLoaded) {
      localStorage.setItem('dashboardConfig', JSON.stringify(config));
    }
  }, [config, isConfigLoaded]);

  // Fetch Data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashData, allSessions] = await Promise.all([
          DashboardAPI.getStats(),
          SessionsAPI.getAll()
        ]);
        setStats(dashData);
        // Calculate with current rate
        const adv = calculateAdvancedStats(allSessions, config.hourlyRate);
        setAdvancedStats(adv);
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
  }, [config.hourlyRate]); // Re-calc if rate changes

  const handleToggleMetric = (id: string, checked: boolean) => {
    setConfig(prev => {
      const newMetrics = checked
        ? [...prev.visibleMetrics, id]
        : prev.visibleMetrics.filter(m => m !== id);
      return { ...prev, visibleMetrics: newMetrics };
    });
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

  const renderMetricCard = (metricId: string) => {
    if (!stats || !advancedStats) return null;

    switch (metricId) {
      case 'sessionsThisMonth':
        return (
          <StatsCard
            key={metricId}
            title="Sesiones"
            value={advancedStats.sessionsThisMonth.toString()}
            icon={BarChart3}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            subtitle="Este Mes"
            trend={{ value: "Realizadas", isPositive: true }}
            onClick={() => handleCardClick(metricId)}
          />
        );
      case 'activePatients':
        return (
          <StatsCard
            key={metricId}
            title="Pacientes"
            value={stats.activeClients.toString()}
            icon={User}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            subtitle="Activos"
            trend={stats.clientTrend}
            onClick={() => handleCardClick(metricId)}
          />
        );
      case 'monthIncome':
        return (
          <StatsCard
            key={metricId}
            title="Ingresos (Est)"
            value={`${advancedStats.monthIncome}€`}
            icon={Euro}
            iconBgColor="bg-emerald-100"
            iconColor="text-emerald-600"
            subtitle="Este Mes"
            trend={{ value: `${config.hourlyRate}€/h`, isPositive: true }}
            onClick={() => handleCardClick(metricId)}
          />
        );
      case 'sessionsNextWeek':
        return (
          <StatsCard
            key={metricId}
            title="Agenda (7d)"
            value={advancedStats.sessionsNextWeek.toString()}
            icon={Calendar}
            iconBgColor="bg-indigo-100"
            iconColor="text-indigo-600"
            subtitle="Sesiones"
            trend={{ value: "Vista", isPositive: true }}
            onClick={() => handleCardClick(metricId)}
          />
        );
      case 'attendanceRate':
        return (
          <StatsCard
            key={metricId}
            title="Asistencia"
            value={advancedStats.attendanceRate > 0 ? `${advancedStats.attendanceRate}%` : "-"}
            icon={CheckCircle}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            subtitle="Tasa Global"
            trend={{ value: "General", isPositive: true }}
            onClick={() => handleCardClick(metricId)}
          />
        );
      case 'cancellationRate':
        return (
          <StatsCard
            key={metricId}
            title="Cancelaciones"
            value={`${advancedStats.cancellationRate}%`}
            icon={XCircle}
            iconBgColor="bg-red-100"
            iconColor="text-red-600"
            subtitle="Tasa Global"
            trend={advancedStats.cancellationRate > 15 ? { value: "Alta", isPositive: false } : { value: "Baja", isPositive: true }}
            onClick={() => handleCardClick(metricId)}
          />
        );
      case 'pendingNotes':
        return (
          <StatsCard
            key={metricId}
            title="Notas"
            value={advancedStats.pendingNotes.toString()}
            icon={AlertCircle}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            subtitle="Pendientes"
            trend={advancedStats.pendingNotes > 0 ? { value: "Revisar", isPositive: false } : { value: "Al día", isPositive: true }}
            onClick={() => handleCardClick(metricId)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              Hola, {user?.firstName || 'Doctor/a'}
            </h1>
            <p className="text-slate-500 mt-2">
              Bienvenido a tu asistente clínico inteligente. Aquí tienes el resumen de hoy.
            </p>
          </div>

          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-white">
                <Settings className="h-4 w-4" />
                Seleccionar métricas
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white">
              <DialogHeader>
                <DialogTitle>Personalizar Dashboard</DialogTitle>
                <DialogDescription>
                  Ajusta los parámetros y métricas que deseas ver.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rate" className="text-right">
                    Tarifa/Hora
                  </Label>
                  <Input
                    id="rate"
                    type="number"
                    value={config.hourlyRate}
                    onChange={(e) => setConfig({ ...config, hourlyRate: Number(e.target.value) })}
                    className="col-span-3"
                  />
                </div>

                <div className="space-y-3 mt-2">
                  <Label>Métricas Visibles</Label>
                  {METRIC_DEFINITIONS.map((metric) => (
                    <div key={metric.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={metric.id}
                        checked={config.visibleMetrics.includes(metric.id)}
                        onCheckedChange={(checked) => handleToggleMetric(metric.id, checked as boolean)}
                      />
                      <Label htmlFor={metric.id} className="cursor-pointer flex items-center gap-2">
                        <metric.icon className="h-4 w-4 text-muted-foreground" />
                        {metric.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Col: Today's Scheduler */}
          <div className="h-full flex flex-col gap-6">
            <TodaysSessions />
          </div>

          {/* Right Col: Dynamic Stats Grid */}
          <div className="space-y-6">

            {/* Config Button Row */}


            <div className="grid grid-cols-2 gap-4 h-fit">
              {config.visibleMetrics.map(id => renderMetricCard(id))}
            </div>

            {/* Fallback/Empty State */}
            {config.visibleMetrics.length === 0 && (
              <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                No has seleccionado ninguna métrica. <br />
                Usa el botón "Configurar" para añadir tarjetas.
              </div>
            )}
          </div>
        </div>

        {/* Full Width / Half Split Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

          {/* Session Evolution Chart */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Evolución de Sesiones</h3>
                <p className="text-sm text-slate-500">Últimos 30 días</p>
              </div>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </div>
            <div className="h-[200px] w-full">
              {advancedStats?.sessionsLast30Days ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={advancedStats.sessionsLast30Days}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={30}
                    />
                    <YAxis
                      hide
                      domain={[0, 'auto']}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorCount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Cargando datos...
                </div>
              )}
            </div>
          </div>

          {/* Weekly Load Chart */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Carga Semanal</h3>
                <p className="text-sm text-slate-500">Sesiones Lun-Dom</p>
              </div>
              <CalendarDays className="h-4 w-4 text-slate-400" />
            </div>
            <div className="h-[200px] w-full">
              {advancedStats?.weeklyLoad ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={advancedStats.weeklyLoad}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      hide
                      domain={[0, 'auto']}
                    />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Cargando datos...
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Main content grid */}
        <div className="mb-8">
          <RecentActivity />
        </div>
      </div>
    </ProtectedRoute>
  );
}