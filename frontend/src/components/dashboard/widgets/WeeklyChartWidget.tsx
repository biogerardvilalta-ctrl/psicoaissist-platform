import { CalendarDays } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function WeeklyChartWidget({ data }: { data: any[] }) {
    const router = useRouter();
    const t = useTranslations('Dashboard.Overview.Charts');

    return (
        <div
            onClick={() => router.push('/dashboard/statistics?tab=overview')}
            className="bg-white rounded-xl border p-6 h-full flex flex-col cursor-pointer hover:shadow-md transition-shadow"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">{t('weeklyLoad')}</h3>
                    <p className="text-sm text-slate-500">{t('sessionsRange')}</p>
                </div>
                <CalendarDays className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex-1 w-full min-h-[200px]">
                {data ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="day" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis hide domain={[0, 'auto']} />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar
                                dataKey="count"
                                fill="#8b5cf6"
                                radius={[4, 4, 0, 0]}
                                barSize={20}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                        Cargando...
                    </div>
                )}
            </div>
        </div>
    );
}
