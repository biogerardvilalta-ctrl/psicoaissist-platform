import { Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function SentimentWidget({ data }: { data: any[] }) {
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
                    <h3 className="text-lg font-semibold text-slate-800">{t('sentimentWidget')}</h3>
                    <p className="text-sm text-slate-500">{t('sentimentWidget_subtitle')}</p>
                </div>
                <Activity className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex-1 w-full min-h-[200px]">
                {data && data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" hide />
                            <YAxis domain={[0, 100]} hide />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
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
