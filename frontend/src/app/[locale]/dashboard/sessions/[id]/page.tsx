'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    FileText,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Brain,
    Video,
    Link,
    Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { es, ca, enUS } from 'date-fns/locale';
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
import { UpgradePlanModal } from '@/components/dashboard/settings/upgrade-plan-modal';
import { useAuth } from '@/contexts/auth-context';
import { useTranslations, useLocale } from 'next-intl';

export default function SessionDetailPage({ params }: { params: { id: string, locale: string } }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { tokens } = useAuth(); // Get tokens from context
    const t = useTranslations('SessionDetail');
    const locale = useLocale();

    // Get date-fns locale based on interface language
    const dateLocale = locale === 'es' ? es : locale === 'ca' ? ca : enUS;
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
    const [isRecording, setIsRecording] = useState(false); // Validated: Lifted State
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false); // New state for modal
    const [videoCallData, setVideoCallData] = useState<{ token: string; link: string } | null>(null);

    // Sync from session if exists
    useEffect(() => {
        if (session && session.videoCallToken) {
            setVideoCallData({
                token: session.videoCallToken,
                link: `${window.location.protocol}//${window.location.host}/video-call/${session.videoCallToken}`
            });
        }
    }, [session]);

    const transcriptionRef = useRef<HTMLTextAreaElement>(null); // New Ref for auto-scroll
    // Connect to 'sessions' namespace
    // Connect to 'sessions' namespace
    const socketUrl = (process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001') + '/sessions';
    // Pass token explicitly to ensure auth works
    const { socket, isConnected, isAiLimitReached } = useSocket(socketUrl, tokens?.accessToken); // Add isAiLimitReached

    // Effect for AI Limit Notification
    const showLimitToast = useCallback(() => {
        console.log('[DEBUG] Showing AI limit toast and modal');
        toast({
            title: t('aiLimitReached'),
            description: t('aiLimitReachedDesc'),
            variant: "destructive",
            duration: 5000,
        });
        setIsUpgradeModalOpen(true); // Open modal
    }, [toast]);

    useEffect(() => {
        console.log('[DEBUG] isAiLimitReached changed:', isAiLimitReached);
        if (isAiLimitReached) {
            showLimitToast();
        }
    }, [isAiLimitReached, showLimitToast]);

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


    const fetchSession = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await SessionsAPI.getById(params.id);
            setSession(data);
            setNotes(data.notes || '');
            setTranscription(data.transcription || '');
            setMethodology(data.methodology || '');

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
                title: t('error'),
                description: t('errorLoadingSession'),
                variant: 'destructive',
            });
            router.push('/dashboard/sessions');
        } finally {
            setIsLoading(false);
        }
    }, [params.id, router, toast]);

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    // Auto-scroll effect
    useEffect(() => {
        if (transcriptionRef.current && isRecording) {
            transcriptionRef.current.scrollTop = transcriptionRef.current.scrollHeight;
        }
    }, [transcription, isRecording]);

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
            router.refresh(); // Invalidate client cache to ensure list view updates
            toast({
                title: t('statusUpdated'),
                description: newStatus === SessionStatus.COMPLETED ? t('statusCompletedDesc') : newStatus === SessionStatus.IN_PROGRESS ? t('statusStartedDesc') : t('statusCancelledDesc'),
            });
        } catch (error) {
            toast({
                title: t('error'),
                description: t('errorUpdatingStatus'),
                variant: 'destructive',
            });
        }
    };

    const handleStartSessionClick = () => {
        setIsConsentModalOpen(true);
    };

    const handleConsentConfirmed = async (isMinor: boolean = false) => {
        setIsConsentModalOpen(false);
        await handleStatusChange(SessionStatus.IN_PROGRESS, {
            consentSigned: true,
            consentVersion: '1.0',
            isMinor: isMinor // Pass the minor flag from the modal
        });
    };

    const handleMinorChange = async (checked: boolean) => {
        if (!session) return;
        try {
            const updatedSession = await SessionsAPI.update(session.id, { isMinor: checked });
            setSession(updatedSession);
            toast({
                title: t('configUpdated'),
                description: checked ? t('minorModeActivated') : t('minorModeDeactivated'),
            });
        } catch (error) {
            toast({
                title: t('error'),
                description: t('errorUpdatingConfig'),
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
            router.refresh(); // Invalidate client cache
            toast({
                title: t('dataSaved'),
                description: t('dataSavedDesc'),
            });
            setSession(prev => prev ? { ...prev, notes, transcription, methodology } : null);
            setIsEditing(false);
        } catch (error) {
            toast({
                title: t('error'),
                description: t('errorSavingData'),
                variant: 'destructive',
            });
        } finally {
            setIsSavingNotes(false);
        }
    };

    const handleDelete = async () => {
        if (!session) return;
        if (!confirm(t('confirmDelete'))) return;
        try {
            await SessionsAPI.delete(session.id);
            toast({
                title: t('sessionDeleted'),
                description: t('sessionDeletedDesc'),
            });
            router.push('/dashboard/sessions');
        } catch (error) {
            console.error('Error deleting session:', error);
            toast({
                title: t('error'),
                description: t('errorDeletingSession'),
                variant: 'destructive',
            });
        }
    };

    const handleCreateVideoCall = async () => {
        if (!session) return;
        try {
            const data = await SessionsAPI.createVideoCall(session.id);
            setVideoCallData(data);
            toast({
                title: t('videoCallCreated'),
                description: t('videoCallCreatedDesc'),
            });
        } catch (error) {
            console.error(error);
            toast({
                title: t('error'),
                description: t('errorCreatingVideoCall'),
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

        <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 md:space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/sessions')} className="-ml-2 lg:ml-0">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 lg:flex-none">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('title')}</h1>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1 text-sm md:text-base">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(session.startTime), 'PPP', { locale: dateLocale })}
                            <span className="hidden sm:inline">•</span>
                            <Clock className="h-4 w-4 ml-2 sm:ml-0" />
                            {format(new Date(session.startTime), 'p', { locale: dateLocale })}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                    {session.status === SessionStatus.IN_PROGRESS && (
                        <div className="mr-0 lg:mr-4 font-mono text-lg md:text-xl font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md border border-blue-100 w-full lg:w-auto text-center mb-2 lg:mb-0">
                            {formatTime(elapsedTime)}
                        </div>
                    )}

                    {session.status === SessionStatus.SCHEDULED && (
                        <>
                            <Button
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 flex-1 lg:flex-none"
                                onClick={() => handleStatusChange(SessionStatus.CANCELLED)}
                            >
                                <XCircle className="mr-2 h-4 w-4" /> {t('cancel')}
                            </Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 flex-1 lg:flex-none"
                                onClick={handleStartSessionClick}
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" /> {t('startSession')}
                            </Button>
                        </>
                    )}

                    {(session.status === SessionStatus.SCHEDULED || session.status === SessionStatus.IN_PROGRESS) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white ml-2">
                                    <Video className="mr-2 h-4 w-4" /> {t('videoconf')}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80">
                                {videoCallData ? (
                                    <div className="p-4 space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">{t('videoInvitationSent')}</p>
                                            <p className="text-xs text-muted-foreground">{t('patientLink')}</p>
                                            <div className="flex items-center gap-2 p-2 bg-slate-100 rounded text-xs break-all">
                                                {videoCallData.link}
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full"
                                            size="sm"
                                            onClick={() => router.push(`/dashboard/sessions/${session.id}/video`)}
                                        >
                                            <Video className="mr-2 h-3 w-3" /> {t('joinNow')}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-2">
                                        <DropdownMenuItem onClick={handleCreateVideoCall} className="cursor-pointer">
                                            <Mail className="mr-2 h-4 w-4" />
                                            {t('sendEmailInvitation')}
                                        </DropdownMenuItem>
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {session.status === SessionStatus.IN_PROGRESS && (
                        <Button
                            className="bg-green-600 hover:bg-green-700 w-full lg:w-auto"
                            onClick={() => handleStatusChange(SessionStatus.COMPLETED)}
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" /> {t('finishSession')}
                        </Button>
                    )}

                    {session.status === SessionStatus.COMPLETED && !isEditing && (
                        <Button
                            variant="outline"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 flex-1 lg:flex-none"
                            onClick={() => setIsEditing(true)}
                        >
                            <FileText className="mr-2 h-4 w-4" /> Editar Notas
                        </Button>
                    )}

                    {session.status === SessionStatus.COMPLETED && isEditing && (
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 flex-1 lg:flex-none"
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
                                    {t('deleteSession')}
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
                                {t('patient')}
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
                                            <div className="font-medium flex items-center gap-2">
                                                {client.firstName} {client.lastName}
                                                {session.status === SessionStatus.COMPLETED && session.duration !== undefined && (
                                                    <Badge variant="secondary" className="text-[10px] font-normal h-5 px-1.5 bg-green-50 text-green-700 hover:bg-green-100 border-green-100">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        <span className="mr-1">{t('sessionDuration')}</span>
                                                        {(() => {
                                                            const h = Math.floor(session.duration! / 3600);
                                                            const m = Math.floor((session.duration! % 3600) / 60);
                                                            const s = session.duration! % 60;
                                                            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                                                        })()}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{t('activePatient')}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t('email')}:</span>
                                            <span className="truncate max-w-[120px]">{client.email || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted-foreground italic">{t('patientInfoUnavailable')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    {t('sessionRecord')}
                                </CardTitle>
                                {(session.status === SessionStatus.IN_PROGRESS || session.status === SessionStatus.SCHEDULED || isEditing) && (
                                    <Button size="sm" variant="ghost" onClick={handleSaveNotes} disabled={isSavingNotes}>
                                        {isSavingNotes ? t('saving') : t('saveAll')}
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger value="transcription">{t('transcriptionTab')}</TabsTrigger>
                                    <TabsTrigger value="clinical_notes">{t('clinicalNotesTab')}</TabsTrigger>
                                </TabsList>

                                <TabsContent value="transcription" className="space-y-4">
                                    <div className="bg-slate-50 border rounded-md p-4 min-h-[300px]">
                                        <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">
                                            {t('transcriptionRealtime')}
                                        </label>
                                        {(session.status === SessionStatus.IN_PROGRESS || session.status === SessionStatus.SCHEDULED || isEditing) ? (
                                            <textarea
                                                ref={transcriptionRef}
                                                className="w-full h-full bg-transparent outline-none resize-none text-sm text-slate-700 leading-relaxed min-h-[250px]"
                                                placeholder={t('transcriptionPlaceholder')}
                                                value={transcription}
                                                onChange={(e) => setTranscription(e.target.value)}
                                            />
                                        ) : (
                                            <div className="text-sm text-slate-700 whitespace-pre-wrap">
                                                {transcription || t('noTranscription')}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Brain className="h-3 w-3" />
                                        {t('aiAnalysisNote')}
                                    </p>
                                </TabsContent>

                                <TabsContent value="clinical_notes" className="space-y-4">
                                    {/* Methodology Section */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t('methodology')}</label>
                                        {(session.status === SessionStatus.IN_PROGRESS || session.status === SessionStatus.SCHEDULED || isEditing) ? (
                                            <input
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder={t('methodologyPlaceholder')}
                                                value={methodology}
                                                onChange={(e) => setMethodology(e.target.value)}
                                            />
                                        ) : (
                                            <div className="p-2 bg-slate-50 rounded border text-sm">
                                                {methodology || t('notSpecified')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Clinical Notes Section */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t('clinicalNotesPrivate')}</label>
                                        {(session.status === SessionStatus.IN_PROGRESS || session.status === SessionStatus.SCHEDULED || isEditing) ? (
                                            <textarea
                                                className="w-full min-h-[200px] p-4 bg-white rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                                placeholder={t('clinicalNotesPlaceholder')}
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                            />
                                        ) : (
                                            <div className="p-4 bg-slate-50 rounded-lg text-sm leading-relaxed border whitespace-pre-wrap min-h-[150px]">
                                                {notes || t('noNotes')}
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
                                            {t('aiReport')}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="summary" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 mb-4">
                                            <TabsTrigger value="summary">{t('sessionSummaryTab')}</TabsTrigger>
                                            <TabsTrigger value="analysis">{t('clinicalAnalysisTab')}</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="summary" className="space-y-4">
                                            <div className="bg-white p-4 rounded-md border text-sm leading-relaxed text-slate-700 shadow-sm">
                                                <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">{t('factualSummary')}</h4>
                                                <p className="whitespace-pre-wrap">{session.aiMetadata.summary}</p>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="analysis" className="space-y-6">
                                            {/* Emotional Elements */}
                                            {session.aiMetadata.emotionalElements && session.aiMetadata.emotionalElements.length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">{t('emotionalElements')}</h4>
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
                                                    <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">{t('narrativeIndicators')}</h4>
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
                                                            <h4 className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">{t('orientativeSuggestions')}</h4>
                                                            <p className="text-[10px] text-slate-500 italic mb-2">{t('suggestionsDisclaimer')}</p>
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
                                                            <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">{t('possibleWorkLines')}</h4>
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
                                                    <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">{t('suggestedInstruments')}</h4>
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
                                            {session.aiMetadata.disclaimer || t('aiDisclaimer')}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    }
                </div>

                <div className="lg:col-span-6 flex flex-col h-auto lg:h-[calc(100vh-140px)] lg:sticky lg:top-6 gap-4">
                    {session.status === SessionStatus.IN_PROGRESS && (
                        <AudioRecorder
                            isLimitReached={isAiLimitReached}
                            onLimitReachedAction={showLimitToast}
                            onRecordingStatusChange={(recording) => {
                                setIsRecording(recording);
                                if (socket && isConnected) {
                                    if (recording) {
                                        socket.emit('start_recording', { sessionId: session.id });
                                        console.log('Emitted start_recording');
                                    } else {
                                        socket.emit('stop_recording', { sessionId: session.id });
                                        console.log('Emitted stop_recording');
                                    }
                                }
                            }}
                            onAudioData={async (blob) => {
                                console.log('Final recording blob size:', blob.size);
                            }}
                            onStreamData={async (chunk) => {
                                try {
                                    // Pass isLive: true to avoid double billing
                                    const { text } = await AiAPI.transcribe(chunk, true);
                                    if (text) {
                                        // Update TRANSCRIPTION instead of notes
                                        setTranscription(prev => {
                                            // Use newline to separate chunks, respecting the "Speaker" format
                                            const newTrans = prev + (prev ? '\n' : '') + `${text}`;
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
                            isActive={session.status === SessionStatus.IN_PROGRESS && isRecording && !isAiLimitReached} // Details: AI only active when recording AND limit not reached
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

            <UpgradePlanModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
            />
        </div>
    );
}
