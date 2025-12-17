'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    FileText,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Brain
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AudioRecorder } from '@/components/dashboard/sessions/audio-recorder';
import { AiAPI } from '@/lib/ai-api';
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
import { AiAssistantPanel } from '@/components/dashboard/sessions/ai-assistant-panel';
import { ConsentModal } from '@/components/dashboard/sessions/consent-modal';
import { Checkbox } from '@/components/ui/checkbox';

export default function SessionDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [session, setSession] = useState<Session | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [notes, setNotes] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);

    // Auto-start check effect
    useEffect(() => {
        const shouldStart = searchParams.get('start') === 'true';
        if (shouldStart && session && session.status === SessionStatus.SCHEDULED) {
            setIsConsentModalOpen(true);
            // Optional: clean up the query param to prevent re-triggering on refresh if desirable?
            // For now, leaving it is fine as it's a specific navigation action.
        }
    }, [searchParams, session]);

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

    const handleStatusChange = async (newStatus: SessionStatus, extraPayload: any = {}) => {
        if (!session) return;
        try {
            const payload: any = { status: newStatus, ...extraPayload };
            // Auto-save notes when completing session to ensure AI analysis has pending text
            if (newStatus === SessionStatus.COMPLETED) {
                payload.notes = notes;
            }
            const updatedSession = await SessionsAPI.update(session.id, payload);

            setSession(updatedSession);

            toast({
                title: 'Estado actualizado',
                description: `La sesión ha sido marcada como ${newStatus === SessionStatus.COMPLETED ? 'completada' : newStatus === SessionStatus.IN_PROGRESS ? 'iniciada' : 'cancelada'}.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo actualizar el estado',
                variant: 'destructive',
            });
        }
    };

    const handleStartSessionClick = () => {
        setIsConsentModalOpen(true);
    };

    const handleConsentConfirmed = async () => {
        setIsConsentModalOpen(false);
        await handleStatusChange(SessionStatus.IN_PROGRESS, {
            consentSigned: true,
            consentVersion: '1.0'
        });
    };

    const handleMinorChange = async (checked: boolean) => {
        if (!session) return;
        try {
            const updatedSession = await SessionsAPI.update(session.id, { isMinor: checked });
            setSession(updatedSession);
            toast({
                title: 'Configuración actualizada',
                description: `Modo menors d'edat ${checked ? 'activado' : 'desactivado'}.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo actualizar la configuración',
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
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
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
                                onClick={handleStartSessionClick}
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Info - Left Column */}
                <div className="lg:col-span-6 space-y-6">
                    {/* Client Info - Moved from Right Column */}
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

                    <Card>
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

                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                    id="isMinor"
                                    checked={session.isMinor || false}
                                    onCheckedChange={(checked) => handleMinorChange(checked as boolean)}
                                    disabled={session.status === SessionStatus.COMPLETED || session.status === SessionStatus.CANCELLED}
                                />
                                <label
                                    htmlFor="isMinor"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Pacient menor d'edat
                                </label>
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
                                        className="w-full min-h-[300px] p-4 bg-white rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                        placeholder="Escribe aquí las notas de la sesión..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                ) : (
                                    <div className="p-4 bg-slate-50 rounded-lg text-sm leading-relaxed border whitespace-pre-wrap min-h-[150px]">
                                        {session.notes || "No hay notas registradas para esta sesión."}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Analysis Section - Only if Completed */}
                    {
                        session.status === SessionStatus.COMPLETED && session.aiMetadata && (
                            <Card className="border-purple-100 bg-purple-50/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-purple-700">
                                        <Brain className="h-5 w-5" />
                                        Anàlisi de suport (IA)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* 1. Resum */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-900 mb-1">Resum</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed mb-2">{session.aiMetadata.summary}</p>
                                    </div>

                                    {/* 2. Elements Emocionals */}
                                    {(session.aiMetadata.emotionalElements?.length || 0) > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-blue-900 mb-2">Elements emocionals expressats</h4>
                                            <p className="text-xs text-slate-500 mb-2">Durant el relat apareixen expressions associades a:</p>
                                            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1 mb-2">
                                                {session.aiMetadata.emotionalElements?.map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                            <p className="text-[10px] text-slate-400 italic">
                                                Aquests elements es presenten de manera descriptiva i no constitueixen una valoració clínica.
                                            </p>
                                        </div>
                                    )}

                                    {/* 3. Indicadors Narratius */}
                                    {(session.aiMetadata.narrativeIndicators?.length || 0) > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-blue-900 mb-2">Indicadors narratius observats</h4>
                                            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1 mb-2">
                                                {session.aiMetadata.narrativeIndicators?.map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                            <p className="text-[10px] text-slate-400 italic">
                                                Aquests indicadors poden servir com a punts d’exploració segons el criteri professional.
                                            </p>
                                        </div>
                                    )}

                                    {/* 4. Observacions Orientatives */}
                                    {(session.aiMetadata.orientativeObservations?.length || 0) > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-blue-900 mb-2">Observacions orientatives (IA)</h4>
                                            <p className="text-xs text-slate-500 mb-2">Com a hipòtesis obertes i no concloents, alguns professionals podrien considerar rellevant explorar:</p>
                                            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                                                {session.aiMetadata.orientativeObservations?.map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* 5. Suport Seguiment */}
                                    {session.aiMetadata.clinicalFollowUpSupport && (
                                        <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm space-y-4">
                                            <h4 className="text-sm font-semibold text-purple-900">Suport per al seguiment clínic</h4>

                                            {(session.aiMetadata.clinicalFollowUpSupport.suggestions?.length || 0) > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-600 mb-1">Suggeriment orientatiu:</p>
                                                    <ul className="list-disc pl-5 text-sm text-slate-600">
                                                        {session.aiMetadata.clinicalFollowUpSupport.suggestions?.map((s, i) => <li key={i}>{s}</li>)}
                                                    </ul>
                                                </div>
                                            )}

                                            {(session.aiMetadata.clinicalFollowUpSupport.possibleLines?.length || 0) > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-600 mb-1">Línies de treball possibles:</p>
                                                    <ul className="list-disc pl-5 text-sm text-slate-600">
                                                        {session.aiMetadata.clinicalFollowUpSupport.possibleLines?.map((s, i) => <li key={i}>{s}</li>)}
                                                    </ul>
                                                </div>
                                            )}

                                            {(session.aiMetadata.clinicalFollowUpSupport.modelReferences?.length || 0) > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-600 mb-1">Referència a models terapèutics (no prescriptiu):</p>
                                                    <ul className="list-disc pl-5 text-sm text-slate-600">
                                                        {session.aiMetadata.clinicalFollowUpSupport.modelReferences?.map((s, i) => <li key={i}>{s}</li>)}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 6. Test Suggestions (Diagnostic Final) */}
                                    {session.aiMetadata.diagnostic_final && (
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-6 w-1 bg-blue-500 rounded-full"></div>
                                                <h4 className="text-sm font-bold text-slate-800">Suggeriment de tests (IA)</h4>
                                            </div>

                                            <p className="text-xs text-slate-600 italic mb-3">
                                                {session.aiMetadata.diagnostic_final.nota_general}
                                            </p>

                                            {session.aiMetadata.diagnostic_final.tests_sugerits_final?.suggeriments.map((sug, idx) => (
                                                <div key={idx} className="mb-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 border-slate-200">
                                                            Tema: {sug.tema}
                                                        </Badge>
                                                        <p className="text-xs font-bold text-blue-900">{sug.categoria}</p>
                                                    </div>

                                                    <div className="space-y-2 pl-2 border-l-2 border-blue-50">
                                                        {sug.tests.map((test, tIdx) => (
                                                            <div key={tIdx} className="bg-white p-2 rounded border border-slate-100 shadow-sm">
                                                                <div className="flex justify-between items-start">
                                                                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded mr-2">{test.codi}</span>
                                                                    <span className="text-xs font-semibold text-slate-800 flex-1">{test.nom}</span>
                                                                </div>
                                                                <p className="text-[10px] text-slate-500 mt-1 italic">{test.objectiu_general}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="mt-3 pt-3 border-t border-slate-200">
                                                <div className="flex flex-col gap-1 text-[10px] text-slate-400">
                                                    <span>Font: {session.aiMetadata.diagnostic_final.tests_sugerits_final?.regles?.font}</span>
                                                    <span>Criteri de selecció: {session.aiMetadata.diagnostic_final.tests_sugerits_final?.regles?.criteri_seleccio}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-purple-200">
                                        <p className="text-[10px] text-center text-slate-500 font-medium whitespace-pre-line">
                                            {session.aiMetadata.disclaimer || "Aquesta anàlisi no constitueix una valoració clínica, diagnòstica ni una avaluació de risc, i es basa exclusivament en el contingut verbalitzat durant la sessió."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    }
                </div>

                {/* Sidebar - Right Column - AI Panel & Tools */}
                <div className="lg:col-span-6 flex flex-col h-[calc(100vh-140px)] sticky top-6 gap-4">
                    {/* Audio Recorder - Only if In Progress */}
                    {session.status === SessionStatus.IN_PROGRESS && (
                        <AudioRecorder
                            onAudioData={async (blob) => {
                                // Final blob handler (optional if we stream)
                                console.log('Final recording blob size:', blob.size);
                            }}
                            onStreamData={async (chunk) => {
                                // Real-time transcription
                                try {
                                    const { text } = await AiAPI.transcribe(chunk);
                                    if (text) {
                                        setNotes(prev => {
                                            const newNotes = prev + (prev ? ' ' : '') + `${text}`;
                                            // Optional: trigger save or analysis here if needed
                                            return newNotes;
                                        });
                                    }
                                } catch (e) {
                                    console.error('Stream transcription error', e);
                                }
                            }}
                        />
                    )}

                    {/* AI Assistant Panel - Takes remaining space */}
                    <div className="flex-1 min-h-0">
                        <AiAssistantPanel
                            sessionId={session.id}
                            isActive={session.status === SessionStatus.IN_PROGRESS}
                            liveContext={notes} // Pass the accumulated notes (which include audio transcriptions)
                        />
                    </div>
                </div>
            </div>
            {/* Consent Modal */}
            <ConsentModal
                isOpen={isConsentModalOpen}
                onClose={() => setIsConsentModalOpen(false)}
                onConfirm={handleConsentConfirmed}
                clientName={client ? `${client.firstName} ${client.lastName}` : session.clientName || 'Paciente'}
            />
        </div>
    );
}
