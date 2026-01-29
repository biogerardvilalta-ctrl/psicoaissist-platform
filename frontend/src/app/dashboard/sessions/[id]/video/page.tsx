'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Video, Mic, MicOff, VideoOff, PhoneOff, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useWebRTC } from '@/hooks/use-webrtc';

export default function ProfessionalVideoPage({ params }: { params: { id: string } }) {
    const { tokens } = useAuth();
    const router = useRouter();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState('Conectando...');
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [roomId, setRoomId] = useState<string | null>(null);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Initialize WebRTC Hook
    const { remoteStream, connectionStatus } = useWebRTC({
        socket,
        roomId,
        localStream,
        identity: 'host'
    });

    useEffect(() => {
        if (!tokens?.accessToken) return;

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
            setStatus('En linea. Esperando paciente...');
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

        // Request interaction
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            })
            .catch(err => {
                console.error("Error media", err);
                setStatus('Error accediendo a cámara/micrófono');
            });

        return () => {
            newSocket.close();
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [params.id, tokens?.accessToken]);

    // Attach remote stream when available
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);


    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col p-4 bg-slate-950 rounded-lg">
            <div className="mb-4 flex items-center gap-2 text-white">
                <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Volver a Sesión
                </Button>
                <h1 className="text-lg font-semibold">Videoconferencia - Sala Profesional</h1>
            </div>

            <Card className="flex-1 bg-slate-900 border-slate-800 text-white overflow-hidden relative rounded-xl">
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
                        className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                </div>

                {/* Controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10 z-20">
                    <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 bg-white/10 hover:bg-white/20 text-white">
                        <Mic />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 bg-white/10 hover:bg-white/20 text-white">
                        <Video />
                    </Button>
                    <Button variant="destructive" size="icon" className="rounded-full h-12 w-12 bg-red-500 hover:bg-red-600 border-transparent shadow-lg text-white" onClick={() => router.back()}>
                        <PhoneOff />
                    </Button>
                </div>
            </Card>
        </div>
    );
}
