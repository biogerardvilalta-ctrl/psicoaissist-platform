import { PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ThemesWidget({ data }: { data: any[] }) {
    const router = useRouter();
    const t = useTranslations('Dashboard.Overview.Widgets');
    const tCommon = useTranslations('Dashboard.Common');

    return (
        <div
            onClick={() => router.push('/dashboard/statistics?tab=themes')}
            className="bg-white rounded-xl border p-6 h-full flex flex-col cursor-pointer hover:shadow-md transition-shadow"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">{t('themesWidget')}</h3>
                    <p className="text-sm text-slate-500">{t('themesWidget_subtitle')}</p>
                </div>
                <PieChartIcon className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex-1 w-full min-h-[200px]">
                {data && data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                wrapperStyle={{ zIndex: 1000, outline: 'none' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                        {tCommon('noDataSimple')}
                    </div>
                )}
            </div>
        </div>
    );
}
