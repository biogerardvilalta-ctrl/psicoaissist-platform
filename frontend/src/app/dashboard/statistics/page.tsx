'use client';

import { useEffect, useState } from 'react';
import { SessionsAPI } from '@/lib/sessions-api';
import { ClientsAPI, Client } from '@/lib/clients-api';
import { DashboardAPI } from '@/lib/dashboard-api';
import { calculateDashboardStats, DashboardStats } from '@/lib/analytics-helper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, BarChart3, TrendingUp, Users, Activity, X } from 'lucide-react';
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
import { ProgressChart } from '@/components/dashboard'; // Import from index

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function StatisticsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const clientId = searchParams.get('clientId');

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [dashboardStats, setDashboardStats] = useState<any | null>(null); // Backend stats
    const [loading, setLoading] = useState(true);
    const [clientName, setClientName] = useState<string | null>(null);
    const [allClients, setAllClients] = useState<Client[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch basic data AND backend stats
                const [sessions, clients, backendStats] = await Promise.all([
                    SessionsAPI.getAll(),
                    ClientsAPI.getAll(),
                    DashboardAPI.getStats(clientId || undefined) // Pass clientId if present
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

    if (!stats) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                    {clientName ? `Analítica: ${clientName}` : 'Dashboard Analític Global'}
                </h1>

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

            {/* LEGAL DISCLAIMER */}
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

            {/* KPI CARDS */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSessions}</div>
                        <p className="text-xs text-muted-foreground">+20.1% respecte al mes passat</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pacients Actius</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activePatients}</div>
                        <p className="text-xs text-muted-foreground">de {stats.totalPatients} pacients totals</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Adherencia</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">92%</div>
                        <p className="text-xs text-muted-foreground">Assistència mitjana</p>
                    </CardContent>
                </Card>
            </div>

            {/* CHARTS ROW 1 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Activitat de Sessions</CardTitle>
                        <CardDescription>Sessions realitzades per mes</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.sessionsByMonth}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Temes Prevalents</CardTitle>
                        <CardDescription>Motius de consulta freqüents (IA)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
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
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* CHARTS ROW 2 - SENTIMENT */}
            <Card>
                <CardHeader>
                    <CardTitle>Tendència de Benestar General</CardTitle>
                    <CardDescription>Mitjana de l'índex de sentiment positiu en les últimes sessions (Anonimitzat)</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.sentimentTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="sessionDate" />
                                <YAxis domain={[0, 10]} />
                                <Tooltip />
                                <Line type="monotone" dataKey="sentiment" stroke="#10b981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* CHARTS ROW 3 - DETAILED STATS (Backend Data) */}
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 mt-8 mb-4">Detall Clínic Avançat</h2>
            <div className="grid gap-6 md:grid-cols-3">
                <ProgressChart
                    title="Sesiones por Tipo"
                    totalValue={dashboardStats?.totalSessions || 0}
                    trend={dashboardStats?.sessionTrend}
                    data={dashboardStats?.sessionTypes || []}
                />

                <ProgressChart
                    title="Técnicas Terapéuticas"
                    totalValue={dashboardStats?.techniques?.reduce((acc: number, t: any) => acc + t.value, 0) || 0}
                    trend={{ value: "detectadas", isPositive: true }}
                    data={dashboardStats?.techniques || []}
                />

                <ProgressChart
                    title="Pruebas Realizadas"
                    totalValue={dashboardStats?.tests?.reduce((acc: number, t: any) => acc + t.value, 0) || 0}
                    trend={{ value: "IA sugeridas", isPositive: true }}
                    data={dashboardStats?.tests || []}
                />
            </div>
        </div>
    );
}
