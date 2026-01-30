import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AudioRecorderProps {
    onAudioData: (blob: Blob) => void;
    onStreamData?: (blob: Blob) => void; // New prop for chunks
    isProcessing?: boolean;
    inputStream?: MediaStream | null; // New prop for external stream
}

export function AudioRecorder({ onAudioData, onStreamData, isProcessing = false, onRecordingStatusChange, isLimitReached = false, onLimitReachedAction, inputStream }: AudioRecorderProps & { onRecordingStatusChange?: (isRecording: boolean) => void, isLimitReached?: boolean, onLimitReachedAction?: () => void }) {
    const [isRecording, setIsRecording] = useState(false);

    const [recordingTime, setRecordingTime] = useState(0);
    const [permissionError, setPermissionError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const shouldRestartRef = useRef(true);
    const isLimitReachedRef = useRef(isLimitReached);

    // Sync ref
    useEffect(() => {
        isLimitReachedRef.current = isLimitReached;
    }, [isLimitReached]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    // Stop recording if limit reached
    useEffect(() => {
        if (isLimitReached && isRecording) {
            console.log('%c[AudioRecorder] Stopping because isLimitReached became TRUE', 'color: orange');
            stopRecording();
            onLimitReachedAction?.();
        }
    }, [isLimitReached, isRecording]);

    // ...
    const startRecording = async () => {
        console.log('startRecording called. isLimitReached:', isLimitReached);
        if (isLimitReached) {
            console.log('Triggering onLimitReachedAction');
            onLimitReachedAction?.();
            return;
        }

        try {
            let stream: MediaStream;

            if (inputStream) {
                stream = inputStream;
            } else {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            }

            let mimeType = 'audio/webm';
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                mimeType = 'audio/webm;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                mimeType = 'audio/mp4';
            }

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];
            shouldRestartRef.current = true; // Use ref

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);

                    // Prevention: Do not emit stream data if limit is reached
                    if (onStreamData && !isLimitReachedRef.current) {
                        onStreamData(event.data);
                    }
                }
            };

            mediaRecorder.onstop = () => {
                if (shouldRestartRef.current) {
                    // Periodic stop -> Restart
                    if (mediaRecorder.state === 'inactive') {
                        mediaRecorder.start();
                    }
                } else {
                    // Final stop -> Save full blob

                    // Prevention: If limit reached, discard blob to avoid transcription error on empty/partial files
                    if (isLimitReachedRef.current) {
                        console.log('[AudioRecorder] Limit reached, discarding final blob to prevent transcription error.');
                        if (!inputStream) stream.getTracks().forEach(track => track.stop());
                        return;
                    }

                    const blob = new Blob(chunksRef.current, { type: mimeType });
                    onAudioData(blob);
                    if (!inputStream) stream.getTracks().forEach(track => track.stop()); // Stop mic access
                }
            };

            mediaRecorder.start(); // No timeslice
            setIsRecording(true);
            onRecordingStatusChange?.(true);
            setPermissionError(null);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Error accessing microphone:', err);
            setPermissionError('No se pudo acceder al micrófono. Por favor verifica los permisos.');
        }
    };

    // Effect to manage the chunking interval when recording
    useEffect(() => {
        if (isRecording && mediaRecorderRef.current) {
            chunkIntervalRef.current = setInterval(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop(); // Triggers onstop, which restarts if shouldRestart=true
                }
            }, 5000); // 5 seconds interval
        }

        return () => {
            if (chunkIntervalRef.current) {
                clearInterval(chunkIntervalRef.current);
            }
        };
    }, [isRecording]);

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            // Signal onstop that this is the final stop
            // We need to access the 'shouldRestart' variable from closure? 
            // Better to use a ref or modify handling. 
            // Actually, we can't easily access the closure variable 'shouldRestart' from here.
            // Let's rely on a ref.
            shouldRestartRef.current = false;

            mediaRecorderRef.current.stop();
            setIsRecording(false);
            onRecordingStatusChange?.(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            if (chunkIntervalRef.current) {
                clearInterval(chunkIntervalRef.current);
                chunkIntervalRef.current = null;
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
