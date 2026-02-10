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
  ArrowRight,
  Shield
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';
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
import { GroupsSection } from '@/components/dashboard/groups/GroupsSection';

// New Imports
import { ThemesWidget } from '@/components/dashboard/widgets/ThemesWidget';
import { SentimentWidget } from '@/components/dashboard/widgets/SentimentWidget';
import { DistributionWidget } from '@/components/dashboard/widgets/DistributionWidget';
import { ReferralWidget } from '@/components/dashboard/widgets/ReferralWidget';
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
import { useTranslations } from 'next-intl';

const WIDGET_IDS = [
  { id: 'todaysSessions', category: 'Operational' },
  { id: 'sessionsThisMonth', category: 'Analytics' },
  { id: 'activePatients', category: 'Analytics' },
  { id: 'monthIncome', category: 'Analytics' },
  { id: 'sessionsNextWeek', category: 'Operational' },
  { id: 'attendanceRate', category: 'Analytics' },
  { id: 'cancellationRate', category: 'Analytics' },
  { id: 'pendingNotes', category: 'Operational' },
  { id: 'sessionsChart', category: 'Charts' },
  { id: 'weeklyChart', category: 'Charts' },
  // New Widgets
  { id: 'themesWidget', category: 'Charts' },
  { id: 'sentimentWidget', category: 'Charts' },
  { id: 'sessionTypesWidget', category: 'Charts' },
  { id: 'testsWidget', category: 'Clinical' },
  { id: 'techniquesWidget', category: 'Clinical' },
  { id: 'referralWidget', category: 'Growth' },
];

const DEFAULT_LAYOUT = [
  'todaysSessions',
  'sessionsThisMonth',
  'activePatients',
  'monthIncome',
  'sessionsNextWeek',
  'weeklyChart',
  'sessionsChart'
];

export default function DashboardPage() {
  const t = useTranslations('Dashboard.Overview');
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [advancedStats, setAdvancedStats] = useState<AdvancedStats | null>(null);
  const [dashboardStats, setDashboardStats] = useState<any | null>(null);
  const [layout, setLayout] = useState<string[]>([]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Agenda Manager & Admin State
  const { isAgendaManager, isAdmin } = useRole();
  const [managedProfessionals, setManagedProfessionals] = useState<User[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('all');
  const [viewAsUser, setViewAsUser] = useState(false);

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
  const searchParams = useSearchParams(); // Needs import

  useEffect(() => {
    const paymentError = searchParams.get('payment_error');
    const intendedPlan = searchParams.get('intended_plan');

    if (paymentError && intendedPlan) {
      toast({
        title: t('alerts.paymentError.title'),
        description: t('alerts.paymentError.description', { plan: intendedPlan.toUpperCase() }),
        variant: "destructive",
        duration: 8000,
        action: (
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-destructive border-destructive hover:bg-destructive/10"
            onClick={() => router.push('/dashboard/settings?section=billing')}
          >
            {t('alerts.paymentError.button')}
          </Button>
        ),
      });
      // Optional: Cleanup params
      router.replace('/dashboard');
    }
  }, [searchParams, toast, router, t]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashData, allSessions] = await Promise.all([
          DashboardAPI.getStats(undefined, isAgendaManager() ? selectedProfessionalId : undefined),
          SessionsAPI.getAll({ professionalId: isAgendaManager() ? selectedProfessionalId : undefined })
        ]);
        setStats(dashData);
        setDashboardStats(dashData);
        const adv = calculateAdvancedStats(allSessions, user?.hourlyRate || 60);
        setAdvancedStats(adv);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: t('Toasts.errorLoading'),
          description: t('Toasts.errorLoadingDesc'),
          variant: "destructive",
        });
      }
    };
    fetchStats();
  }, [toast, user?.hourlyRate, selectedProfessionalId, t]); // Added t dependency

  const handleSaveLayout = async (newLayout: string[]) => {
    if (!user) return;
    try {
      setLayout(newLayout);
      // Persist to backend
      const updatedUser = await UserAPI.updateDashboardLayout(user.id, newLayout);

      // Update local context - CRITICAL FIX
      updateUser(updatedUser);

      toast({
        title: t('Toasts.layoutSaved'),
        description: t('Toasts.layoutSavedDesc'),
      });
    } catch (error) {
      console.error(error);
      toast({
        title: t('Toasts.errorSaving'),
        description: t('Toasts.errorSavingDesc'),
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
          title={t('Widgets.sessionTypesWidget')}
          subtitle={t('Stats.subtitles.distribution')}
          totalValue={dashboardStats?.totalSessions || 0}
          trend={dashboardStats?.sessionTrend || { value: 'N/A', isPositive: true }}
          data={dashboardStats?.sessionTypes || []}
        />;
      case 'testsWidget':
        return <DistributionWidget
          title={t('Widgets.testsWidget')}
          subtitle={t('Stats.subtitles.suggested')}
          totalValue={dashboardStats?.tests?.reduce((acc: number, t: any) => acc + t.value, 0) || 0}
          trend={{ value: t('Stats.trends.total'), isPositive: true }}
          data={dashboardStats?.tests || []}
        />;
      case 'techniquesWidget':
        return <DistributionWidget
          title={t('Widgets.techniquesWidget')}
          subtitle={t('Stats.subtitles.detected')}
          totalValue={dashboardStats?.techniques?.reduce((acc: number, t: any) => acc + t.value, 0) || 0}
          trend={{ value: t('Stats.trends.total'), isPositive: true }}
          data={dashboardStats?.techniques || []}
        />;

      case 'referralWidget': return <ReferralWidget />;

      case 'sessionsThisMonth': return <StatsWidget id={id} data={{ title: t('Stats.sessions'), value: advancedStats.sessionsThisMonth.toString(), icon: BarChart3, iconBgColor: "bg-primary/10", iconColor: "text-primary", subtitle: t('Stats.subtitles.thisMonth'), trend: { value: t('Stats.trends.made'), isPositive: true }, onClick: () => handleCardClick(id) }} />;
      case 'activePatients': return <StatsWidget id={id} data={{ title: t('Stats.patients'), value: stats.activeClients.toString(), icon: UserIcon, iconBgColor: "bg-primary/10", iconColor: "text-primary", subtitle: t('Stats.subtitles.active'), trend: stats.clientTrend, onClick: () => handleCardClick(id) }} />;
      case 'monthIncome': return <StatsWidget id={id} data={{ title: t('Stats.income'), value: `${advancedStats.monthIncome}€`, icon: Euro, iconBgColor: "bg-emerald-100", iconColor: "text-emerald-700", subtitle: t('Stats.subtitles.thisMonth'), trend: { value: "60€/h", isPositive: true }, onClick: () => handleCardClick(id) }} />;
      case 'sessionsNextWeek': return <StatsWidget id={id} data={{ title: t('Stats.agenda7d'), value: advancedStats.sessionsNextWeek.toString(), icon: Calendar, iconBgColor: "bg-violet-100", iconColor: "text-violet-700", subtitle: t('Stats.subtitles.sessions'), trend: { value: t('Stats.trends.view'), isPositive: true }, onClick: () => handleCardClick(id) }} />;
      case 'attendanceRate': return <StatsWidget id={id} data={{ title: t('Stats.attendance'), value: advancedStats.attendanceRate > 0 ? `${advancedStats.attendanceRate}%` : "-", icon: CheckCircle, iconBgColor: "bg-emerald-100", iconColor: "text-emerald-700", subtitle: t('Stats.subtitles.globalRate'), trend: { value: t('Stats.trends.general'), isPositive: true }, onClick: () => handleCardClick(id) }} />;
      case 'cancellationRate': return <StatsWidget id={id} data={{ title: t('Stats.cancellations'), value: `${advancedStats.cancellationRate}%`, icon: XCircle, iconBgColor: "bg-rose-100", iconColor: "text-rose-700", subtitle: t('Stats.subtitles.globalRate'), trend: advancedStats.cancellationRate > 15 ? { value: t('Stats.trends.high'), isPositive: false } : { value: t('Stats.trends.low'), isPositive: true }, onClick: () => handleCardClick(id) }} />;
      case 'pendingNotes': return <StatsWidget id={id} data={{ title: t('Stats.notes'), value: advancedStats.pendingNotes.toString(), icon: AlertCircle, iconBgColor: "bg-amber-100", iconColor: "text-amber-700", subtitle: t('Stats.subtitles.pending'), trend: advancedStats.pendingNotes > 0 ? { value: t('Stats.trends.review'), isPositive: false } : { value: t('Stats.trends.upToDate'), isPositive: true }, onClick: () => handleCardClick(id) }} />;
      default: return <div>Widget desconocido: {id}</div>;
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">


          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              {isAgendaManager()
                ? t('welcome', { name: user?.firstName || t('roles.manager') })
                : t('welcome', { name: user?.firstName || t('roles.doctor') })}
            </h1>
            <p className="text-slate-500 mt-2">
              {isAgendaManager()
                ? t('subtitle.manager')
                : t('subtitle.psychologist')}
            </p>
            {isAgendaManager() && managedProfessionals.length === 0 && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">{t('alerts.noProfessionals.title')}</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    {t('alerts.noProfessionals.description')}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!isAgendaManager() && (
              <div className="w-72 h-auto hidden lg:block hover:scale-[1.02] transition-transform duration-200">
                <ReferralWidget />
              </div>
            )}
          </div>
        </div>

        {/* System Alerts */}
        {stats?.alerts && stats.alerts.length > 0 && (
          <div className="mb-8 space-y-3">
            {stats.alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg flex items-start gap-3 border ${alert.type === 'WARNING' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                  alert.type === 'CRITICAL' ? 'bg-red-50 border-red-200 text-red-800' :
                    'bg-blue-50 border-blue-200 text-blue-800'
                  }`}
              >
                {alert.type === 'WARNING' && <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />}
                {alert.type === 'CRITICAL' && <XCircle className="h-5 w-5 mt-0.5 shrink-0" />}
                {alert.type === 'INFO' && <Shield className="h-5 w-5 mt-0.5 shrink-0" />}
                <p className="text-sm font-medium">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        {isAdmin() && !viewAsUser ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="p-6 bg-purple-50 rounded-full ring-1 ring-purple-100">
              <Shield className="w-16 h-16 text-purple-600" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('Admin.title')}</h2>
              <p className="text-gray-500 max-w-lg mx-auto text-lg">
                {t('Admin.description')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 min-w-[300px] justify-center pt-4">
              <Button
                onClick={() => router.push('/admin')}
                className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all h-12 px-8 text-base"
              >
                <Shield className="w-5 h-5" />
                {t('Admin.goToPanel')}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/profile')}
                className="gap-2 h-12 px-8 text-base border-gray-200 hover:bg-gray-50 hover:text-gray-900"
              >
                <UserIcon className="w-5 h-5" />
                {t('Admin.myProfile')}
              </Button>
            </div>
            <div className="pt-4">
              <Button
                variant="ghost"
                onClick={() => setViewAsUser(true)}
                className="text-slate-500 hover:text-slate-800"
              >
                Ver Dashboard como Usuario
              </Button>
            </div>
          </div>
        ) : isAgendaManager() ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-800">{t('Manager.assignedProfessionals')}</h2>
            {managedProfessionals.filter(p => p.role !== 'PROFESSIONAL_GROUP').length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <UserIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">{t('Manager.noAssigned')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {managedProfessionals
                  .filter(pro => pro.role !== 'PROFESSIONAL_GROUP')
                  .map(pro => (
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

            <GroupsSection
              groups={managedProfessionals.filter(p => p.role === 'PROFESSIONAL_GROUP')}
              professionals={managedProfessionals.filter(p => p.role !== 'PROFESSIONAL_GROUP')}
              onGroupChange={() => {
                // Refresh data
                const checkAndLoad = async () => {
                  if (user?.role === 'AGENDA_MANAGER') {
                    try {
                      const pros = await UserAPI.getManagedProfessionals();
                      setManagedProfessionals(pros);
                    } catch (e) { console.error(e); }
                  }
                };
                checkAndLoad();
              }}
            />
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
                headerActions={
                  <Sheet open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('Library.openButton')}</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>{t('Library.title')}</SheetTitle>
                        <SheetDescription>
                          {t('Library.description')}
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-4 h-[calc(100vh-140px)] overflow-y-auto pr-2 pb-4">
                        {WIDGET_IDS.filter(w => w.id !== 'referralWidget').map(widget => {
                          const isActive = layout.includes(widget.id);
                          return (
                            <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                              <div>
                                <h4 className="font-medium text-sm">{t(`Widgets.${widget.id}`)}</h4>
                                <span className="text-xs text-muted-foreground">{t(`Widgets.categories.${widget.category}`)}</span>
                              </div>
                              <Button
                                variant={isActive ? "secondary" : "default"}
                                size="sm"
                                onClick={() => handleAddWidget(widget.id)}
                              >
                                {isActive ? t('Library.hide') : t('Library.add')}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </SheetContent>
                  </Sheet>
                }
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
    </ProtectedRoute >
  );
}