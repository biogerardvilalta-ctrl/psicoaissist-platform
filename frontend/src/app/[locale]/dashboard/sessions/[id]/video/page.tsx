'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Video, Mic, MicOff, VideoOff, PhoneOff, ArrowLeft, Circle, Square, CheckCircle2, Play, FileText, Brain } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useWebRTC } from '@/hooks/use-webrtc';
import { AudioRecorder, AudioRecorderHandle } from '@/components/dashboard/sessions/audio-recorder';
import { AiAssistantPanel } from '@/components/dashboard/sessions/ai-assistant-panel';
import { AiAPI } from '@/lib/ai-api';
import { SessionsAPI, Session, SessionStatus } from '@/lib/sessions-api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';

export default function ProfessionalVideoPage({ params }: { params: { id: string } }) {
    const { tokens, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const t = useTranslations('ProfessionalVideoCall');

    // Session State
    const [session, setSession] = useState<Session | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [notes, setNotes] = useState('');
    const [activeTab, setActiveTab] = useState('transcription');

    // WebRTC & Socket State
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState(t('status.connecting'));
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [mixedStream, setMixedStream] = useState<MediaStream | null>(null);

    // Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const audioRecorderRef = useRef<AudioRecorderHandle>(null);
    const transcriptionRef = useRef<HTMLDivElement>(null);

    // Recording & Transcription State
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');

    // Fetch Session
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const data = await SessionsAPI.getById(params.id);
                setSession(data);
                setNotes(data.notes || '');
                setTranscription(data.transcription || '');

                // Init timer if running
                if (data.status === SessionStatus.IN_PROGRESS && data.startTime) {
                    const start = new Date(data.startTime).getTime();
                    const now = new Date().getTime();
                    setElapsedTime(Math.floor((now - start) / 1000));
                }
            } catch (error) {
                console.error("Error fetching session", error);
                toast({ title: t('toasts.error'), description: t('toasts.errorLoadSession'), variant: "destructive" });
            }
        };
        if (tokens?.accessToken) fetchSession();
    }, [params.id, tokens, toast]);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (session?.status === SessionStatus.IN_PROGRESS) {
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

    // Auto-save Notes (Simulated Debounce)
    const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const handleNotesChange = (val: string) => {
        setNotes(val);
        if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current);
        notesTimeoutRef.current = setTimeout(async () => {
            try {
                await SessionsAPI.update(params.id, { notes: val });
            } catch (e) { console.error("Error saving notes", e); }
        }, 2000);
    };

    // Session Actions
    const handleStartSession = async () => {
        if (!session) return;
        try {
            const updated = await SessionsAPI.update(session.id, {
                status: SessionStatus.IN_PROGRESS,
                startTime: new Date().toISOString()
            });
            setSession(updated);
            setElapsedTime(0);
            toast({ title: t('toasts.sessionStarted'), description: t('toasts.sessionStartedDesc') });
        } catch (e) {
            toast({ title: t('toasts.error'), description: t('toasts.errorStartSession'), variant: "destructive" });
        }
    };

    const handleEndSession = async () => {
        if (!session) return;
        if (!confirm(t('confirmEnd'))) return;

        try {
            // Stop recording logic if active
            if (isRecording) {
                handleStopRecording();
                // Wait small delay for socket
                await new Promise(r => setTimeout(r, 500));
            }

            const updated = await SessionsAPI.update(session.id, {
                status: SessionStatus.COMPLETED,
                endTime: new Date().toISOString(),
                transcription,
                notes
            });

            endCall(); // Clean up WebRTC

            router.push(`/dashboard/sessions/${session.id}`);
            toast({ title: t('toasts.sessionEnded'), description: t('toasts.sessionEndedDesc') });
        } catch (e) {
            toast({ title: t('toasts.error'), description: t('toasts.errorEndSession'), variant: "destructive" });
        }
    };

    // Initialize WebRTC Hook
    const { remoteStream, connectionStatus, networkQuality } = useWebRTC({
        socket,
        roomId,
        localStream,
        identity: 'host'
    });

    // Auto-scroll transcription
    useEffect(() => {
        if (transcriptionRef.current) {
            transcriptionRef.current.scrollTop = transcriptionRef.current.scrollHeight;
        }
    }, [transcription]);

    // Cleanup AudioContext
    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // 1. Get Local Stream First
    useEffect(() => {
        let currentLocalStream: MediaStream | null = null;
        navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                frameRate: { ideal: 30, max: 30 }
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        })
            .then(stream => {
                setLocalStream(stream);
                currentLocalStream = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            })
            .catch(err => {
                console.error("Error media", err);
                setStatus(t('status.mediaError'));
            });

        return () => {
            if (currentLocalStream) {
                currentLocalStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // 2. Connect Socket ONLY when Auth & Stream are ready
    useEffect(() => {
        if (!tokens?.accessToken || !localStream) return;

        const socketUrl = (process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001') + '/sessions';
        // Connect with auth
        const newSocket = io(socketUrl, {
            auth: { token: tokens.accessToken }
        });

        newSocket.on('connect', () => {
            console.log('Socket connected (Pro)');
            setIsConnected(true);
            setStatus(t('status.joiningRoom'));
            newSocket.emit('join-video-room', { sessionId: params.id });
        });

        newSocket.on('room-joined', (data) => {
            console.log('[ProfessionalPage] Room Joined:', data);
            setStatus(`${t('status.online')} ${data.peerCount || 0}`);
            setRoomId(data.roomId);
        });

        newSocket.on('peer-joined', (data) => {
            setStatus(`${t('status.patientConnected')} (${data.identity})`);
        });

        newSocket.on('error', (err) => {
            setStatus(t('status.error') + ' ' + err.message);
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            setStatus(t('status.disconnected'));
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [params.id, tokens?.accessToken, localStream]);

    // Attach remote stream when available
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // Mix Audio Streams
    useEffect(() => {
        if (localStream && remoteStream) {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                audioDestinationRef.current = audioContextRef.current.createMediaStreamDestination();
            }

            const ctx = audioContextRef.current;
            const dest = audioDestinationRef.current;

            if (ctx && dest) {
                // Determine if tracks are active
                const localAudio = localStream.getAudioTracks()[0];
                const remoteAudio = remoteStream.getAudioTracks()[0];

                if (localAudio && remoteAudio) {
                    try {
                        const localSource = ctx.createMediaStreamSource(localStream);
                        const remoteSource = ctx.createMediaStreamSource(remoteStream);

                        localSource.connect(dest);
                        remoteSource.connect(dest);

                        setMixedStream(dest.stream);
                        console.log("Audio streams mixed successfully");
                    } catch (e) {
                        console.error("Error mixing audio", e);
                    }
                }
            }
        }
    }, [localStream, remoteStream]);


    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    const toggleAudio = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !isAudioEnabled;
            });
            setIsAudioEnabled(!isAudioEnabled);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !isVideoEnabled;
            });
            setIsVideoEnabled(!isVideoEnabled);
        }
    };

    const endCall = () => {
        if (socket) socket.disconnect();
        if (localStream) localStream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) audioContextRef.current.close();
        router.push(`/dashboard/sessions/${params.id}`); // Just go back without ending session logic here (unless ended via button)
    };

    const handleStartRecording = () => {
        if (audioRecorderRef.current) {
            audioRecorderRef.current.startRecording();
        }
    };

    const handleStopRecording = () => {
        if (audioRecorderRef.current) {
            audioRecorderRef.current.stopRecording();
        }
    };

    if ((!isLoading && !tokens?.accessToken) || !session) {
        return (
            <div className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-4 bg-slate-950 rounded-lg text-white">
                {!session ? (
                    <div className="animate-pulse">{t('loading')}</div>
                ) : (
                    <Card className="p-8 bg-slate-900 border-slate-800 text-center max-w-md">
                        <h2 className="text-xl font-semibold mb-4 text-red-400">{t('sessionExpired')}</h2>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => router.push(`/auth/login`)}>{t('loginButton')}</Button>
                    </Card>
                )}
            </div>
        );
    }

    return (
        <div className="h-[100dvh] lg:h-[calc(100vh-6rem)] flex flex-col gap-2 lg:gap-4 p-2 lg:p-4 bg-slate-950 lg:rounded-lg overflow-hidden">

            {/* Top Bar: Header & Controls */}
            <div className="flex flex-row items-center justify-between shrink-0 gap-2 lg:gap-4 border-b border-slate-800/50 pb-2 lg:border-none lg:pb-0">

                {/* Left: Timer */}
                <div className="flex justify-start shrink-0">
                    <div className="bg-blue-50/10 border border-blue-500/20 px-2 py-1 lg:px-4 lg:py-2 rounded-md font-mono text-xs lg:text-xl font-bold text-blue-400 min-w-[64px] lg:min-w-[120px] text-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        {formatTime(elapsedTime)}
                    </div>
                </div>

                {/* Center: Session Controls */}
                <div className="flex items-center gap-2 lg:gap-3 flex-1 justify-center">
                    <div className="hidden md:flex bg-indigo-600 text-white px-4 py-2 rounded-md items-center gap-2 font-medium shadow-lg">
                        <Video className="h-4 w-4" />
                        {t('videoconf')}
                    </div>

                    {session.status === SessionStatus.SCHEDULED && (
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 lg:px-6 shadow-lg shadow-emerald-900/20 h-8 lg:h-10"
                            onClick={handleStartSession}
                            size="sm"
                        >
                            <Play className="h-4 w-4 lg:mr-2 fill-current" />
                            <span className="hidden lg:inline">{t('startSession')}</span>
                        </Button>
                    )}

                    {session.status === SessionStatus.IN_PROGRESS && (
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 lg:px-6 shadow-lg shadow-emerald-900/20 h-8 lg:h-10"
                            onClick={handleEndSession}
                            size="sm"
                        >
                            <CheckCircle2 className="h-4 w-4 lg:mr-2" />
                            <span className="hidden lg:inline">{t('finishSession')}</span>
                        </Button>
                    )}
                </div>


                {/* Right: Recording Controls */}
                <div className="flex items-center gap-1 lg:gap-3 justify-end shrink-0">
                    {mixedStream ? (
                        !isRecording ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white px-3 lg:px-4 h-8 lg:h-10"
                                onClick={handleStartRecording}
                            >
                                <Mic className="h-4 w-4 text-blue-400 lg:mr-2" />
                                <span className="hidden lg:inline">{t('record')}</span>
                            </Button>
                        ) : (
                            <div className="flex items-center gap-1 lg:gap-3 bg-slate-900/80 p-0.5 lg:p-1 lg:pr-3 rounded-full border border-red-500/30">
                                <div className="flex items-center gap-2 px-2 py-1 lg:py-1.5 rounded-full bg-red-500/10 text-red-500">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                    <span className="hidden lg:inline text-xs font-mono font-bold">{t('recording')}</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-white hover:bg-white/10 hover:text-red-400"
                                    onClick={handleStopRecording}
                                >
                                    <Square className="h-3 w-3 lg:mr-2 fill-current" />
                                    <span className="hidden lg:inline">{t('stop')}</span>
                                </Button>
                            </div>
                        )
                    ) : (
                        <div className="hidden lg:block text-xs text-slate-500 italic px-2">{t('waitingAudio')}</div>
                    )}
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white h-8 w-8 lg:h-10 lg:w-10" onClick={endCall}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 flex flex-col sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-4 min-h-0 overflow-hidden">

                {/* Left: Video Area (2 cols on sm, 3 cols on lg) */}
                <div className="sm:col-span-2 lg:col-span-3 flex flex-col h-[35%] sm:h-auto min-h-0 shrink-0">
                    <Card className="flex-1 bg-slate-900 border-slate-800 text-white overflow-hidden relative rounded-lg lg:rounded-xl shadow-2xl">
                        {/* Main Video Area (Remote) */}
                        <div className="absolute inset-0 bg-black flex items-center justify-center text-slate-500">
                            {remoteStream ? (
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="h-16 w-16 rounded-full border-2 border-slate-800 border-t-blue-500 animate-spin" />
                                    <div className="text-slate-500 animate-pulse text-xs lg:text-base">{t('waitingVideo')}</div>
                                </div>
                            )}

                            <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full text-[10px] lg:text-xs backdrop-blur-sm text-slate-300 border border-white/5">
                                {status} ({connectionStatus})
                                {networkQuality !== 'unknown' && (
                                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${networkQuality === 'good' ? 'bg-green-500/20 text-green-400' :
                                        networkQuality === 'fair' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                        {networkQuality === 'good' ? t('connectionGood') : networkQuality === 'fair' ? t('connectionFair') : t('connectionBad')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Self View PIP */}
                        <div className="absolute top-2 right-2 lg:top-4 lg:right-4 w-24 lg:w-48 aspect-video bg-slate-800 rounded-lg border border-slate-700 shadow-2xl overflow-hidden z-10 transition-all hover:scale-105">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className={`w-full h-full object-cover transform scale-x-[-1] ${!isVideoEnabled ? 'hidden' : ''}`}
                            />
                            {!isVideoEnabled && (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                                    <VideoOff className="h-4 w-4 lg:h-6 lg:w-6" />
                                </div>
                            )}
                        </div>

                        {/* Controls Overlay */}
                        <div className="absolute bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 lg:gap-4 bg-black/60 backdrop-blur-xl p-2 lg:p-4 rounded-xl lg:rounded-2xl border border-white/10 z-20 shadow-2xl transition-all hover:bg-black/80">
                            <Button
                                variant={isAudioEnabled ? "ghost" : "destructive"}
                                size="icon"
                                className={`rounded-full h-10 w-10 lg:h-14 lg:w-14 ${isAudioEnabled ? "bg-white/10 hover:bg-white/20" : ""} text-white transition-all`}
                                onClick={toggleAudio}
                            >
                                {isAudioEnabled ? <Mic className="h-4 w-4 lg:h-6 lg:w-6" /> : <MicOff className="h-4 w-4 lg:h-6 lg:w-6" />}
                            </Button>
                            <Button
                                variant={isVideoEnabled ? "ghost" : "destructive"}
                                size="icon"
                                className={`rounded-full h-10 w-10 lg:h-14 lg:w-14 ${isVideoEnabled ? "bg-white/10 hover:bg-white/20" : ""} text-white transition-all`}
                                onClick={toggleVideo}
                            >
                                {isVideoEnabled ? <Video className="h-4 w-4 lg:h-6 lg:w-6" /> : <VideoOff className="h-4 w-4 lg:h-6 lg:w-6" />}
                            </Button>

                        </div>
                    </Card>
                </div>

                {/* Right: Sidebar (1 col) - Split View */}
                <div className="sm:col-span-1 lg:col-span-1 flex flex-col gap-2 lg:gap-4 min-h-0 h-full flex-1">

                    {/* Top: AI Assistant (Flex Grow) */}
                    <div className="flex-1 min-h-0 overflow-hidden rounded-xl shadow-lg">
                        <AiAssistantPanel
                            sessionId={params.id}
                            isActive={isRecording}
                            liveContext={transcription + '\n' + notes}
                            socket={socket}
                            isConnected={isConnected}
                        />
                    </div>

                    {/* Bottom: Tabs (Approx 30% height on mobile, 40% on sm+) */}
                    <Card className="h-[30%] sm:h-[40%] min-h-[150px] lg:min-h-[250px] bg-slate-900 border-slate-800 text-slate-100 flex flex-col overflow-hidden shrink-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                            <div className="px-3 pt-2 border-b border-slate-800 bg-slate-950/50">
                                <TabsList className="bg-slate-800/50 border border-slate-700/50 w-full grid grid-cols-2 h-8">
                                    <TabsTrigger value="transcription" className="text-xs data-[state=active]:bg-slate-700 data-[state=active]:text-white">{t('transcriptionTab')}</TabsTrigger>
                                    <TabsTrigger value="notes" className="text-xs data-[state=active]:bg-slate-700 data-[state=active]:text-white">{t('notesTab')}</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="transcription" className="flex-1 min-h-0 p-0 m-0 relative flex flex-col">
                                <div className="absolute top-2 right-3 z-10">
                                    {isRecording && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
                                </div>
                                <div
                                    ref={transcriptionRef}
                                    className="flex-1 p-3 overflow-y-auto text-xs space-y-2 font-mono scroll-smooth"
                                >
                                    {transcription ? (
                                        <p className="whitespace-pre-wrap text-slate-300 leading-relaxed">{transcription}</p>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                                            <div className="w-8 h-0.5 bg-slate-800 rounded-full" />
                                            <p className="italic text-[10px]">{t('transcriptionPlaceholder')}</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="notes" className="flex-1 min-h-0 p-0 m-0 flex flex-col">
                                <Textarea
                                    className="flex-1 bg-transparent border-none resize-none focus-visible:ring-0 p-3 text-sm text-slate-200"
                                    placeholder={t('notesPlaceholder')}
                                    value={notes}
                                    onChange={(e) => handleNotesChange(e.target.value)}
                                />
                                <div className="px-2 py-1 bg-slate-950 text-[10px] text-slate-600 border-t border-slate-800 text-right">
                                    {notes ? t('autoSaved') : t('private')}
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Hidden Audio Recorder (Controlled via Ref) */}
                        <div className="hidden">
                            {mixedStream && (
                                <AudioRecorder
                                    ref={audioRecorderRef}
                                    hideControls={true}
                                    inputStream={mixedStream}
                                    onRecordingStatusChange={(recording: boolean) => {
                                        setIsRecording(recording);
                                        if (socket && isConnected) {
                                            if (recording) socket.emit('start_recording', { sessionId: params.id });
                                            else socket.emit('stop_recording', { sessionId: params.id });
                                        }
                                    }}
                                    onAudioData={(blob: Blob) => console.log('Final Blob', blob.size)}
                                    onStreamData={async (chunk: Blob) => {
                                        try {
                                            const { text } = await AiAPI.transcribe(chunk, true);
                                            if (text) {
                                                setTranscription(prev => prev + (prev ? '\n' : '') + text);
                                            }
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
