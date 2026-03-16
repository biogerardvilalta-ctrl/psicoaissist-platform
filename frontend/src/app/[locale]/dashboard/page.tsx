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
  }, [user?.role]);

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
  const searchParams = useSearchParams();

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
  }, [toast, user?.hourlyRate, selectedProfessionalId, t]);

  const handleSaveLayout = async (newLayout: string[]) => {
    if (!user) return;
    try {
      setLayout(newLayout);
      const updatedUser = await UserAPI.updateDashboardLayout(user.id, newLayout);
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
    if (!stats || !advancedStats) return <div className="h-full bg-gray-100/50 animate-pulse rounded-xl" />;

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
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8" id="dashboard-content">
        {/* Welcome Header */}
        <div className="mb-6 sm:mb-8 flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div className="min-w-0 animate-fade-in-up">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {isAgendaManager()
                ? t('welcome', { name: user?.firstName || t('roles.manager') })
                : t('welcome', { name: user?.firstName || t('roles.doctor') })}
            </h1>
            <p className="text-gray-500 mt-1.5 text-sm sm:text-base">
              {isAgendaManager()
                ? t('subtitle.manager')
                : t('subtitle.psychologist')}
            </p>
            {isAgendaManager() && managedProfessionals.length === 0 && (
              <div className="mt-4 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900 text-sm">{t('alerts.noProfessionals.title')}</h4>
                  <p className="text-xs sm:text-sm text-amber-700 mt-1">
                    {t('alerts.noProfessionals.description')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {!isAgendaManager() && (
            <div className="hidden lg:block w-72 hover:scale-[1.02] transition-transform duration-200">
              <ReferralWidget />
            </div>
          )}
        </div>

        {/* System Alerts */}
        {stats?.alerts && stats.alerts.length > 0 && (
          <div className="mb-6 sm:mb-8 space-y-3 animate-fade-in-down">
            {stats.alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 sm:p-4 rounded-xl flex items-start gap-3 border transition-all ${
                  alert.type === 'WARNING' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                  alert.type === 'CRITICAL' ? 'bg-red-50 border-red-200 text-red-900' :
                  'bg-blue-50 border-blue-200 text-blue-900'
                }`}
                id={`alert-${index}`}
              >
                {alert.type === 'WARNING' && <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />}
                {alert.type === 'CRITICAL' && <XCircle className="h-5 w-5 mt-0.5 shrink-0" />}
                {alert.type === 'INFO' && <Shield className="h-5 w-5 mt-0.5 shrink-0" />}
                <p className="text-sm font-medium leading-relaxed">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        {isAdmin() && !viewAsUser ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] text-center space-y-5 sm:space-y-6 animate-fade-in-up px-4" id="admin-view">
            <div className="p-5 sm:p-6 bg-purple-50 rounded-2xl ring-1 ring-purple-100">
              <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-purple-600" />
            </div>
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{t('Admin.title')}</h2>
              <p className="text-gray-500 max-w-md mx-auto text-sm sm:text-lg leading-relaxed">
                {t('Admin.description')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mx-auto pt-3 sm:pt-4">
              <Button
                onClick={() => router.push('/admin')}
                className="gap-2 bg-gradient-primary hover:opacity-90 text-white shadow-glow-primary hover:shadow-elevated transition-all h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base flex-1"
                id="admin-go-panel"
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('Admin.goToPanel')}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/profile')}
                className="gap-2 h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base border-gray-200 hover:bg-gray-50 hover:text-gray-900 flex-1"
                id="admin-my-profile"
              >
                <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('Admin.myProfile')}
              </Button>
            </div>
            <Button
              variant="ghost"
              onClick={() => setViewAsUser(true)}
              className="text-gray-400 hover:text-gray-700 text-sm"
              id="admin-view-as-user"
            >
              Ver Dashboard como Usuario
            </Button>
          </div>
        ) : isAgendaManager() ? (
          <div className="space-y-6 sm:space-y-8 animate-fade-in-up" id="manager-view">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('Manager.assignedProfessionals')}</h2>
            {managedProfessionals.filter(p => p.role !== 'PROFESSIONAL_GROUP').length === 0 ? (
              <Card className="border-gray-200 shadow-card">
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="p-4 bg-gray-100 rounded-2xl w-fit mx-auto mb-4">
                    <UserIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-sm sm:text-base">{t('Manager.noAssigned')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 stagger-children">
                {managedProfessionals
                  .filter(pro => pro.role !== 'PROFESSIONAL_GROUP')
                  .map(pro => (
                    <Card
                      key={pro.id}
                      className="cursor-pointer hover:shadow-card-hover hover:border-primary/30 transition-all duration-200 group border-gray-100 shadow-card"
                      onClick={() => router.push(`/dashboard/sessions?professionalId=${pro.id}`)}
                    >
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-gray-100 group-hover:ring-primary/20 transition-all">
                            <AvatarFallback className="text-sm sm:text-base bg-gradient-primary text-white font-semibold">
                              {pro.firstName?.[0]}{pro.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-primary transition-colors truncate">
                              {pro.firstName} {pro.lastName}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">{pro.email}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
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
          <div className="animate-fade-in" id="psychologist-view">
            {isLoaded ? (
              <DashboardGrid
                items={layout}
                renderItem={renderItem}
                onSave={handleSaveLayout}
                defaultItems={DEFAULT_LAYOUT}
                headerActions={
                  <Sheet open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 border-gray-200 hover:border-gray-300 shadow-card" id="open-widget-library">
                        <PlusCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('Library.openButton')}</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="rounded-l-2xl border-l-0 shadow-elevated">
                      <SheetHeader>
                        <SheetTitle className="text-lg font-bold">{t('Library.title')}</SheetTitle>
                        <SheetDescription className="text-sm">
                          {t('Library.description')}
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-5 space-y-3 h-[calc(100vh-140px)] overflow-y-auto pr-2 pb-4 scrollbar-hide">
                        {WIDGET_IDS.filter(w => w.id !== 'referralWidget').map(widget => {
                          const isActive = layout.includes(widget.id);
                          return (
                            <div
                              key={widget.id}
                              className={`flex items-center justify-between p-3 border rounded-xl transition-all duration-200 ${
                                isActive ? 'bg-primary/5 border-primary/20' : 'bg-white border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <div>
                                <h4 className="font-semibold text-sm text-gray-900">{t(`Widgets.${widget.id}`)}</h4>
                                <span className="text-xs text-gray-500">{t(`Widgets.categories.${widget.category}`)}</span>
                              </div>
                              <Button
                                variant={isActive ? "secondary" : "default"}
                                size="sm"
                                onClick={() => handleAddWidget(widget.id)}
                                className="text-xs h-8"
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
              <div className="flex items-center justify-center h-48 sm:h-64">
                <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            )}

            <div className="mt-6 sm:mt-8">
              <RecentActivity />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}