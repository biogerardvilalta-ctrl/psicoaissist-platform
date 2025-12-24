'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Square, Play, RotateCcw, User, UserCheck } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { simulatorService, PatientProfile } from '@/services/simulator.service';
import { useToast } from '@/hooks/use-toast';

export default function SimulatorPage() {
    const { toast } = useToast();
    // States: 'idle', 'loading', 'active', 'evaluating', 'finished'
    const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'evaluating' | 'finished'>('idle');
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [profile, setProfile] = useState<PatientProfile | null>(null);
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; parts: string }>>([]);
    const [feedback, setFeedback] = useState<string>('');
    const [metrics, setMetrics] = useState<{ empathy: number; intervention_effectiveness: number; professionalism: number } | null>(null);

    // Voice - Default to Catalan (ca-ES) as per user request
    const { isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechRecognition('ca-ES');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom only when new messages arrive.
    // Removed 'transcript' from deps to prevent jitter.
    useEffect(() => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    }, [messages]);

    // Update TTS as well
    const speak = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ca-ES'; // Match input language
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleStart = async () => {
        setStatus('loading');
        try {
            const newProfile = await simulatorService.startSimulation(difficulty);
            setProfile(newProfile);
            setMessages([]);
            setStatus('active');
            setMetrics(null);
            setFeedback('');

            toast({
                title: "Simulación iniciada",
                description: "El paciente está esperando."
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error al iniciar la simulación."
            });
            setStatus('idle');
        }
    };

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || !profile) return;

        const newMessages = [...messages, { role: 'user' as const, parts: text }];
        setMessages(newMessages);
        resetTranscript(); // Clear voice input

        try {
            const response = await simulatorService.sendMessage(text, messages, profile);

            const newerMessages = [...newMessages, { role: 'model' as const, parts: response.response }];
            setMessages(newerMessages);

            // Text to Speech
            speak(response.response);

        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error al obtener respuesta."
            });
        }
    };

    const handleStopRecording = () => {
        stopListening();
        // Small delay to ensure transcript is final?
        // But transcript state here is from hook.
        // We might need to wait for final transcript?
        // For now, use current transcript.
        if (transcript.trim()) {
            handleSendMessage(transcript);
        }
    };

    const handleEndSession = async () => {
        setStatus('evaluating');
        try {
            const res = await simulatorService.evaluateSession(messages);
            setFeedback(res.feedback);
            setMetrics(res.metrics);
            setStatus('finished');
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error al generar feedback."
            });
            setStatus('active'); // Go back if failed
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl h-[calc(100vh-4rem)] flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Simulador Clínico</h1>
                    <p className="text-gray-500">Practica tus habilidades con pacientes generados por IA.</p>
                </div>
                {status === 'active' && (
                    <Button variant="destructive" onClick={handleEndSession}>
                        <Square className="w-4 h-4 mr-2" />
                        Finalizar Sesión
                    </Button>
                )}
            </div>

            {/* ERROR / IDLE STATE */}
            {status === 'idle' && (
                <Card className="flex-1 flex flex-col items-center justify-center p-12 bg-gray-50/50 border-dashed">
                    <div className="text-center max-w-md space-y-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserCheck className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold">Configura tu Simulación</h2>
                        <p className="text-muted-foreground">
                            Selecciona el nivel de dificultad. El sistema generará un paciente con una patología y personalidad aleatoria.
                        </p>

                        <div className="grid grid-cols-3 gap-4 py-6">
                            {(['easy', 'medium', 'hard'] as const).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setDifficulty(level)}
                                    className={`p-4 rounded-lg border-2 transition-all capitalize
                                        ${difficulty === level
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-blue-200'}`}
                                >
                                    <span className="block font-bold mb-1">{level === 'easy' ? 'Fácil' : level === 'medium' ? 'Medio' : 'Difícil'}</span>
                                </button>
                            ))}
                        </div>

                        <Button size="lg" onClick={handleStart} className="w-full bg-blue-600 hover:bg-blue-700">
                            <Play className="w-4 h-4 mr-2" />
                            Comenzar Simulación
                        </Button>
                        <p className="text-xs text-gray-400 mt-4">
                            * Los pacientes son generados sintéticamente. No corresponden a personas reales.
                        </p>
                    </div>
                </Card>
            )}

            {status === 'loading' && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                        <p className="mt-4 text-gray-500">Generando perfil de paciente...</p>
                    </div>
                </div>
            )}

            {/* ACTIVE SESSION */}
            {status === 'active' && profile && (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 h-full overflow-hidden">
                    {/* Patient Profile Sidebar */}
                    <Card className="md:col-span-1 h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                {profile.name}
                            </CardTitle>
                            <CardDescription>{profile.age} años</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">Motivo de Consulta</h4>
                                <p className="text-sm font-medium">{profile.condition}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">Contexto</h4>
                                <p className="text-sm text-gray-600">{profile.scenario}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">Rasgos</h4>
                                <div className="flex flex-wrap gap-1">
                                    {(profile.traits || []).map(t => (
                                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chat Area */}
                    <Card className="md:col-span-3 flex flex-col h-full overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center text-gray-400 py-10">
                                    El paciente ha entrado en la sala. Puedes saludar.
                                </div>
                            )}
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-lg ${m.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                        }`}>
                                        {m.parts}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Controls */}
                        <div className="p-4 border-t bg-white">
                            {/* Transcript Preview */}
                            {transcript && (
                                <div className="mb-2 p-2 bg-gray-50 text-gray-500 italic text-sm rounded border">
                                    "{transcript}"
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <Button
                                    size="lg"
                                    variant={isListening ? "destructive" : "default"}
                                    onClick={isListening ? handleStopRecording : startListening}
                                    className={`w-full transition-all ${isListening ? 'animate-pulse' : ''}`}
                                >
                                    {isListening ? (
                                        <>
                                            <MicOff className="w-5 h-5 mr-2" />
                                            Detener y Enviar
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="w-5 h-5 mr-2" />
                                            Hablar (Mantener pulsado o click)
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* FEEDBACK & METRICS */}
            {status === 'finished' && (
                <div className="flex-1 overflow-y-auto space-y-6">
                    {/* Metrics Section */}
                    {metrics && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Empatía</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold mb-2 text-blue-600">{metrics.empathy}%</div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${metrics.empathy}%` }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Eficacia Clínica</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold mb-2 text-green-600">{metrics.intervention_effectiveness}%</div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${metrics.intervention_effectiveness}%` }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Profesionalidad</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold mb-2 text-purple-600">{metrics.professionalism}%</div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${metrics.professionalism}%` }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Informe de Supervisión Detallado</CardTitle>
                            <CardDescription>Generado por Supervisor Clínico IA</CardDescription>
                        </CardHeader>
                        <CardContent className="prose prose-blue max-w-none">
                            <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-6 rounded-lg leading-relaxed">
                                {feedback}
                            </div>
                        </CardContent>
                        <div className="p-6 border-t flex justify-end">
                            <Button onClick={() => setStatus('idle')} size="lg">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Nueva Simulación
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
