'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, User, Trophy, Activity } from 'lucide-react';

interface Report {
    id: string;
    createdAt: string;
    patientName: string;
    difficulty: string;
    empathyScore: number;
    effectivenessScore: number;
    professionalismScore: number;
}

interface ReportsHistoryProps {
    reports: Report[];
}

export function ReportsHistory({ reports }: ReportsHistoryProps) {
    if (!reports || reports.length === 0) {
        return (
            <div className="text-center py-10 text-gray-400">
                No hay informes guardados todavía. Completa una simulación para empezar.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="w-3 h-3 mr-1" />
                                {format(new Date(report.createdAt), "d MMM yyyy", { locale: es })}
                            </div>
                            <Badge variant={report.difficulty === 'hard' ? 'destructive' : 'secondary'} className="capitalize text-xs">
                                {report.difficulty}
                            </Badge>
                        </div>

                        <h3 className="font-bold flex items-center gap-2 text-gray-900 mb-4">
                            <User className="w-4 h-4 text-gray-400" />
                            {report.patientName}
                        </h3>

                        <div className="flex justify-between items-center text-sm">
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-gray-500 mb-1">Empatía</span>
                                <span className={`font-bold ${report.empathyScore >= 70 ? 'text-green-600' : 'text-orange-500'}`}>
                                    {report.empathyScore}%
                                </span>
                            </div>
                            <div className="w-px h-8 bg-gray-100" />
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-gray-500 mb-1">Eficacia</span>
                                <span className="font-bold text-gray-700">{report.effectivenessScore}%</span>
                            </div>
                            <div className="w-px h-8 bg-gray-100" />
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-gray-500 mb-1">Prof.</span>
                                <span className="font-bold text-gray-700">{report.professionalismScore}%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
