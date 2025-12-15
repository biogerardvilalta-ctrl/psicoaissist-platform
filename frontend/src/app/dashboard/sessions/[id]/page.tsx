'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    FileText,
    MoreVertical,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SessionsAPI, Session, SessionStatus } from '@/lib/sessions-api';
import { ClientsAPI, Client } from '@/lib/clients-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function SessionDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const [session, setSession] = useState<Session | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [notes, setNotes] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

    const fetchSession = async () => {
        try {
            setIsLoading(true);
            const data = await SessionsAPI.getById(params.id);
            setSession(data);
            setNotes(data.notes || '');

            if (data.clientId) {
                try {
                    const clientData = await ClientsAPI.getById(data.clientId);
                    setClient(clientData);
                } catch (clientError) {
                    console.error('Error fetching client details:', clientError);
                }
            }

        } catch (error) {
            console.error('Error fetching session:', error);
            toast({
                title: 'Error',
                description: 'No se pudo cargar la información de la sesión',
                variant: 'destructive',
            });
            router.push('/dashboard/sessions');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSession();
    }, [params.id]);

    // Timer effect for IN_PROGRESS sessions
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (session?.status === SessionStatus.IN_PROGRESS) {
            // For MVP, simple counter. In real app, diff from startTime or proper 'startedAt'
            setElapsedTime(0); // Reset or Calculate real elapsed time here if needed

            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [session?.status]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStatusChange = async (newStatus: SessionStatus) => {
        if (!session) return;
        try {
            await SessionsAPI.update(session.id, { status: newStatus });

            setSession(prev => prev ? { ...prev, status: newStatus } : null);

            toast({
                title: 'Estado actualizado',
                description: `La sesión ha sido marcada como ${newStatus === SessionStatus.COMPLETED ? 'completada' : newStatus === SessionStatus.IN_PROGRESS ? 'iniciada' : 'cancelada'}.`,
            });

            if (newStatus === SessionStatus.COMPLETED) {
                router.push('/dashboard/sessions');
            }

        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo actualizar el estado',
                variant: 'destructive',
            });
        }
    };

    const handleSaveNotes = async () => {
        if (!session) return;
        setIsSavingNotes(true);
        try {
            await SessionsAPI.update(session.id, { notes });
            const now = new Date();
            setLastSavedAt(now);
            toast({
                title: 'Notas guardadas',
                description: 'Las notas de la sesión se han guardado correctamente.',
            });
            setSession(prev => prev ? { ...prev, notes } : null);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudieron guardar las notas',
                variant: 'destructive',
            });
        } finally {
            setIsSavingNotes(false);
        }
    };

    const handleDelete = async () => {
        if (!session) return;
        if (!confirm('¿Estás seguro de que deseas eliminar permanentemente esta sesión?')) return;

        try {
            await SessionsAPI.delete(session.id);
            toast({
                title: 'Sesión eliminada',
                description: 'La sesión ha sido eliminada correctamente.',
            });
            router.push('/dashboard/sessions');
        } catch (error) {
            console.error('Error deleting session:', error);
            toast({
                title: 'Error',
                description: 'No se pudo eliminar la sesión',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Detalle de Sesión</h1>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(session.startTime), 'PPP', { locale: es })}
                            <span>•</span>
                            <Clock className="h-4 w-4" />
                            {format(new Date(session.startTime), 'p', { locale: es })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Timer Display if In Progress */}
                    {session.status === SessionStatus.IN_PROGRESS && (
                        <div className="mr-4 font-mono text-xl font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                            {formatTime(elapsedTime)}
                        </div>
                    )}

                    {session.status === SessionStatus.SCHEDULED && (
                        <>
                            <Button
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                onClick={() => handleStatusChange(SessionStatus.CANCELLED)}
                            >
                                <XCircle className="mr-2 h-4 w-4" /> Cancelar
                            </Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleStatusChange(SessionStatus.IN_PROGRESS)}
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Iniciar Sesión
                            </Button>
                        </>
                    )}

                    {session.status === SessionStatus.IN_PROGRESS && (
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusChange(SessionStatus.COMPLETED)}
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Finalizar Sesión
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 cursor-pointer"
                                onClick={handleDelete}
                            >
                                <div className="flex items-center">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Eliminar Sesión
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Información de la Sesión
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Tipo de Sesión</label>
                                <p className="text-lg font-medium">{session.sessionType}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Estado</label>
                                <div className="mt-1">
                                    <Badge
                                        variant={session.status === SessionStatus.COMPLETED ? 'default' : session.status === SessionStatus.IN_PROGRESS ? 'secondary' : 'outline'}
                                        className={session.status === SessionStatus.SCHEDULED ? 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200' : session.status === SessionStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800 animate-pulse' : ''}
                                    >
                                        {session.status === SessionStatus.IN_PROGRESS ? 'EN CURSO' : session.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-muted-foreground">Notas de la Sesión</label>
                                {(session.status === SessionStatus.IN_PROGRESS || session.status === SessionStatus.SCHEDULED) && (
                                    <div className="flex items-center gap-2">
                                        {lastSavedAt && (
                                            <span className="text-xs text-muted-foreground mr-2 flex items-center">
                                                <CheckCircle2 className="inline h-3 w-3 mr-1 text-green-600" />
                                                Guardado {format(lastSavedAt, 'p', { locale: es })}
                                            </span>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleSaveNotes}
                                            disabled={isSavingNotes}
                                        >
                                            {isSavingNotes ? 'Guardando...' : 'Guardar Notas'}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {(session.status === SessionStatus.IN_PROGRESS || session.status === SessionStatus.SCHEDULED) ? (
                                <textarea
                                    className="w-full min-h-[200px] p-4 bg-white rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                    placeholder="Escribe aquí las notas de la sesión..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            ) : (
                                <div className="p-4 bg-slate-50 rounded-lg text-sm leading-relaxed border whitespace-pre-wrap">
                                    {session.notes || "No hay notas registradas para esta sesión."}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Patient Sidebar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-purple-600" />
                            Paciente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {client ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 pb-4 border-b">
                                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                                        {client.firstName[0]}{client.lastName[0]}
                                    </div>
                                    <div>
                                        <p className="font-medium">{client.firstName} {client.lastName}</p>
                                        <p className="text-xs text-muted-foreground">Paciente Activo</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="truncate max-w-[120px]">{client.email || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Teléfono:</span>
                                        <span>{client.phone || '-'}</span>
                                    </div>
                                    <div className="pt-2">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                                        >
                                            Ver Expediente
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                {session.clientName ? (
                                    <p className="font-medium">{session.clientName}</p>
                                ) : (
                                    <p className="text-muted-foreground italic">Información del paciente no disponible.</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
