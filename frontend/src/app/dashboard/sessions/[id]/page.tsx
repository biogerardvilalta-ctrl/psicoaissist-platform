'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Clock, User, Calendar, Play, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { SessionsAPI, Session, SessionStatus } from '@/lib/sessions-api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function SessionDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const [session, setSession] = useState<Session | null>(null);
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [timer, setTimer] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        loadSession();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Timer logic for IN_PROGRESS sessions
    useEffect(() => {
        if (session?.status === SessionStatus.IN_PROGRESS) {
            timerRef.current = setInterval(() => {
                const start = new Date(session.startTime).getTime();
                const now = new Date().getTime();
                setTimer(Math.floor((now - start) / 1000));
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, [session?.status]);

    const loadSession = async () => {
        try {
            const data = await SessionsAPI.getById(params.id);
            setSession(data);
            setNotes(data.notes || '');

            // Initial timer set if already correct status
            if (data.status === SessionStatus.IN_PROGRESS) {
                const start = new Date(data.startTime).getTime();
                const now = new Date().getTime();
                setTimer(Math.floor((now - start) / 1000));
            }

        } catch (error) {
            console.error('Error loading session:', error);
            toast({
                title: "Error",
                description: "No se pudo cargar la sesión.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // ... (inside loadSession after setSession)
    // setLastSaved(new Date(data.updatedAt)); // Optional

    const handleSaveNotes = async () => {
        if (!session) return;
        setIsSaving(true);
        try {
            await SessionsAPI.update(session.id, { notes });
            toast({ title: "Notas guardadas" });
            setSession({ ...session, notes });
            setLastSaved(new Date());
        } catch (error) {
            toast({
                title: "Error al guardar",
                description: "No se pudieron guardar las notas.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusChange = async (newStatus: SessionStatus) => {
        if (!session) return;
        try {
            toast({ title: "Procesando...", description: "Actualizando estado de la sesión." });
            console.log("Changing status to:", newStatus);

            const payload: any = { status: newStatus };

            // If starting session, reset start time to now so timer starts at 0
            if (newStatus === SessionStatus.IN_PROGRESS) {
                payload.startTime = new Date().toISOString();
            }

            const updated = await SessionsAPI.update(session.id, payload);
            console.log("Updated session:", updated);

            setSession(updated);

            toast({
                title: "Estado actualizado",
                description: `La sesión está ${updated.status === SessionStatus.IN_PROGRESS ? 'en curso' : 'completada'}.`,
            });

            if (updated.status === SessionStatus.COMPLETED) {
                toast({ title: "Sesión Finalizada", description: "Redirigiendo al listado..." });
                setTimeout(() => {
                    router.push('/dashboard/sessions');
                }, 1000);
            }
        } catch (error) {
            console.error("Error changing status:", error);
            toast({ title: "Error", variant: "destructive", description: "No se pudo cambiar el estado. Revisa la consola." });
        }
    };

    const formatTimer = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (isLoading) return <div className="p-6">Cargando sesión...</div>;
    if (!session) return <div className="p-6">Sesión no encontrada</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Sesión con {session.clientName || "Paciente"}
                            <Badge variant={session.status === SessionStatus.IN_PROGRESS ? "default" : "secondary"}>
                                {session.status}
                            </Badge>
                        </h1>
                        <div className="text-muted-foreground flex items-center gap-4 text-sm mt-1">
                            <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {format(new Date(session.startTime), "PPP", { locale: es })}</span>
                            <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {format(new Date(session.startTime), "HH:mm")}</span>
                            <span className="flex items-center capitalize"><User className="w-3 h-3 mr-1" /> {session.sessionType.toLowerCase()}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {session.status === SessionStatus.SCHEDULED && (
                        <Button onClick={() => handleStatusChange(SessionStatus.IN_PROGRESS)} className="bg-green-600 hover:bg-green-700">
                            <Play className="mr-2 h-4 w-4" /> Iniciar Sesión
                        </Button>
                    )}

                    {session.status === SessionStatus.IN_PROGRESS && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                                    <CheckCircle className="mr-2 h-4 w-4" /> Finalizar
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Finalizar sesión?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Se marcará la sesión como completada y se detendrá el cronómetro. Asegúrate de haber guardado tus notas.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleStatusChange(SessionStatus.COMPLETED)}>
                                        Finalizar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}

                    {session.status === SessionStatus.SCHEDULED && (
                        <Button variant="destructive" onClick={() => handleStatusChange(SessionStatus.CANCELLED)}>
                            <XCircle className="mr-2 h-4 w-4" /> Cancelar
                        </Button>
                    )}
                </div>
            </div>

            {/* Timer Banner */}
            {session.status === SessionStatus.IN_PROGRESS && (
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center text-green-800 font-medium">
                            <span className="relative flex h-3 w-3 mr-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            Sesión en curso
                        </div>
                        <div className="text-2xl font-mono font-bold text-green-900">
                            {formatTimer(timer)}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Notes Column (Main) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="h-[600px] flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-medium">Notas Clínicas</CardTitle>
                            <div className="text-xs text-muted-foreground">
                                {isSaving ? "Guardando..." : lastSaved ? `Guardado a las ${format(lastSaved, "HH:mm:ss")}` : "Cambios no guardados"}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Escribe las notas de la sesión aquí..."
                                className="h-full w-full resize-none border-0 focus-visible:ring-0 p-4 text-base leading-relaxed"
                            />
                        </CardContent>
                        <CardFooter className="border-t p-4 flex justify-between bg-gray-50/50">
                            <div className="text-xs text-muted-foreground w-1/2">
                                Las notas se cifran automáticamente.
                            </div>
                            <Button onClick={handleSaveNotes} disabled={isSaving} size="sm">
                                <Save className="mr-2 h-4 w-4" /> Guardar Notas
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Información del Paciente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Placeholder for Client/Patient Info */}
                            {/* In a real app, I'd fetch client details here */}
                            <div className="flex items-center space-x-4">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-700 font-bold text-lg">
                                        {session.clientName ? session.clientName[0] : "P"}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium leading-none">{session.clientName}</p>
                                    <p className="text-xs text-muted-foreground mt-1">ID: {session.clientId.slice(0, 8)}...</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Diagnóstico:</span>
                                    <span className="font-medium">N/A</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Riesgo:</span>
                                    <Badge variant="outline" className="text-xs">Bajo</Badge>
                                </div>
                            </div>

                            <Button variant="outline" className="w-full text-xs" onClick={() => window.open(`/dashboard/clients`, '_blank')}>
                                Ver Expediente Completo
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Recursos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="ghost" className="w-full justify-start h-8 px-2">
                                <span className="mr-2">📄</span> Plantilla SOAP
                            </Button>
                            <Button variant="ghost" className="w-full justify-start h-8 px-2">
                                <span className="mr-2">📝</span> Plantilla de Evaluación
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
