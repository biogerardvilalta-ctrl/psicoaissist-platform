'use client';

import { TrendingUp, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AdminAPI } from '@/lib/admin-api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueData {
    label: string;
    totalRevenue: number;
    newRevenue: number;
    totalSubscriptions: number;
    newSubscriptions: number;
    totalCancelled: number;
    newCancelled: number;
    totalAll: number;
    newAll: number;
}

const PERIODS = [
    { id: '1w', label: '1 Semana' },
    { id: '1m', label: '1 Mes' },
    { id: '3m', label: '3 Meses' },
    { id: '6m', label: '6 Meses' },
    { id: '1y', label: '1 Año' },
] as const;

type PeriodType = typeof PERIODS[number]['id'];

export default function EvolutionCharts() {
    const [period, setPeriod] = useState<PeriodType>('1m');
    const [viewMode, setViewMode] = useState<'incremental' | 'cumulative'>('incremental');
    const [data, setData] = useState<RevenueData[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch when period changes
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const newData = await AdminAPI.getEvolutionStats(period);
                setData(newData);
            } catch (error) {
                console.error('Error loading chart data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [period]);

    // Determine keys based on mode
    const revenueKey = viewMode === 'cumulative' ? 'totalRevenue' : 'newRevenue';
    const subsKey = viewMode === 'cumulative' ? 'totalSubscriptions' : 'newSubscriptions';

    const displayRevenue = viewMode === 'cumulative'
        ? (data.length > 0 ? data[data.length - 1].totalRevenue : 0) // Current MRR
        : data.reduce((sum, d) => sum + d.newRevenue, 0); // Total New Revenue in period

    const displaySubs = viewMode === 'cumulative'
        ? (data.length > 0 ? data[data.length - 1].totalSubscriptions : 0)
        : data.reduce((sum, d) => sum + d.newSubscriptions, 0);

    // Calculate Growth
    const getGrowth = () => {
        if (data.length < 2) return 0;
        const current = data[data.length - 1][revenueKey];
        const prev = data[data.length - 2][revenueKey];
        if (prev === 0) return current > 0 ? 100 : 0;
        return ((current - prev) / prev) * 100;
    };

    const growth = getGrowth();

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded shadow-lg">
                    <p className="text-gray-700 font-medium mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            {viewMode === 'cumulative' ? 'Total ' : 'Nuevos '}
                            {entry.name}: {entry.name === 'Ingresos' ? `€${entry.value}` : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-semibold text-gray-900">Evolución Histórica</h2>
                    {/* View Mode Toggle */}
                    <div className="bg-gray-100 p-1 rounded-lg flex text-sm">
                        <button
                            onClick={() => setViewMode('incremental')}
                            className={`px-3 py-1 rounded-md transition-all ${viewMode === 'incremental' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Por Periodo
                        </button>
                        <button
                            onClick={() => setViewMode('cumulative')}
                            className={`px-3 py-1 rounded-md transition-all ${viewMode === 'cumulative' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Acumulado
                        </button>
                    </div>
                </div>

                {/* Period Filters */}
                <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-full">
                    {PERIODS.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setPeriod(p.id)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${period === p.id
                                ? 'bg-white text-blue-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Ingresos {viewMode === 'cumulative' ? '(MRR Activo)' : '(Nuevos)'}</h3>
                            <div className="flex items-baseline space-x-2 mt-1">
                                <span className="text-2xl font-bold text-gray-900">€{displayRevenue}</span>
                                <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {growth > 0 ? '+' : ''}{growth.toFixed(1)}% vs anterior
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[250px] w-full relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        )}
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 11 }}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 11 }}
                                    tickFormatter={(value) => `€${value}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey={revenueKey}
                                    name="Ingresos"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    strokeWidth={2}
                                    animationDuration={500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subscriptions Chart */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Suscripciones {viewMode === 'cumulative' ? '(Activas)' : '(Nuevas)'}</h3>
                            <div className="flex items-baseline space-x-2 mt-1">
                                <span className="text-2xl font-bold text-gray-900">{displaySubs}</span>
                                <span className="text-sm text-gray-500">{viewMode === 'cumulative' ? 'Total Activas' : 'Total en periodo'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[250px] w-full relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        )}
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 11 }}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 11 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey={viewMode === 'cumulative' ? 'totalAll' : 'newAll'}
                                    name="Total"
                                    stroke="#6b7280"
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                    strokeWidth={2}
                                    strokeDasharray="4 4"
                                    animationDuration={500}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={subsKey}
                                    name="Activas"
                                    stroke="#8b5cf6"
                                    fillOpacity={1}
                                    fill="url(#colorSubs)"
                                    strokeWidth={2}
                                    animationDuration={500}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={viewMode === 'cumulative' ? 'totalCancelled' : 'newCancelled'}
                                    name="Inactivas/Eliminadas"
                                    stroke="#ef4444"
                                    fillOpacity={1}
                                    fill="url(#colorCancelled)"
                                    strokeWidth={2}
                                    animationDuration={500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
