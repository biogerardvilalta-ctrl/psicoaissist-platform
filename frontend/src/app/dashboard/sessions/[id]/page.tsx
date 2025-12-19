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
    DropdownMenuSeparator,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AiAssistantPanel } from '@/components/dashboard/sessions/ai-assistant-panel';
import { ConsentModal } from '@/components/dashboard/sessions/consent-modal';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

// ... (previous imports)
import { useSocket } from '@/hooks/use-socket';

export default function SessionDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [session, setSession] = useState<Session | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [notes, setNotes] = useState('');
    const [transcription, setTranscription] = useState('');
    const [methodology, setMethodology] = useState('');

    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('transcription');
    const [isEditing, setIsEditing] = useState(false);

    // START: WebSocket Integration
    // Connect to 'sessions' namespace
    const socketUrl = (process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001') + '/sessions';
    const { socket, isConnected } = useSocket(socketUrl);

    useEffect(() => {
        if (socket && isConnected && session?.id) {
            socket.emit('joinSession', { sessionId: session.id });
        }
    }, [socket, isConnected, session?.id]);
    // END: WebSocket Integration

    // ... (useEffect for auto-start and timer remain same)

    useEffect(() => {
        const shouldStart = searchParams.get('start') === 'true';
        if (shouldStart && session && session.status === SessionStatus.SCHEDULED) {
            setIsConsentModalOpen(true);
        }
    }, [searchParams, session]);

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (session?.status === SessionStatus.IN_PROGRESS) {
            setElapsedTime(0);
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [session?.status]);


    const fetchSession = async () => {
        try {
            setIsLoading(true);
            const data = await SessionsAPI.getById(params.id);
            setSession(data);
            setNotes(data.notes || '');
            setTranscription(data.transcription || '');
            setMethodology(data.methodology || '');

            // Default tab: 'notes' if session completed, 'transcription' if in progress?
            // Let's default to 'transcription' as it is the "Action" view.

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
            if (newStatus === SessionStatus.COMPLETED) {
                payload.notes = notes;
                payload.transcription = transcription;
                payload.methodology = methodology;
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
            await SessionsAPI.update(session.id, {
                notes,
                transcription,
                methodology
            });
            const now = new Date();
            setLastSavedAt(now);
            toast({
                title: 'Datos guardados',
                description: 'Información de sesión guardada correctamente.',
            });
            setSession(prev => prev ? { ...prev, notes, transcription, methodology } : null);
            setIsEditing(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudieron guardar los datos',
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

                    {session.status === SessionStatus.COMPLETED && !isEditing && (
                        <Button
                            variant="outline"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => setIsEditing(true)}
                        >
                            <FileText className="mr-2 h-4 w-4" /> Editar Notas
                        </Button>
                    )}

                    {session.status === SessionStatus.COMPLETED && isEditing && (
                        <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={handleSaveNotes}
                            disabled={isSavingNotes}
                        >
                            {isSavingNotes ? 'Guardando...' : 'Guardar Cambios'}
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
                                            <p className="font-medium flex items-center gap-2">
                                                {client.firstName} {client.lastName}
                                                {session.status === SessionStatus.COMPLETED && session.duration !== undefined && (
                                                    <Badge variant="secondary" className="text-[10px] font-normal h-5 px-1.5 bg-green-50 text-green-700 hover:bg-green-100 border-green-100">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        <span className="mr-1">Duración de la sesión:</span>
                                                        {(() => {
                                                            const h = Math.floor(session.duration! / 3600);
                                                            const m = Math.floor((session.duration! % 3600) / 60);
                                                            const s = session.duration! % 60;
                                                            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                                                        })()}
                                                    </Badge>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Paciente Activo</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Email:</span>
                                            <span className="truncate max-w-[120px]">{client.email || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted-foreground italic">Información del paciente no disponible.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Registro de Sesión
                                </CardTitle>
                                {(session.status === SessionStatus.IN_PROGRESS || session.status === SessionStatus.SCHEDULED || isEditing) && (
                                    <Button size="sm" variant="ghost" onClick={handleSaveNotes} disabled={isSavingNotes}>
                                        {isSavingNotes ? 'Guardando...' : 'Guardar Todo'}
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger value="transcription">Transcripción (IA)</TabsTrigger>
                                    <TabsTrigger value="clinical_notes">Notas Clínicas</TabsTrigger>
                                </TabsList>

                                <TabsContent value="transcription" className="space-y-4">
                                    <div className="bg-slate-50 border rounded-md p-4 min-h-[300px]">
                                        <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">
                                            Transcripción en tiempo real / Audio
                                        </label>
                                        {(session.status === SessionStatus.IN_PROGRESS || session.status === SessionStatus.SCHEDULED || isEditing) ? (
                                            <textarea
                                                className="w-full h-full bg-transparent outline-none resize-none text-sm text-slate-700 leading-relaxed min-h-[250px]"
                                                placeholder="La transcripción del audio aparecerá aquí automáticamente..."
                                                value={transcription}
                                                onChange={(e) => setTranscription(e.target.value)}
                                            />
                                        ) : (
                                            <div className="text-sm text-slate-700 whitespace-pre-wrap">
                                                {transcription || "No hay transcripción disponible."}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Brain className="h-3 w-3" />
                                        La IA analiza este texto para generar sugerencias.
                                    </p>
                                </TabsContent>

                                <TabsContent value="clinical_notes" className="space-y-4">
                                    {/* Methodology Section */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Metodología / Técnicas Aplicadas</label>
                                        {(session.status === SessionStatus.IN_PROGRESS || session.status === SessionStatus.SCHEDULED || isEditing) ? (
                                            <input
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Ej: Terapia Cognitivo-Conductual, EMDR, Mindfulness..."
                                                value={methodology}
                                                onChange={(e) => setMethodology(e.target.value)}
                                            />
                                        ) : (
                                            <div className="p-2 bg-slate-50 rounded border text-sm">
                                                {methodology || "No especificada"}
                                            </div>
                                        )}
                                    </div>

                                    {/* Clinical Notes Section */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Notas Clínicas Privadas</label>
                                        {(session.status === SessionStatus.IN_PROGRESS || session.status === SessionStatus.SCHEDULED || isEditing) ? (
                                            <textarea
                                                className="w-full min-h-[200px] p-4 bg-white rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                                placeholder="Escribe aquí tus observaciones clínicas, impresiones y plan de tratamiento..."
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                            />
                                        ) : (
                                            <div className="p-4 bg-slate-50 rounded-lg text-sm leading-relaxed border whitespace-pre-wrap min-h-[150px]">
                                                {notes || "No hay notas registradas."}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* AI Analysis Section - (Keep existing logic) */}
                    {
                        session.status === SessionStatus.COMPLETED && session.aiMetadata && (
                            <Card className="border-purple-100 bg-purple-50/20">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-purple-700">
                                            <Brain className="h-5 w-5" />
                                            Informe de la IA
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="summary" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 mb-4">
                                            <TabsTrigger value="summary">Resum de Sessió</TabsTrigger>
                                            <TabsTrigger value="analysis">Anàlisi Clínic</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="summary" className="space-y-4">
                                            <div className="bg-white p-4 rounded-md border text-sm leading-relaxed text-slate-700 shadow-sm">
                                                <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Resum Fàctic (Transcripció)</h4>
                                                <p className="whitespace-pre-wrap">{session.aiMetadata.summary}</p>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="analysis" className="space-y-6">
                                            {/* Emotional Elements */}
                                            {session.aiMetadata.emotionalElements && session.aiMetadata.emotionalElements.length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Elements emocionals inferits</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {session.aiMetadata.emotionalElements.map((el: string, i: number) => (
                                                            <Badge key={i} variant="secondary" className="bg-amber-50 text-amber-800 hover:bg-amber-100">
                                                                {el}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Narrative Indicators */}
                                            {session.aiMetadata.narrativeIndicators && session.aiMetadata.narrativeIndicators.length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Indicadors Narratius</h4>
                                                    <ul className="list-disc pl-4 space-y-1">
                                                        {session.aiMetadata.narrativeIndicators.map((ind: string, i: number) => (
                                                            <li key={i} className="text-sm text-slate-700">{ind}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Clinical Follow-Up Support */}
                                            {session.aiMetadata.clinicalFollowUpSupport && (
                                                <>
                                                    {/* Suggestions */}
                                                    {session.aiMetadata.clinicalFollowUpSupport.suggestions && session.aiMetadata.clinicalFollowUpSupport.suggestions.length > 0 && (
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Suggeriments Orientatius</h4>
                                                            <p className="text-[10px] text-slate-500 italic mb-2">A tall de possibles línies de reflexió, sense caràcter prescriptiu:</p>
                                                            <ul className="space-y-2">
                                                                {session.aiMetadata.clinicalFollowUpSupport.suggestions.map((sug: string, i: number) => (
                                                                    <li key={i} className="text-sm text-slate-700 bg-blue-50/50 p-2 rounded border border-blue-100 flex gap-2">
                                                                        <span className="text-blue-500">•</span>
                                                                        {sug}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Possible Lines of Work */}
                                                    {session.aiMetadata.clinicalFollowUpSupport.possibleLines && session.aiMetadata.clinicalFollowUpSupport.possibleLines.length > 0 && (
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Línies de Treball Possibles</h4>
                                                            <ul className="list-disc pl-4 space-y-1">
                                                                {session.aiMetadata.clinicalFollowUpSupport.possibleLines.map((line: string, i: number) => (
                                                                    <li key={i} className="text-sm text-slate-700">{line}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {/* Suggested Tests */}
                                            {(session.aiMetadata.diagnostic_final?.tests_sugerits_final?.suggeriments?.length || 0) > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Instruments d'Avaluació Suggerits</h4>
                                                    <div className="space-y-3">
                                                        {session.aiMetadata.diagnostic_final?.tests_sugerits_final?.suggeriments?.map((block: any, i: number) => (
                                                            <div key={i} className="bg-slate-50 rounded-md p-3 border">
                                                                <p className="font-medium text-sm text-slate-800 mb-2">{block.tema} <span className="text-xs font-normal text-slate-500">({block.categoria})</span></p>
                                                                <ul className="space-y-2">
                                                                    {block.tests.map((test: any, j: number) => (
                                                                        <li key={j} className="text-sm bg-white p-2 rounded border shadow-sm">
                                                                            <div className="flex justify-between items-start">
                                                                                <span className="font-semibold text-indigo-700">{test.codi}</span>
                                                                                <Badge variant="outline" className="text-[10px]">{test.nom}</Badge>
                                                                            </div>
                                                                            <p className="text-xs text-slate-600 mt-1">{test.objectiu_general}</p>
                                                                            <p className="text-[10px] text-slate-400 mt-1 italic border-t pt-1">
                                                                                Motiu suggeriment: {test.why_this_test_was_suggested?.descripcio_orientativa}
                                                                            </p>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </TabsContent>
                                    </Tabs>

                                    <div className="pt-4 border-t border-purple-200 mt-4">
                                        <p className="text-[10px] text-center text-slate-500 font-medium whitespace-pre-line">
                                            {session.aiMetadata.disclaimer || "Aquesta anàlisi no constitueix una valoració clínica, diagnòstica ni una avaluació de risc."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    }
                </div>

                <div className="lg:col-span-6 flex flex-col h-[calc(100vh-140px)] sticky top-6 gap-4">
                    {session.status === SessionStatus.IN_PROGRESS && (
                        <AudioRecorder
                            onAudioData={async (blob) => {
                                console.log('Final recording blob size:', blob.size);
                            }}
                            onStreamData={async (chunk) => {
                                try {
                                    const { text } = await AiAPI.transcribe(chunk);
                                    if (text) {
                                        // Update TRANSCRIPTION instead of notes
                                        setTranscription(prev => {
                                            const newTrans = prev + (prev ? ' ' : '') + `${text}`;
                                            return newTrans;
                                        });
                                    }
                                } catch (e) {
                                    console.error('Stream transcription error', e);
                                }
                            }}
                        />
                    )}

                    <div className="flex-1 min-h-0">
                        <AiAssistantPanel
                            sessionId={session.id}
                            isActive={session.status === SessionStatus.IN_PROGRESS}
                            liveContext={transcription + ' ' + notes} // Pass BOTH contexts to AI
                            socket={socket} // Pass socket
                            isConnected={isConnected} // Pass connection status
                            onSuggestionClick={(text) => {
                                setNotes(prev => prev + (prev ? '\n\n' : '') + `[Pregunta suggerida]: ${text}`);
                                setActiveTab('clinical_notes');
                                toast({
                                    title: 'Pregunta añadida',
                                    description: 'La sugerencia se ha añadido a las notas clínicas.',
                                });
                            }}
                        />
                    </div>
                </div>
            </div>

            <ConsentModal
                isOpen={isConsentModalOpen}
                onClose={() => setIsConsentModalOpen(false)}
                onConfirm={handleConsentConfirmed}
                clientName={client ? `${client.firstName} ${client.lastName}` : session.clientName || 'Paciente'}
            />
        </div>
    );
}
