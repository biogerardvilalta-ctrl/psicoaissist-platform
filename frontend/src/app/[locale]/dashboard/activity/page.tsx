'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuditAPI, AuditLog } from '@/lib/audit-api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Clock, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ActivityLogPage() {
    const tCommon = useTranslations('Common');
    const router = useRouter();
    const { toast } = useToast();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await AuditAPI.getAll(50);
                setLogs(response.items);
            } catch (error) {
                console.error(error);
                toast({
                    title: tCommon('error'),
                    description: 'No se pudo cargar el historial de actividad.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, [toast]);

    const getActionColor = (action: string) => {
        if (action.includes('DELETE')) return 'text-rose-600 bg-rose-50 border-rose-200';
        if (action.includes('CREATE')) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (action.includes('UPDATE')) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-primary bg-primary/10 border-primary/20';
    };

    return (
        <ProtectedRoute requiredRole="PSYCHOLOGIST">
            <div className="min-h-screen bg-gray-50 pb-12">
                <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-8">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Registro de Actividad</h1>
                            <p className="text-slate-500">Historial completo de acciones en la cuenta</p>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5 text-gray-500" />
                                Últimas 50 acciones
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
                                    ))}
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    No hay actividad registrada.
                                </div>
                            ) : (
                                <div className="relative border-l border-slate-200 ml-3 space-y-6">
                                    {logs.map((log) => (
                                        <div key={log.id} className="ml-6 relative">
                                            <span className={`absolute -left-[30px] top-1 h-3 w-3 rounded-full border-2 border-white ${log.isSuccess ? 'bg-primary' : 'bg-rose-500'}`} />

                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className={getActionColor(log.action)}>
                                                            {log.action}
                                                        </Badge>
                                                        <span className="text-xs font-mono text-slate-400">
                                                            {log.resourceType}
                                                        </span>
                                                        {!log.isSuccess && (
                                                            <Badge variant="destructive" className="h-5 text-[10px]">FALLIDO</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-800">
                                                        {log.metadata?.details || `Acción sobre ${log.resourceType}`}
                                                    </p>
                                                    <div className="text-xs text-slate-500 mt-1 flex gap-3">
                                                        <span>
                                                            {format(new Date(log.createdAt), "PPP 'a las' p", { locale: es })}
                                                        </span>
                                                        <span>•</span>
                                                        <span>IP: {log.metadata?.ip || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </ProtectedRoute>
    );
}
