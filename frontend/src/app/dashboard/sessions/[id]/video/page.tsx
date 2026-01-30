'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Video, Mic, MicOff, VideoOff, PhoneOff, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useWebRTC } from '@/hooks/use-webrtc';
import { AudioRecorder } from '@/components/dashboard/sessions/audio-recorder';
import { AiAPI } from '@/lib/ai-api'; // Assuming this API exists

export default function ProfessionalVideoPage({ params }: { params: { id: string } }) {
    const { tokens, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState('Conectando...');
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [roomId, setRoomId] = useState<string | null>(null);

    const [mixedStream, setMixedStream] = useState<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const transcriptionRef = useRef<HTMLDivElement>(null);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Initialize WebRTC Hook
    const { remoteStream, connectionStatus } = useWebRTC({
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
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                setLocalStream(stream);
                currentLocalStream = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            })
            .catch(err => {
                console.error("Error media", err);
                setStatus('Error accediendo a cámara/micrófono');
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
            setStatus('Uniéndose a la sala como Profesional...');
            newSocket.emit('join-video-room', { sessionId: params.id });
        });

        newSocket.on('room-joined', (data) => {
            console.log('[ProfessionalPage] Room Joined:', data);
            setStatus(`En linea. Peers: ${data.peerCount || 0}`);
            setRoomId(data.roomId);
        });

        newSocket.on('peer-joined', (data) => {
            setStatus(`Paciente conectado (${data.identity})`);
        });

        newSocket.on('error', (err) => {
            setStatus('Error: ' + err.message);
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            setStatus('Desconectado');
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

                        // We do NOT connect to ctx.destination here to avoid feedback/echo
                        // as the <video> element plays the remote audio.

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
        router.back();
    };

    if (!isLoading && !tokens?.accessToken) {
        return (
            <div className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-4 bg-slate-950 rounded-lg text-white">
                <Card className="p-8 bg-slate-900 border-slate-800 text-center max-w-md">
                    <h2 className="text-xl font-semibold mb-4 text-red-400">Sesión Caducada</h2>
                    <p className="text-slate-300 mb-6">
                        Tu sesión ha expirado o no se encuentra el token de acceso. Por favor, inicia sesión nuevamente para continuar con la videollamada.
                    </p>
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => router.push(`/auth/login?redirect=/dashboard/sessions/${params.id}/video`)}
                    >
                        Iniciar Sesión
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-6rem)] grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 bg-slate-950 rounded-lg">

            {/* Left: Video Area */}
            <div className="lg:col-span-3 flex flex-col">
                <div className="mb-4 flex items-center gap-2 text-white">
                    <Button variant="ghost" className="text-white hover:bg-white/10" onClick={endCall}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Volver a Sesión
                    </Button>
                    <h1 className="text-lg font-semibold">Videoconferencia - Sala Profesional</h1>
                </div>

                <Card className="flex-1 bg-slate-900 border-slate-800 text-white overflow-hidden relative rounded-xl min-h-[400px]">
                    {/* Main Video Area (Remote) */}
                    <div className="absolute inset-0 bg-black flex items-center justify-center text-slate-500">
                        {remoteStream ? (
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-slate-500 animate-pulse">Esperando vídeo del paciente...</div>
                        )}

                        <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded text-sm backdrop-blur-sm text-white">
                            {status} ({connectionStatus})
                        </div>
                    </div>

                    {/* Self View PIP */}
                    <div className="absolute top-4 right-4 w-40 h-28 bg-slate-800 rounded border border-slate-700 shadow-xl overflow-hidden z-10">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className={`w-full h-full object-cover transform scale-x-[-1] ${!isVideoEnabled ? 'hidden' : ''}`}
                        />
                        {!isVideoEnabled && (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                                <VideoOff className="h-6 w-6" />
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10 z-20">
                        <Button
                            variant={isAudioEnabled ? "ghost" : "destructive"}
                            size="icon"
                            className={`rounded-full h-12 w-12 ${isAudioEnabled ? "bg-white/10 hover:bg-white/20" : ""} text-white`}
                            onClick={toggleAudio}
                        >
                            {isAudioEnabled ? <Mic /> : <MicOff />}
                        </Button>
                        <Button
                            variant={isVideoEnabled ? "ghost" : "destructive"}
                            size="icon"
                            className={`rounded-full h-12 w-12 ${isVideoEnabled ? "bg-white/10 hover:bg-white/20" : ""} text-white`}
                            onClick={toggleVideo}
                        >
                            {isVideoEnabled ? <Video /> : <VideoOff />}
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            className="rounded-full h-12 w-12 bg-red-500 hover:bg-red-600 border-transparent shadow-lg text-white"
                            onClick={endCall}
                        >
                            <PhoneOff />
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Right: Transcription Panel */}
            <div className="lg:col-span-1 flex flex-col gap-4">
                <Card className="flex-1 bg-slate-900 border-slate-800 text-slate-100 flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-slate-800 font-semibold text-sm flex items-center justify-between">
                        <span>Transcripción en tiempo real</span>
                        {isRecording && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
                    </div>
                    <div
                        ref={transcriptionRef}
                        className="flex-1 p-3 overflow-y-auto text-xs space-y-2 font-mono"
                    >
                        {transcription ? (
                            <p className="whitespace-pre-wrap">{transcription}</p>
                        ) : (
                            <p className="text-slate-500 italic text-center mt-10">
                                La transcripción aparecerá aquí cuando inicies la grabación...
                            </p>
                        )}
                    </div>
                    <div className="p-3 bg-slate-950 border-t border-slate-800">
                        {mixedStream && (
                            <AudioRecorder
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
                        {!mixedStream && (
                            <div className="text-xs text-center text-slate-500">
                                Esperando audio para habilitar grabación...
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
