'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Video, Mic, MicOff, VideoOff, PhoneOff } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function VideoCallPage({ params }: { params: { token: string } }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState('Conectando...');
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const socketUrl = (process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001') + '/sessions';
        const newSocket = io(socketUrl);

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
            setStatus('Uniéndose a la sala...');
            newSocket.emit('join-video-room', { token: params.token });
        });

        newSocket.on('room-joined', (data) => {
            setStatus('Conectado. Esperando al profesional...');
            // Here we would initialize WebRTC
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
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
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
    }, [params.token]);

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-4xl bg-slate-800 border-slate-700 text-white overflow-hidden relative aspect-video">

                {/* Main Video Area (Remote would go here, Local for now) */}
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                    <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded text-sm backdrop-blur-sm">
                        {status}
                    </div>
                </div>

                {/* Self View (PIP) - Mocked for now since main view is self */}
                <div className="absolute top-4 right-4 w-32 h-24 bg-slate-700 rounded border border-slate-600 shadow-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                        Tu imagen
                    </div>
                </div>

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-4">
                    <Button variant="outline" size="icon" className="rounded-full h-12 w-12 bg-slate-700 border-transparent hover:bg-slate-600 text-white">
                        <Mic />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full h-12 w-12 bg-slate-700 border-transparent hover:bg-slate-600 text-white">
                        <Video />
                    </Button>
                    <Button variant="destructive" size="icon" className="rounded-full h-12 w-12 bg-red-600 hover:bg-red-700 border-transparent">
                        <PhoneOff />
                    </Button>
                </div>
            </Card>

            <p className="mt-4 text-slate-400 text-sm">
                PsicoAIssist Secure Video Call
            </p>
        </div>
    );
}
