'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EvolutionChartProps {
    data: Array<{ date: string; empathy: number; effectiveness: number }>;
}

export function EvolutionChart({ data }: EvolutionChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-gray-500">
                    No hay suficientes datos para mostrar la evolución.
                </CardContent>
            </Card>
        );
    }

    const formattedData = data.map(d => ({
        ...d,
        dateFormatted: format(new Date(d.date), 'dd/MM', { locale: es })
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Evolución de Habilidades</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formattedData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="dateFormatted" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis domain={[0, 100]} fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="empathy"
                                name="Empatía"
                                stroke="#2563eb"
                                strokeWidth={3}
                                dot={{ strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="effectiveness"
                                name="Eficacia"
                                stroke="#16a34a"
                                strokeWidth={3}
                                dot={{ strokeWidth: 2, r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
