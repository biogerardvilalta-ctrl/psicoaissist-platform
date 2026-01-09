import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { AdminAPI } from '@/lib/admin-api';
import { Loader2 } from 'lucide-react';

interface UsageData {
    label: string;
    totalMinutes: number;
    newMinutes: number;
    totalSimSessions: number;
    newSimSessions: number;
}

export function UsageEvolutionCharts() {
    const [period, setPeriod] = useState<'1w' | '1m' | '3m' | '6m' | '1y'>('1m');
    const [data, setData] = useState<UsageData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [period]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const stats = await AdminAPI.getUsageEvolutionStats(period);
            setData(stats);
            setError(null);
        } catch (err) {
            console.error('Failed to load usage evolution stats:', err);
            setError('Error al cargar datos de evolución de uso');
        } finally {
            setIsLoading(false);
        }
    };

    const formatYAxisMinutes = (minutes: number) => {
        if (minutes >= 60) {
            return `${(minutes / 60).toFixed(1)}h`;
        }
        return `${minutes}m`;
    };

    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Evolución de Uso</CardTitle>
                        <CardDescription>Minutos de transcripción y sesiones de simulador</CardDescription>
                    </div>
                    <Select
                        value={period}
                        onValueChange={(value: any) => setPeriod(value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Periodo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1w">Última semana</SelectItem>
                            <SelectItem value="1m">Último mes</SelectItem>
                            <SelectItem value="3m">Últimos 3 meses</SelectItem>
                            <SelectItem value="6m">Últimos 6 meses</SelectItem>
                            <SelectItem value="1y">Último año</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="incremental" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="incremental">Por Periodo</TabsTrigger>
                        <TabsTrigger value="cumulative">Acumulado</TabsTrigger>
                    </TabsList>

                    {isLoading ? (
                        <div className="flex h-[300px] items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : error ? (
                        <div className="flex h-[300px] items-center justify-center text-red-500">
                            {error}
                        </div>
                    ) : (
                        <>
                            <TabsContent value="incremental" className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="h-[300px] w-full">
                                        <p className="text-sm font-medium mb-2 text-center text-muted-foreground">Minutos Transcritos (Periodo)</p>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={data}>
                                                <defs>
                                                    <linearGradient id="colorMinutesInc" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis
                                                    dataKey="label"
                                                    className="text-xs"
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    className="text-xs"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={formatYAxisMinutes}
                                                />
                                                <Tooltip
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                                Minutos
                                                                            </span>
                                                                            <span className="font-bold text-muted-foreground">
                                                                                {payload[0].value}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="newMinutes"
                                                    stroke="#10b981"
                                                    fillOpacity={1}
                                                    fill="url(#colorMinutesInc)"
                                                    strokeWidth={2}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="h-[300px] w-full">
                                        <p className="text-sm font-medium mb-2 text-center text-muted-foreground">Sesiones Simulador (Periodo)</p>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={data}>
                                                <defs>
                                                    <linearGradient id="colorSimsInc" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis
                                                    dataKey="label"
                                                    className="text-xs"
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    className="text-xs"
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <Tooltip
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                                Sesiones
                                                                            </span>
                                                                            <span className="font-bold text-muted-foreground">
                                                                                {payload[0].value}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="newSimSessions"
                                                    stroke="#8b5cf6"
                                                    fillOpacity={1}
                                                    fill="url(#colorSimsInc)"
                                                    strokeWidth={2}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="cumulative" className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="h-[300px] w-full">
                                        <p className="text-sm font-medium mb-2 text-center text-muted-foreground">Minutos Transcritos (Acumulado)</p>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={data}>
                                                <defs>
                                                    <linearGradient id="colorMinutesCum" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis
                                                    dataKey="label"
                                                    className="text-xs"
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    className="text-xs"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={formatYAxisMinutes}
                                                />
                                                <Tooltip
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                                Minutos
                                                                            </span>
                                                                            <span className="font-bold text-muted-foreground">
                                                                                {payload[0].value}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="totalMinutes"
                                                    stroke="#10b981"
                                                    fillOpacity={1}
                                                    fill="url(#colorMinutesCum)"
                                                    strokeWidth={2}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="h-[300px] w-full">
                                        <p className="text-sm font-medium mb-2 text-center text-muted-foreground">Sesiones Simulador (Acumulado)</p>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={data}>
                                                <defs>
                                                    <linearGradient id="colorSimsCum" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis
                                                    dataKey="label"
                                                    className="text-xs"
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    className="text-xs"
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <Tooltip
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                                Sesiones
                                                                            </span>
                                                                            <span className="font-bold text-muted-foreground">
                                                                                {payload[0].value}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="totalSimSessions"
                                                    stroke="#8b5cf6"
                                                    fillOpacity={1}
                                                    fill="url(#colorSimsCum)"
                                                    strokeWidth={2}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </CardContent>
        </Card>
    );
}
