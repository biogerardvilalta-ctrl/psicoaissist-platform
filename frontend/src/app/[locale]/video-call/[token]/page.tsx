'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Video, Mic, MicOff, VideoOff, PhoneOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useWebRTC } from '@/hooks/use-webrtc';
import { useTranslations } from 'next-intl';

export default function VideoCallPage({ params }: { params: { token: string } }) {
    const t = useTranslations('VideoCall');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState(t('status.connecting'));
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [roomId, setRoomId] = useState<string | null>(null);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Initialize WebRTC Hook
    const { remoteStream, connectionStatus, networkQuality } = useWebRTC({
        socket,
        roomId,
        localStream,
        identity: 'guest'
    });

    // 1. Get Media Stream First
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

    // 2. Connect Socket ONLY when Stream is ready
    useEffect(() => {
        if (!localStream) return;

        const socketUrl = (process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001') + '/sessions';
        const newSocket = io(socketUrl);

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
            setStatus(t('status.joiningRoom'));
            newSocket.emit('join-video-room', { token: params.token });
        });

        newSocket.on('room-joined', (data) => {
            console.log('[PatientPage] Room Joined:', data);
            setStatus(`${t('status.connected')} ${data.peerCount || 0}`);
            setRoomId(data.roomId);
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
        <div className="fixed inset-0 top-16 w-full bg-slate-900 overflow-hidden">
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
                    <div className="text-slate-500 animate-pulse">{t('waitingVideo')}</div>
                )}

                <div className="absolute top-4 left-4 landscape:left-auto landscape:right-4 lg:landscape:left-4 lg:landscape:right-auto bg-black/50 px-3 py-1 rounded text-sm backdrop-blur-sm text-white z-10">
                    {status} ({connectionStatus})
                    {networkQuality !== 'unknown' && (
                        <span className={`ml-2 px-1.5 py-0.5 rounded textxs font-bold ${networkQuality === 'good' ? 'bg-green-500/20 text-green-400' :
                            networkQuality === 'fair' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                            }`}>
                            {networkQuality === 'good' ? t('quality.good') : networkQuality === 'fair' ? t('quality.fair') : t('quality.bad')}
                        </span>
                    )}
                </div>
            </div>

            {/* Self View (PIP) */}
            <div className="absolute top-24 md:top-4 landscape:top-4 right-4 landscape:right-auto landscape:left-4 lg:landscape:right-4 lg:landscape:left-auto w-32 h-24 sm:w-48 sm:h-36 bg-slate-700 rounded-lg border border-slate-600 shadow-xl overflow-hidden z-20">
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

            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 z-30 pointer-events-none landscape:right-4 landscape:left-auto landscape:bottom-auto landscape:top-1/2 landscape:-translate-y-1/2 landscape:flex-col landscape:gap-3 lg:landscape:flex-row lg:landscape:bottom-6 lg:landscape:left-0 lg:landscape:right-0 lg:landscape:top-auto lg:landscape:translate-y-0 lg:landscape:gap-6">
                <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50 flex gap-4 shadow-2xl pointer-events-auto landscape:flex-col landscape:gap-2 landscape:p-3 lg:landscape:flex-row lg:landscape:gap-4 lg:landscape:p-4">
                    <Button
                        variant={isAudioEnabled ? "outline" : "destructive"}
                        size="icon"
                        className={`rounded-full h-14 w-14 landscape:h-10 landscape:w-10 lg:landscape:h-14 lg:landscape:w-14 ${isAudioEnabled ? "bg-slate-700/50 border-slate-500 hover:bg-slate-600" : ""} text-white transition-all`}
                        onClick={toggleAudio}
                    >
                        {isAudioEnabled ? <Mic className="h-6 w-6 landscape:h-5 landscape:w-5 lg:landscape:h-6 lg:landscape:w-6" /> : <MicOff className="h-6 w-6 landscape:h-5 landscape:w-5 lg:landscape:h-6 lg:landscape:w-6" />}
                    </Button>

                    <Button
                        variant={isVideoEnabled ? "outline" : "destructive"}
                        size="icon"
                        className={`rounded-full h-14 w-14 landscape:h-10 landscape:w-10 lg:landscape:h-14 lg:landscape:w-14 ${isVideoEnabled ? "bg-slate-700/50 border-slate-500 hover:bg-slate-600" : ""} text-white transition-all`}
                        onClick={toggleVideo}
                    >
                        {isVideoEnabled ? <Video className="h-6 w-6 landscape:h-5 landscape:w-5 lg:landscape:h-6 lg:landscape:w-6" /> : <VideoOff className="h-6 w-6 landscape:h-5 landscape:w-5 lg:landscape:h-6 lg:landscape:w-6" />}
                    </Button>

                    <div className="w-px h-10 bg-slate-600/50 mx-2 self-center landscape:w-8 landscape:h-px landscape:my-1 lg:landscape:w-px lg:landscape:h-10 lg:landscape:mx-2 lg:landscape:my-0" />

                    <Button
                        variant="destructive"
                        size="icon"
                        className="rounded-full h-14 w-14 landscape:h-10 landscape:w-10 lg:landscape:h-14 lg:landscape:w-14 bg-red-600 hover:bg-red-700 border-transparent shadow-lg hover:scale-105 transition-all"
                        onClick={endCall}
                    >
                        <PhoneOff className="h-6 w-6 landscape:h-5 landscape:w-5 lg:landscape:h-6 lg:landscape:w-6" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
