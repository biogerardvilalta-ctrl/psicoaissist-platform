'use client';

import { useEffect, useState } from 'react';
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
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';

import { useSearchParams, useRouter } from 'next/navigation';
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

    const [activeTab, setActiveTab] = useState('overview');
    const [selectedMetric, setSelectedMetric] = useState('sessions'); // State for interactive chart

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [advancedStats, setAdvancedStats] = useState<AdvancedStats | null>(null);
    const [dashboardStats, setDashboardStats] = useState<any | null>(null); // Backend stats
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
                    DashboardAPI.getStats(clientId || undefined)
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

                // Internal calc for basic charts
                const calculated = calculateDashboardStats(filteredSessions, clients);
                setStats(calculated);

                // Advanced calc (defaulting to 60€/h here, or we could fetch config)
                const adv = calculateAdvancedStats(filteredSessions, 60);
                setAdvancedStats(adv);

            } catch (error) {
                console.error("Error loading stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [clientId]);

    const handleClientChange = (value: string) => {
        if (value === 'global') {
            router.push('/dashboard/statistics');
        } else {
            router.push(`/dashboard/statistics?clientId=${value}`);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Carregant dades analítiques...</div>;
    }

    if (!stats || !advancedStats) return null;

    // Helper to render dynamic chart based on selection
    const renderMainChart = () => {
        let title = "Evolución de Sesiones";
        let description = "Volulmen de sesiones en los últimos 6 meses";
        let data = stats.sessionsByMonth;
        let color = "#3b82f6"; // Blue
        let yUnit = "";

        switch (selectedMetric) {
            case 'sessions':
                title = "Evolución de Sesiones";
                data = stats.sessionsByMonth;
                color = "#3b82f6";
                break;
            case 'income':
                title = "Tendencia de Ingresos";
                description = "Ingresos estimados según tarifa base";
                data = stats.incomeByMonth || [];
                color = "#10b981"; // Emerald
                yUnit = "€";
                break;
            case 'patients':
                title = "Nuevos Pacientes";
                description = "Pacientes añadidos por mes";
                data = stats.patientsByMonth || [];
                color = "#6366f1"; // Indigo
                break;
            case 'attendance':
                title = "Tasa de Asistencia";
                description = "Porcentaje de citas completadas";
                data = stats.attendanceByMonth || [];
                color = "#22c55e"; // Green
                yUnit = "%";
                break;
            case 'cancellation':
                title = "Tasa de Cancelación";
                description = "Porcentaje de citas canceladas";
                data = stats.cancellationByMonth || [];
                color = "#ef4444"; // Red
                yUnit = "%";
                break;
            default:
                break;
        }

        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis unit={yUnit} />
                            <Tooltip />
                            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
                        </BarChart>
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
                        {clientName ? `Analítica: ${clientName}` : 'Analítica Global'}
                    </h1>
                    <p className="text-slate-500">Explora métricas detalladas y tendencias.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Select onValueChange={handleClientChange} value={clientId || 'global'}>
                        <SelectTrigger className="w-[280px] bg-white">
                            <SelectValue placeholder="Seleccionar vista..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="global">Vista Global (Tots els pacients)</SelectItem>
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
                            {clientName ? "Expedient Clínic Confidencial" : "Privacitat i Ús Clínic"}
                        </AlertTitle>
                        <AlertDescription className={`${clientName ? "text-amber-700" : "text-blue-700"} text-sm`}>
                            {clientName
                                ? "Aquestes dades formen part de la història clínica del pacient i estan protegides per secret professional. Ús exclusiu per al diagnòstic i seguiment terapèutic."
                                : "Dades agregades i anonimitzades. Aquesta eina ofereix suport estadístic per a la gestió de la consulta. No conté dades personals identificables en aquesta vista."
                            }
                        </AlertDescription>
                    </Alert>

                    {/* TAB: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <p className="text-sm text-muted-foreground italic">Haz clic en una tarjeta para ver su evolución.</p>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <StatsCard
                                    title="Sesiones (Mes)"
                                    value={advancedStats.sessionsThisMonth.toString()}
                                    icon={BarChart3}
                                    iconBgColor="bg-blue-100"
                                    iconColor="text-blue-600"
                                    subtitle="Total Realizadas"
                                    trend={{ value: "Total", isPositive: true }}
                                    onClick={() => setSelectedMetric('sessions')}
                                    isSelected={selectedMetric === 'sessions'}
                                />
                                <StatsCard
                                    title="Ingresos (Est)"
                                    value={`${advancedStats.monthIncome}€`}
                                    icon={Euro}
                                    iconBgColor="bg-emerald-100"
                                    iconColor="text-emerald-600"
                                    subtitle="Este Mes"
                                    trend={{ value: "Estimado", isPositive: true }}
                                    onClick={() => setSelectedMetric('income')}
                                    isSelected={selectedMetric === 'income'}
                                />
                                <StatsCard
                                    title="Pacientes Activos"
                                    value={stats.activePatients.toString()}
                                    icon={Users}
                                    iconBgColor="bg-indigo-100"
                                    iconColor="text-indigo-600"
                                    subtitle="Total"
                                    trend={stats.clientTrend}
                                    onClick={() => setSelectedMetric('patients')}
                                    isSelected={selectedMetric === 'patients'}
                                />
                                <StatsCard
                                    title="Agenda (7d)"
                                    value={advancedStats.sessionsNextWeek.toString()}
                                    icon={Calendar}
                                    iconBgColor="bg-purple-100"
                                    iconColor="text-purple-600"
                                    subtitle="Próxima Semana"
                                    trend={{ value: "Vista", isPositive: true }}
                                    // Clicking agenda could technically just show sessions, or stay neutral
                                    onClick={() => setSelectedMetric('sessions')}
                                // Not highlighted specifically to avoid confusion, or map to sessions
                                />

                                <StatsCard
                                    title="Tasa de Asistencia"
                                    value={advancedStats.attendanceRate > 0 ? `${advancedStats.attendanceRate}%` : "-"}
                                    icon={CheckCircle}
                                    iconBgColor="bg-green-100"
                                    iconColor="text-green-600"
                                    subtitle="Global"
                                    trend={{ value: "Calidad", isPositive: true }}
                                    onClick={() => setSelectedMetric('attendance')}
                                    isSelected={selectedMetric === 'attendance'}
                                />
                                <StatsCard
                                    title="Tasa de Cancelación"
                                    value={`${advancedStats.cancellationRate}%`}
                                    icon={XCircle}
                                    iconBgColor="bg-red-100"
                                    iconColor="text-red-600"
                                    subtitle="Global"
                                    trend={{ value: "Riesgo", isPositive: advancedStats.cancellationRate < 10 }}
                                    onClick={() => setSelectedMetric('cancellation')}
                                    isSelected={selectedMetric === 'cancellation'}
                                />
                            </div>

                            {/* DYNAMIC MAIN CHART */}
                            {renderMainChart()}
                        </div>
                    )}

                    {/* TAB: CLINICAL */}
                    {activeTab === 'clinical' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold">Detalle Clínico Avanzado</h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                <ProgressChart
                                    title="Sesiones por Tipo"
                                    totalValue={dashboardStats?.totalSessions || 0}
                                    trend={dashboardStats?.sessionTrend}
                                    data={dashboardStats?.sessionTypes || []}
                                />
                                <ProgressChart
                                    title="Pruebas Realizadas"
                                    totalValue={dashboardStats?.tests?.reduce((acc: number, t: any) => acc + t.value, 0) || 0}
                                    trend={{ value: "IA sugeridas", isPositive: true }}
                                    data={dashboardStats?.tests || []}
                                />
                                <ProgressChart
                                    title="Técnicas Terapéuticas"
                                    totalValue={dashboardStats?.techniques?.reduce((acc: number, t: any) => acc + t.value, 0) || 0}
                                    trend={{ value: "detectadas", isPositive: true }}
                                    data={dashboardStats?.techniques || []}
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB: PATIENTS */}
                    {activeTab === 'patients' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold">Métricas de Paciente</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <StatsCard
                                    title="Tasa de Asistencia"
                                    value={`${advancedStats.attendanceRate}%`}
                                    icon={CheckCircle}
                                    iconBgColor="bg-green-100"
                                    iconColor="text-green-600"
                                    subtitle="Completadas vs Programadas"
                                    trend={{ value: "Calidad", isPositive: true }}
                                />
                                <StatsCard
                                    title="Tasa de Cancelación"
                                    value={`${advancedStats.cancellationRate}%`}
                                    icon={XCircle}
                                    iconBgColor="bg-red-100"
                                    iconColor="text-red-600"
                                    subtitle="Canceladas + No Show"
                                    trend={{ value: "Riesgo", isPositive: advancedStats.cancellationRate < 10 }}
                                />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Adherence Trend Chart */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Evolución de Asistencia</CardTitle>
                                        <CardDescription>Porcentaje de sesiones completadas</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={stats.attendanceByMonth || []}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis domain={[0, 100]} unit="%" />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} activeDot={{ r: 8 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Cancellation Trend Chart */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Evolución Tasa de Cancelación</CardTitle>
                                        <CardDescription>Porcentaje de sesiones canceladas</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={stats.cancellationByMonth || []}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis domain={[0, 100]} unit="%" />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 8 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* TAB: THEMES */}
                    {activeTab === 'themes' && (
                        <div className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Temas Prevalents</CardTitle>
                                        <CardDescription>Motius de consulta freqüents (IA)</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stats.topThemes}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }: any) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                                                    outerRadius={80}
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
                                        <CardTitle>Tendència de Benestar</CardTitle>
                                        <CardDescription>Sentiment positiu (IA)</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={stats.sentimentTrend}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="sessionDate" />
                                                <YAxis domain={[0, 10]} />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="sentiment" stroke="#10b981" strokeWidth={2} />
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
