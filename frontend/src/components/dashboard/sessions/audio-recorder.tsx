import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export interface AudioRecorderHandle {
    startRecording: () => void;
    stopRecording: () => void;
    isRecording: boolean;
}

interface AudioRecorderProps {
    onAudioData: (blob: Blob) => void;
    onStreamData?: (blob: Blob) => void; // New prop for chunks
    isProcessing?: boolean;
    inputStream?: MediaStream | null; // New prop for external stream
    onRecordingStatusChange?: (isRecording: boolean) => void;
    isLimitReached?: boolean;
    onLimitReachedAction?: () => void;
    hideControls?: boolean; // New prop to hide internal buttons
}

export const AudioRecorder = forwardRef<AudioRecorderHandle, AudioRecorderProps>(({
    onAudioData,
    onStreamData,
    isProcessing = false,
    onRecordingStatusChange,
    isLimitReached = false,
    onLimitReachedAction,
    inputStream,
    hideControls = false
}, ref) => {
    const t = useTranslations('AudioRecorder');
    const [isRecording, setIsRecording] = useState(false);

    const [recordingTime, setRecordingTime] = useState(0);
    const [permissionError, setPermissionError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRecorderRef = useRef<MediaRecorder | null>(null); // New recorder for chunks
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const shouldRestartRef = useRef(true);
    const isLimitReachedRef = useRef(isLimitReached);
    const streamRef = useRef<MediaStream | null>(null); // Keep reference to stream

    // Sync ref
    useEffect(() => {
        isLimitReachedRef.current = isLimitReached;
    }, [isLimitReached]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        startRecording: () => startRecording(),
        stopRecording: () => stopRecording(),
        isRecording: isRecording
    }));

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            stopRecordersAndTracks();
        };
    }, []);

    const stopRecordersAndTracks = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (streamRecorderRef.current && streamRecorderRef.current.state !== 'inactive') {
            streamRecorderRef.current.stop();
        }
        if (streamRef.current && !inputStream) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    // Stop recording if limit reached
    useEffect(() => {
        if (isLimitReached && isRecording) {
            console.log('%c[AudioRecorder] Stopping because isLimitReached became TRUE', 'color: orange');
            stopRecording();
            onLimitReachedAction?.();
        }
    }, [isLimitReached, isRecording]);

    const startStreamCheckLoop = (recorder: MediaRecorder) => {
        // Start the stream recorder for a chunk
        try {
            if (recorder.state === 'inactive') {
                recorder.start();
                // Schedule stop in 5 seconds
                setTimeout(() => {
                    if (shouldRestartRef.current && recorder.state === 'recording') {
                        recorder.stop();
                    }
                }, 5000);
            }
        } catch (e) {
            console.error("Error in stream loop:", e);
        }
    };

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
            streamRef.current = stream;

            let mimeType = 'audio/webm';
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                mimeType = 'audio/webm;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                mimeType = 'audio/mp4';
            }

            // 1. Setup Main Recorder (Archival)
            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                // Final full blob assembly
                if (isLimitReachedRef.current) {
                    console.log('[AudioRecorder] Limit reached, discarding final blob.');
                } else {
                    const blob = new Blob(chunksRef.current, { type: mimeType });
                    onAudioData(blob);
                }
                if (!inputStream) stream.getTracks().forEach(track => track.stop());
            };

            // 2. Setup Stream Recorder (AI Chunks)
            const streamRecorder = new MediaRecorder(stream, { mimeType });
            streamRecorderRef.current = streamRecorder;
            shouldRestartRef.current = true;

            streamRecorder.ondataavailable = (event) => {
                // We get the data on stop (or timeslice if we used it, but here we use stop/start)
                // If we use stop(), this event fires with the full blob since start()
                if (event.data.size > 0 && onStreamData && !isLimitReachedRef.current) {
                    onStreamData(event.data);
                }
            };

            streamRecorder.onstop = () => {
                // When this recorder stops, it means a chunk is finished. 
                // Immediately restart it if we are still recording.
                if (shouldRestartRef.current) {
                    startStreamCheckLoop(streamRecorder);
                }
            };


            // Start both
            mediaRecorder.start(1000); // Main recorder gathers chunks every 1s for safety/memory
            startStreamCheckLoop(streamRecorder); // Starts the ping-pong loop

            setIsRecording(true);
            onRecordingStatusChange?.(true);
            setPermissionError(null);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Error accessing microphone:', err);
            setPermissionError(t('permissionError'));
        }
    };

    const stopRecording = () => {
        shouldRestartRef.current = false; // Stop the loop

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        if (streamRecorderRef.current && streamRecorderRef.current.state !== 'inactive') {
            streamRecorderRef.current.stop();
        }

        setIsRecording(false);
        onRecordingStatusChange?.(false);

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setRecordingTime(0);
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
                        <span className="text-sm text-slate-500">
                            {hideControls ? t('readyToRecordWithControls') : t('readyToRecord')}
                        </span>
                    )}
                </div>

                {!hideControls && (
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
                                {isProcessing ? t('processing') : t('recordSession')}
                            </Button>
                        ) : (
                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-full gap-2"
                                onClick={stopRecording}
                            >
                                <Square className="h-4 w-4 fill-current" />
                                {t('stop')}
                            </Button>
                        )}
                    </div>
                )}

                {isProcessing && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 animate-pulse">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        {t('transcribingAndAnalyzing')}
                    </div>
                )}
            </CardContent>
        </Card>
    );
});

AudioRecorder.displayName = 'AudioRecorder';
