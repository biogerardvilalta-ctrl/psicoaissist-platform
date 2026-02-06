'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { SessionsAPI } from '@/lib/sessions-api';
import { ClientsAPI, Client } from '@/lib/clients-api';
import { DashboardAPI } from '@/lib/dashboard-api';
import { calculateDashboardStats, DashboardStats, calculateAdvancedStats, AdvancedStats } from '@/lib/analytics-helper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, BarChart3, TrendingUp, Users, Activity, X, LayoutDashboard, PieChart as PieChartIcon, CheckCircle, AlertCircle, XCircle, Euro, Calendar } from 'lucide-react';
import {
    BarChart,
    Bar,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    XAxis,
    YAxis,
    CartesianGrid,
    Cell
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { es, ca, enUS as en } from 'date-fns/locale';

import { useRouter, usePathname } from '@/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ProgressChart, StatsCard } from '@/components/dashboard';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const TABS = [
    { id: 'overview', label: 'Resumen General', icon: LayoutDashboard },
    { id: 'clinical', label: 'Detalle Clínico', icon: Activity },
    { id: 'patients', label: 'Pacientes y Adherencia', icon: Users },
    { id: 'themes', label: 'Temas y Tendencias', icon: PieChartIcon },
];

export default function StatisticsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const clientId = searchParams.get('clientId');
    const { user } = useAuth();
    const t = useTranslations('Dashboard.Statistics');
    const locale = useLocale();

    const TABS = [
        { id: 'overview', label: t('tabs.overview'), icon: LayoutDashboard },
        { id: 'clinical', label: t('tabs.clinical'), icon: Activity },
        { id: 'patients', label: t('tabs.patients'), icon: Users },
        { id: 'themes', label: t('tabs.themes'), icon: PieChartIcon },
    ];

    const [activeTab, setActiveTab] = useState('overview');
    const [selectedMetric, setSelectedMetric] = useState('sessions');

    // New State for Time Range
    const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('6m');

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [advancedStats, setAdvancedStats] = useState<AdvancedStats | null>(null);
    const [dashboardStats, setDashboardStats] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [clientName, setClientName] = useState<string | null>(null);
    const [allClients, setAllClients] = useState<Client[]>([]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        const metric = searchParams.get('metric');
        if (tab && TABS.find(t => t.id === tab)) {
            setActiveTab(tab);
        }
        if (metric) {
            setSelectedMetric(metric);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch basic data AND backend stats
                const [sessions, clients, backendStats] = await Promise.all([
                    SessionsAPI.getAll(),
                    ClientsAPI.getAll(),
                    DashboardAPI.getStats(undefined, undefined) // Fix: Don't pass clientId as startDate
                ]);

                setAllClients(clients);
                setDashboardStats(backendStats);

                let filteredSessions = sessions;

                if (clientId) {
                    filteredSessions = sessions.filter(s => s.clientId === clientId);
                    const client = clients.find(c => c.id === clientId);
                    if (client) {
                        setClientName(`${client.firstName} ${client.lastName}`);
                    }
                } else {
                    setClientName(null);
                }

                // Internal calc for basic charts - NOW WITH TIME RANGE
                const localeObj = locale === 'ca' ? ca : (locale === 'en' ? en : es);
                const calculated = calculateDashboardStats(filteredSessions, clients, user?.hourlyRate || 60, timeRange, localeObj);
                setStats(calculated);

                // Advanced calc (defaulting to 60€/h here, or we could fetch config)
                const adv = calculateAdvancedStats(filteredSessions, user?.hourlyRate || 60, localeObj);
                setAdvancedStats(adv);

            } catch (error) {
                console.error("Error loading stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [clientId, timeRange, user?.hourlyRate]); // Re-run when timeRange or user rate changes

    const handleClientChange = (value: string) => {
        if (value === 'global') {
            router.push('/dashboard/statistics');
        } else {
            router.push(`/dashboard/statistics?clientId=${value}`);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">{t('loading')}</div>;
    }

    if (!stats || !advancedStats) return null;

    // Helper to render dynamic chart based on selection
    const renderMainChart = () => {
        let title = t('charts.sessionsTitle');
        let description = t('charts.sessionsDesc');
        let data = stats.sessionsByMonth;
        let color = "#3b82f6"; // Blue
        let yUnit = "";

        switch (selectedMetric) {
            case 'sessions':
                title = t('charts.sessionsTitle');
                data = stats.sessionsByMonth;
                color = "#3b82f6";
                break;
            case 'income':
                title = t('charts.incomeTitle');
                description = t('charts.incomeDesc');
                data = stats.incomeByMonth || [];
                color = "#10b981"; // Emerald
                yUnit = "€";
                break;
            case 'patients':
                title = t('charts.patientsTitle');
                description = t('charts.patientsDesc');
                data = stats.patientsByMonth || [];
                color = "#6366f1"; // Indigo
                break;
            case 'attendance':
                title = t('charts.attendanceTitle');
                description = t('charts.attendanceDesc');
                data = stats.attendanceByMonth || [];
                color = "#22c55e"; // Green
                yUnit = "%";
                break;
            case 'cancellation':
                title = t('charts.cancellationTitle');
                description = t('charts.cancellationDesc');
                data = stats.cancellationByMonth || [];
                color = "#ef4444"; // Red
                yUnit = "%";
                break;
            default:
                break;
        }

        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    {/* Time Range Selector Moved Here */}
                    <div className="flex items-center gap-2">
                        <Select
                            value={timeRange}
                            onValueChange={(v: '1m' | '3m' | '6m' | '1y') => setTimeRange(v)}
                        >
                            <SelectTrigger className="w-[180px] h-9 text-sm">
                                <SelectValue placeholder={t('timeRange.label')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1m">{t('timeRange.1m')}</SelectItem>
                                <SelectItem value="3m">{t('timeRange.3m')}</SelectItem>
                                <SelectItem value="6m">{t('timeRange.6m')}</SelectItem>
                                <SelectItem value="1y">{t('timeRange.1y')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" padding={{ left: 10, right: 10 }} />
                            <YAxis unit={yUnit} />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                        {clientName ? t('titleClient', { clientName }) : t('title')}
                    </h1>
                    <p className="text-slate-500">{t('subtitle')}</p>
                </div>

                <div className="flex items-center gap-2">
                    <Select onValueChange={handleClientChange} value={clientId || 'global'}>
                        <SelectTrigger className="w-[280px] bg-white">
                            <SelectValue placeholder={t('selectView')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="global">{t('globalView')}</SelectItem>
                            {allClients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                    {client.firstName} {client.lastName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* MAIN LAYOUT: SIDEBAR + CONTENT */}
            <div className="flex flex-col md:flex-row gap-8">

                {/* SIDEBAR */}
                <aside className="w-full md:w-64 shrink-0">
                    <nav className="flex flex-col space-y-1">
                        {TABS.map((tab) => (
                            <Button
                                key={tab.id}
                                variant={activeTab === activeTab ? (activeTab === tab.id ? 'secondary' : 'ghost') : 'ghost'}
                                className={`justify-start gap-2 ${activeTab === tab.id ? 'bg-slate-100 font-semibold' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </Button>
                        ))}
                    </nav>
                </aside>

                {/* CONTENT AREA */}
                <main className="flex-1 space-y-6">

                    {/* LEGAL DISCLAIMER (Restored) */}
                    <Alert className={clientName ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"}>
                        <ShieldCheck className={`h-4 w-4 ${clientName ? "text-amber-600" : "text-blue-600"}`} />
                        <AlertTitle className={`${clientName ? "text-amber-800" : "text-blue-800"} font-semibold`}>
                            {clientName ? t('alert.clientTitle') : t('alert.globalTitle')}
                        </AlertTitle>
                        <AlertDescription className={`${clientName ? "text-amber-700" : "text-blue-700"} text-sm`}>
                            {clientName ? t('alert.clientDesc') : t('alert.globalDesc')}
                        </AlertDescription>
                    </Alert>

                    {/* TAB: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">

                            {/* BLOCK 1: ANALYTICS (Generates Chart) */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium text-slate-800">{t('overview.analyticsTitle')}</h3>
                                    <p className="text-sm text-muted-foreground">{t('overview.analyticsSubtitle')}</p>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <StatsCard
                                        title={t('metrics.sessions')}
                                        value={advancedStats.sessionsThisMonth.toString()}
                                        icon={BarChart3}
                                        iconBgColor="bg-blue-100"
                                        iconColor="text-blue-600"
                                        subtitle={t('metrics.sessionsSubtitle')}
                                        trend={{ value: `${t('metrics.sessionsTotal')} ${t('metrics.vsLastMonth')}`, isPositive: true }}
                                        onClick={() => setSelectedMetric('sessions')}
                                        isSelected={selectedMetric === 'sessions'}
                                    />
                                    <StatsCard
                                        title={t('metrics.income')}
                                        value={`${advancedStats.monthIncome}€`}
                                        icon={Euro}
                                        iconBgColor="bg-emerald-100"
                                        iconColor="text-emerald-600"
                                        subtitle={t('metrics.incomeSubtitle')}
                                        trend={{ value: `${t('metrics.incomeRate')} ${t('metrics.vsLastMonth')}`, isPositive: true }}
                                        onClick={() => setSelectedMetric('income')}
                                        isSelected={selectedMetric === 'income'}
                                    />
                                    <StatsCard
                                        title={t('metrics.patients')}
                                        value={stats.activePatients.toString()}
                                        icon={Users}
                                        iconBgColor="bg-indigo-100"
                                        iconColor="text-indigo-600"
                                        subtitle={t('metrics.patientsSubtitle')}
                                        trend={{
                                            value: `${t(stats.clientTrend?.value || 'metrics.stable')} ${t('metrics.vsLastMonth')}`,
                                            isPositive: stats.clientTrend?.isPositive ?? true
                                        }}
                                        onClick={() => setSelectedMetric('patients')}
                                        isSelected={selectedMetric === 'patients'}
                                    />
                                    {/* Stats Cards for Attendance and Cancellation removed as per request */}
                                </div>
                                {/* DYNAMIC MAIN CHART (Belongs to Block 1) */}
                                <div className="mt-6">
                                    {renderMainChart()}
                                </div>
                            </div>

                            {/* BLOCK 2: MANAGEMENT (Static/Operational) */}
                            <div className="space-y-4 pt-4 border-t">
                                <div>
                                    <h3 className="text-lg font-medium text-slate-800">{t('overview.managementTitle')}</h3>
                                    <p className="text-sm text-muted-foreground">{t('overview.managementSubtitle')}</p>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <StatsCard
                                        title={t('metrics.agenda')}
                                        value={advancedStats.sessionsNextWeek.toString()}
                                        icon={Calendar}
                                        iconBgColor="bg-purple-100"
                                        iconColor="text-purple-600"
                                        subtitle={t('metrics.agendaSubtitle')}
                                        trend={{ value: `${t('metrics.agendaView')}`, isPositive: true }}
                                    // No click action for chart
                                    />
                                    <StatsCard
                                        title={t('metrics.pendingNotes')}
                                        value={advancedStats.pendingNotes.toString()}
                                        icon={AlertCircle}
                                        iconBgColor="bg-orange-100"
                                        iconColor="text-orange-600"
                                        subtitle={t('metrics.pendingNotesSubtitle')}
                                        trend={{ value: t('metrics.pendingNotesTasks'), isPositive: false }}
                                    // No click action for chart
                                    />
                                </div>

                                {/* NEW: Weekly Load Chart - Full Width and Larger */}
                                <div className="mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg font-medium text-slate-800">{t('overview.weeklyLoadTitle')}</CardTitle>
                                            <CardDescription>{t('overview.weeklyLoadDesc')}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={advancedStats.weeklyLoad}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                                                    <YAxis hide domain={[0, 'auto']} />
                                                    <Tooltip
                                                        cursor={{ fill: 'transparent' }}
                                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    />
                                                    <Bar
                                                        dataKey="count"
                                                        fill="#8b5cf6"
                                                        radius={[4, 4, 0, 0]}
                                                        barSize={40}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: CLINICAL */}
                    {activeTab === 'clinical' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold">{t('clinical.title')}</h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                <ProgressChart
                                    title={t('clinical.sessionTypes')}
                                    totalValue={dashboardStats?.totalSessions || 0}
                                    trend={dashboardStats?.sessionTrend}
                                    data={dashboardStats?.sessionTypes || []}
                                />
                                <ProgressChart
                                    title={t('clinical.tests')}
                                    totalValue={dashboardStats?.tests?.reduce((acc: number, t: any) => acc + t.value, 0) || 0}
                                    trend={{ value: t('clinical.testsTrend'), isPositive: true }}
                                    data={dashboardStats?.tests || []}
                                />
                                <ProgressChart
                                    title={t('clinical.techniques')}
                                    totalValue={dashboardStats?.techniques?.reduce((acc: number, t: any) => acc + t.value, 0) || 0}
                                    trend={{ value: t('clinical.techniquesTrend'), isPositive: true }}
                                    data={dashboardStats?.techniques || []}
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB: PATIENTS */}
                    {activeTab === 'patients' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold">{t('patientsTab.title')}</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <StatsCard
                                    title={t('metrics.attendance')}
                                    value={`${advancedStats.attendanceRate}%`}
                                    icon={CheckCircle}
                                    iconBgColor="bg-green-100"
                                    iconColor="text-green-600"
                                    subtitle={t('metrics.attendanceSubtitle')}
                                    trend={{ value: t('metrics.attendanceQuality'), isPositive: true }}
                                    onClick={() => setSelectedMetric('attendance')}
                                    isSelected={selectedMetric !== 'cancellation'} // Default selection
                                />
                                <StatsCard
                                    title={t('metrics.cancellation')}
                                    value={`${advancedStats.cancellationRate}%`}
                                    icon={XCircle}
                                    iconBgColor="bg-red-100"
                                    iconColor="text-red-600"
                                    subtitle={t('metrics.cancellationSubtitle')}
                                    trend={{ value: t('metrics.cancellationRisk'), isPositive: advancedStats.cancellationRate < 10 }}
                                    onClick={() => setSelectedMetric('cancellation')}
                                    isSelected={selectedMetric === 'cancellation'}
                                />
                            </div>

                            <div className="grid gap-6 grid-cols-1">
                                {selectedMetric === 'cancellation' ? (
                                    /* Cancellation Trend Chart */
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle>{t('charts.cancellationEvolution')}</CardTitle>
                                                <CardDescription>{t('charts.cancellationEvolutionDesc')}</CardDescription>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Select
                                                    value={timeRange}
                                                    onValueChange={(v: '1m' | '3m' | '6m' | '1y') => setTimeRange(v)}
                                                >
                                                    <SelectTrigger className="w-[180px] h-9 text-sm">
                                                        <SelectValue placeholder={t('timeRange.label')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1m">{t('timeRange.1m')}</SelectItem>
                                                        <SelectItem value="3m">{t('timeRange.3m')}</SelectItem>
                                                        <SelectItem value="6m">{t('timeRange.6m')}</SelectItem>
                                                        <SelectItem value="1y">{t('timeRange.1y')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={stats.cancellationByMonth || []}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" padding={{ left: 10, right: 10 }} />
                                                    <YAxis domain={[0, 100]} unit="%" />
                                                    <Tooltip />
                                                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 8 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    /* Adherence Trend Chart (Default) */
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle>{t('charts.attendanceEvolution')}</CardTitle>
                                                <CardDescription>{t('charts.attendanceEvolutionDesc')}</CardDescription>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Select
                                                    value={timeRange}
                                                    onValueChange={(v: '1m' | '3m' | '6m' | '1y') => setTimeRange(v)}
                                                >
                                                    <SelectTrigger className="w-[180px] h-9 text-sm">
                                                        <SelectValue placeholder={t('timeRange.label')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1m">{t('timeRange.1m')}</SelectItem>
                                                        <SelectItem value="3m">{t('timeRange.3m')}</SelectItem>
                                                        <SelectItem value="6m">{t('timeRange.6m')}</SelectItem>
                                                        <SelectItem value="1y">{t('timeRange.1y')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={stats.attendanceByMonth || []}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" padding={{ left: 10, right: 10 }} />
                                                    <YAxis domain={[0, 100]} unit="%" />
                                                    <Tooltip />
                                                    <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} activeDot={{ r: 8 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: THEMES */}
                    {activeTab === 'themes' && (
                        <div className="space-y-6">
                            <div className="grid gap-6 grid-cols-1">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('themes.recurrentTitle')}</CardTitle>
                                        <CardDescription>
                                            {t('themes.recurrentDesc')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={dashboardStats?.topThemes || stats.topThemes}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }: any) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                                                    outerRadius={120}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {stats.topThemes.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('themes.wellbeingTitle')}</CardTitle>
                                        <CardDescription>
                                            {t('themes.wellbeingDesc')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={
                                                (clientId || !dashboardStats?.sentimentTrend)
                                                    ? (stats.sentimentTrend || []).map(item => ({
                                                        ...item,
                                                        // Map 'sentiment' (1-10) to value (0-100) and ensure key string consistency
                                                        value: (item.sentiment || 0) * 10,
                                                        date: item.sessionDate // Already formatted or passed, needs check
                                                    }))
                                                    : (dashboardStats.sentimentTrend || []).map((item: any) => ({
                                                        ...item,
                                                        date: format(parseISO(item.date), 'dd/MM'),
                                                        value: item.value // Already 0-100 from backend
                                                    }))
                                            }>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis domain={[0, 100]} />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} activeDot={{ r: 8 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}
