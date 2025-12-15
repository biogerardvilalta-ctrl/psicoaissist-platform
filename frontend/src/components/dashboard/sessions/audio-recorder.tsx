import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AudioRecorderProps {
    onAudioData: (blob: Blob) => void;
    onStreamData?: (blob: Blob) => void; // New prop for chunks
    isProcessing?: boolean;
}

export function AudioRecorder({ onAudioData, onStreamData, isProcessing = false }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);

    const [recordingTime, setRecordingTime] = useState(0);
    const [permissionError, setPermissionError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);
    // ...
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Mimetype selection for broader compatibility
            let mimeType = 'audio/webm';
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                mimeType = 'audio/webm;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                mimeType = 'audio/mp4';
            }

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                    // Emit chunk if listener exists
                    if (onStreamData) {
                        onStreamData(event.data);
                    }
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                onAudioData(blob);
                stream.getTracks().forEach(track => track.stop()); // Stop mic access
            };

            mediaRecorder.start(3000); // 3 seconds chunks for better real-time feel
            setIsRecording(true);
            setPermissionError(null);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Error accessing microphone:', err);
            setPermissionError('No se pudo acceder al micrófono. Por favor verifica los permisos.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            setRecordingTime(0);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Card className="border-slate-200">
            <CardContent className="p-4 flex flex-col items-center gap-3">
                {permissionError && (
                    <p className="text-xs text-red-500 text-center mb-2">{permissionError}</p>
                )}

                <div className="flex items-center gap-4">
                    {isRecording ? (
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span className="font-mono text-sm font-medium">{formatTime(recordingTime)}</span>
                        </div>
                    ) : (
                        <span className="text-sm text-slate-500">Listo para grabar</span>
                    )}
                </div>

                <div className="flex gap-2">
                    {!isRecording ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                            onClick={startRecording}
                            disabled={isProcessing}
                        >
                            <Mic className="h-4 w-4 text-blue-500" />
                            {isProcessing ? 'Procesando...' : 'Grabar Sesión'}
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            size="sm"
                            className="w-full gap-2"
                            onClick={stopRecording}
                        >
                            <Square className="h-4 w-4 fill-current" />
                            Detener
                        </Button>
                    )}
                </div>

                {isProcessing && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 animate-pulse">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Transcribiendo y analizando...
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
