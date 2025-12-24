import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition(lang: string = 'es-ES') {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const recognitionRef = useRef<any>(null); // Type 'any' because SpeechRecognition is not standard in TS yet

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = lang;

                recognition.onresult = (event: any) => {
                    let finalTrans = '';
                    let interimTrans = '';

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTrans += event.results[i][0].transcript;
                        } else {
                            interimTrans += event.results[i][0].transcript;
                        }
                    }

                    if (finalTrans) {
                        setTranscript(prev => prev + ' ' + finalTrans);
                    }
                    setInterimTranscript(interimTrans);
                };

                recognition.onerror = (event: any) => {
                    if (event.error === 'aborted') {
                        // Aborted is common when stopping manually or switching focus
                        console.warn('Speech recognition aborted');
                    } else if (event.error === 'no-speech') {
                        console.warn('No speech detected');
                        // Optionally allow retry?
                    } else {
                        console.error('Speech recognition error', event.error);
                        setIsListening(false);
                    }
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
            }
        }
    }, [lang]); // Added lang as dependency so it updates if changed. Removed isListening to avoid loops.

    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            setTranscript('');
            setInterimTranscript('');
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error("Error starting recognition", e);
                // Usually means it's already started
            }
        } else {
            alert("Your browser does not support speech recognition.");
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
        supported: typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    };
}
