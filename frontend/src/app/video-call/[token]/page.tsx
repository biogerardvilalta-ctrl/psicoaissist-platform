'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Video, Mic, MicOff, VideoOff, PhoneOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useWebRTC } from '@/hooks/use-webrtc';

export default function VideoCallPage({ params }: { params: { token: string } }) {
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
        identity: 'guest'
    });

    // 1. Get Media Stream First
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

    // 2. Connect Socket ONLY when Stream is ready
    useEffect(() => {
        if (!localStream) return;

        const socketUrl = (process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001') + '/sessions';
        const newSocket = io(socketUrl);

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
            setStatus('Uniéndose a la sala...');
            newSocket.emit('join-video-room', { token: params.token });
        });

        newSocket.on('room-joined', (data) => {
            console.log('[PatientPage] Room Joined:', data);
            setStatus(`Conectado. Peers: ${data.peerCount || 0}`);
            setRoomId(data.roomId);
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
    }, [params.token, localStream]);

    // Attach remote stream when available
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

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
        window.location.href = '/'; // Simple redirect for guest
    };

    return (
        <div className="fixed inset-0 h-[100dvh] w-full bg-slate-900 overflow-hidden">
            {/* Main Video Area (Remote) */}
            <div className="absolute inset-0 bg-black flex items-center justify-center">
                {remoteStream ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="text-slate-500 animate-pulse">Esperando vídeo del profesional...</div>
                )}

                <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded text-sm backdrop-blur-sm text-white z-10">
                    {status} ({connectionStatus})
                </div>
            </div>

            {/* Self View (PIP) */}
            <div className="absolute top-4 right-4 w-32 h-24 sm:w-48 sm:h-36 bg-slate-700 rounded-lg border border-slate-600 shadow-xl overflow-hidden z-20">
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
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 z-30 pointer-events-none">
                <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50 flex gap-4 shadow-2xl pointer-events-auto">
                    <Button
                        variant={isAudioEnabled ? "outline" : "destructive"}
                        size="icon"
                        className={`rounded-full h-14 w-14 ${isAudioEnabled ? "bg-slate-700/50 border-slate-500 hover:bg-slate-600" : ""} text-white transition-all`}
                        onClick={toggleAudio}
                    >
                        {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                    </Button>

                    <Button
                        variant={isVideoEnabled ? "outline" : "destructive"}
                        size="icon"
                        className={`rounded-full h-14 w-14 ${isVideoEnabled ? "bg-slate-700/50 border-slate-500 hover:bg-slate-600" : ""} text-white transition-all`}
                        onClick={toggleVideo}
                    >
                        {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                    </Button>

                    <div className="w-px h-10 bg-slate-600/50 mx-2 self-center" />

                    <Button
                        variant="destructive"
                        size="icon"
                        className="rounded-full h-14 w-14 bg-red-600 hover:bg-red-700 border-transparent shadow-lg hover:scale-105 transition-all"
                        onClick={endCall}
                    >
                        <PhoneOff className="h-6 w-6" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
