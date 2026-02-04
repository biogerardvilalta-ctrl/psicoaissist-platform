'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

interface ReportsHistoryProps {
    reports: Array<any>;
    onReportClick?: (report: any) => void;
}

export function ReportsHistory({ reports, onReportClick }: ReportsHistoryProps) {
    const t = useTranslations('Dashboard.Simulator.history');

    // We assume the dates are already in ISO format or valid date strings.
    // Handling date formatting client-side with native Intl or just displaying as is if needed, 
    // but the screenshot showed localized formats. We'll use native Date for now.

    if (reports.length === 0) {
        return (
            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                {t('emptyReports')}
            </div>
        );
    }

    return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
                <Card
                    key={report.id}
                    className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500"
                    onClick={() => onReportClick?.(report)}
                >
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-base font-semibold truncate pr-2" title={report.patientName}>
                                {report.patientName}
                            </CardTitle>
                            <Badge variant={
                                report.difficulty === 'hard' ? 'destructive' :
                                    report.difficulty === 'medium' ? 'default' : 'secondary'
                            } className="uppercase text-[10px]">
                                {report.difficulty === 'medium' ? t('badges.medium') : report.difficulty === 'hard' ? t('badges.hard') : t('badges.easy')}
                            </Badge>
                        </div>
                        <CardDescription className="text-xs">
                            {new Date(report.createdAt).toLocaleDateString()} - {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('charts.empathy')}</span>
                                <span className="font-medium text-blue-600">{report.empathyScore}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('charts.effectiveness')}</span>
                                <span className="font-medium text-green-600">{report.effectivenessScore}%</span>
                            </div>
                            {/* <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Profesionalidad</span>
                                <span className="font-medium text-purple-600">{report.professionalismScore}%</span>
                            </div> */}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
