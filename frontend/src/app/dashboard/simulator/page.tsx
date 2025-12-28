"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Square, Play, RotateCcw, User, UserCheck, Settings2, BarChart3, History, Search, X } from 'lucide-react';
import { simulatorService, PatientProfile, SimulationReport, StatsData } from '@/services/simulator.service';
import { EvolutionChart } from './components/EvolutionChart';
import { ReportsHistory } from './components/ReportsHistory';

// Simple hook mock if not available, or assume it exists. 
// Given previous context, it likely exists or I should use standard web speech api. 
// I will implement a basic version inside if I can't find the file, but better to assume it was imported.
// Actually, looking at previous file view, it used `transcript` etc. 
// I will assume the hook is in '@/hooks/useSpeechRecognition' or similar. 
// If I get an error about this hook, I will fix it then. 
// For now, I will use a local implementation of the hook to be safe and self-contained if possible, 
// or try to import it if I knew where it was.
// The file view didn't show the import.
// I will assume it's a local helper or I need to implement basic speech rec logic.
// Let's implement a simple version of the hook here to avoid import errors if the file is missing/unknown.

const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            // @ts-ignore
            recognitionRef.current = new window.webkitSpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'es-ES';

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                let interim = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) setTranscript(prev => prev + ' ' + finalTranscript);
                setInterimTranscript(interim);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const startListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) { console.error(e); }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const resetTranscript = () => {
        setTranscript('');
        setInterimTranscript('');
    };

    return { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript };
};

export default function SimulatorPage() {
    const { toast } = useToast();
    const { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript } = useSpeechRecognition();

    // Main State
    const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'evaluating' | 'finished'>('idle');
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [showNonVerbalCues, setShowNonVerbalCues] = useState(true);
    const [profile, setProfile] = useState<PatientProfile | null>(null);
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; parts: string }>>([]);
    const [feedback, setFeedback] = useState<string>('');
    const [metrics, setMetrics] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('simulator');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Filter & History State
    const [reports, setReports] = useState<SimulationReport[] | null>(null);
    const [stats, setStats] = useState<StatsData | null>(null);
    const [selectedReport, setSelectedReport] = useState<SimulationReport | null>(null);
    const [statsPeriod, setStatsPeriod] = useState<string>('all');
    const [reportsFilter, setReportsFilter] = useState({
        period: 'all',
        date: ''
    });

    // TTS Settings
    const [ttsRate, setTtsRate] = useState(1);
    const [ttsPitch, setTtsPitch] = useState(1);
    const [showSettings, setShowSettings] = useState(false);

    // Scroll to bottom of chat
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messages.length > 0 && chatContainerRef.current) {
            const { current: container } = chatContainerRef;
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    // Load History
    const loadHistory = async () => {
        try {
            const [reportsData, statsData] = await Promise.all([
                simulatorService.getReports(reportsFilter),
                simulatorService.getStats(statsPeriod)
            ]);
            setReports(reportsData);
            setStats(statsData);
        } catch (error) {
            console.error("Error loading history:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo cargar el historial."
            });
        }
    };

    // Tab Change handler
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        if (value === 'history') {
            loadHistory();
        }
    };

    // Filter Effect
    useEffect(() => {
        if (activeTab === 'history') {
            const timer = setTimeout(() => {
                loadHistory();
            }, 500); // Debounce
            return () => clearTimeout(timer);
        }
    }, [statsPeriod, reportsFilter, activeTab]);

    const handleReportFilterChange = (key: string, value: string) => {
        setReportsFilter(prev => ({ ...prev, [key]: value }));
    };

    // Simulation Handlers
    const handleStart = async () => {
        setStatus('loading');
        try {
            const newProfile = await simulatorService.startSimulation(difficulty, showNonVerbalCues);
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

    const speak = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop previous
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES'; // Match input language
            utterance.rate = ttsRate;
            utterance.pitch = ttsPitch;
            window.speechSynthesis.speak(utterance);
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
        // Combine final and interim transcripts to ensure we capture everything
        const fullText = (transcript + ' ' + (interimTranscript || '')).trim();

        if (fullText) {
            handleSendMessage(fullText);
        }
    };

    const handleEndSession = async () => {
        setStatus('evaluating');
        try {
            // Using non-null assertion for profile because we are 'active' only if profile is set
            const res = await simulatorService.evaluateSession(messages, profile!);
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

    const isFixedLayout = activeTab === 'simulator';

    return (
        <div className={`container mx-auto p-6 max-w-5xl flex flex-col gap-6 ${isFixedLayout ? 'h-[calc(100vh-140px)] overflow-hidden' : 'h-auto min-h-[calc(100vh-140px)] pb-20'}`}>
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

            <Tabs defaultValue="simulator" className="flex-1 flex flex-col min-h-0" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="simulator">Simulador</TabsTrigger>
                    <TabsTrigger value="history">Historial y Progreso</TabsTrigger>
                </TabsList>

                {/* === SIMULATOR TAB === */}
                <TabsContent value="simulator" className="flex-1 flex flex-col min-h-0 data-[state=active]:flex">

                    {/* ERROR / IDLE STATE */}
                    {status === 'idle' && (
                        <Card className="flex-1 flex flex-col items-center justify-center p-12 bg-gray-50/50 border-dashed mt-4">
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

                                <div className="flex items-center space-x-2 py-4 justify-center">
                                    <Checkbox
                                        id="non-verbal"
                                        checked={showNonVerbalCues}
                                        onCheckedChange={(checked) => setShowNonVerbalCues(checked as boolean)}
                                    />
                                    <Label htmlFor="non-verbal" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Mostrar Micro-comportamientos (No verbales)
                                    </Label>
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
                        <div className="flex-1 flex items-center justify-center mt-4">
                            <div className="animate-pulse flex flex-col items-center">
                                <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-48"></div>
                                <p className="mt-4 text-gray-500">Generando perfil de paciente...</p>
                            </div>
                        </div>
                    )}

                    {/* ACTIVE SESSION */}
                    {status === 'active' && profile && (
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 h-full overflow-hidden mt-4">
                            {/* Patient Profile Sidebar */}
                            <Card className="md:col-span-1 flex flex-col h-full overflow-hidden">
                                <CardHeader className="shrink-0">
                                    <CardTitle className="flex items-start gap-2 break-words text-xl leading-tight">
                                        <User className="w-5 h-5 mt-1 shrink-0" />
                                        <span>{profile.name}</span>
                                    </CardTitle>
                                    <CardDescription>{profile.age} años</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
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
                                <div
                                    ref={chatContainerRef}
                                    className="flex-1 overflow-y-auto p-4 space-y-4"
                                >
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
                                </div>

                                {/* Controls */}
                                <div className="p-4 border-t bg-white">
                                    {/* Transcript Preview */}
                                    {(transcript || interimTranscript) && (
                                        <div className="mb-2 p-2 bg-gray-50 text-gray-500 italic text-sm rounded border">
                                            "{transcript} {interimTranscript}"
                                        </div>
                                    )}

                                    {/* Voice Settings Toggle */}
                                    <div className="flex justify-end mb-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowSettings(!showSettings)}
                                            className={`text-xs ${showSettings ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}
                                        >
                                            <Settings2 className="w-3 h-3 mr-1" />
                                            Ajustar Voz
                                        </Button>
                                    </div>

                                    {/* Voice Settings Panel */}
                                    {showSettings && (
                                        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100 grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 block mb-1">Velocidad ({ttsRate}x)</label>
                                                <input
                                                    type="range"
                                                    min="0.5"
                                                    max="1.5"
                                                    step="0.1"
                                                    value={ttsRate}
                                                    onChange={(e) => setTtsRate(parseFloat(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 block mb-1">Tono ({ttsPitch})</label>
                                                <input
                                                    type="range"
                                                    min="0.5"
                                                    max="2"
                                                    step="0.1"
                                                    value={ttsPitch}
                                                    onChange={(e) => setTtsPitch(parseFloat(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <form
                                            className="flex-1 flex gap-2"
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
                                                if (input.value.trim()) {
                                                    handleSendMessage(input.value);
                                                    input.value = '';
                                                }
                                            }}
                                        >
                                            <input
                                                name="message"
                                                type="text"
                                                placeholder="Escribe tu respuesta..."
                                                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                disabled={isListening}
                                            />
                                            <Button type="submit" size="sm" disabled={isListening}>
                                                Enviar
                                            </Button>
                                        </form>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2">
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
                        <div className="flex-1 overflow-y-auto space-y-6 mt-4 pr-2 pb-4">
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
                </TabsContent>

                {/* === HISTORY TAB === */}
                <TabsContent value="history" className="flex-1 overflow-y-auto mt-4 space-y-8 data-[state=active]:flex flex-col justify-start pb-6">
                    {/* Evolution Chart */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                Tu Evolución
                            </h2>
                            <Select value={statsPeriod} onValueChange={setStatsPeriod}>
                                <SelectTrigger className="w-[180px] focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Periodo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="week">Última Semana</SelectItem>
                                    <SelectItem value="month">Último Mes</SelectItem>
                                    <SelectItem value="year">Último Año</SelectItem>
                                    <SelectItem value="all">Todo el Historial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {stats ? (
                            <EvolutionChart data={stats.evolution} />
                        ) : (
                            <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
                                Cargando estadísticas...
                            </div>
                        )}
                    </div>

                    {/* Reports List */}
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <History className="w-5 h-5" />
                                Informes Archivados
                            </h2>

                            {/* Filters Bar */}
                            <div className="flex flex-wrap items-center gap-2">
                                <Select
                                    value={reportsFilter.period}
                                    onValueChange={(val) => handleReportFilterChange('period', val)}
                                >
                                    <SelectTrigger className="w-[140px] focus:ring-0 focus:ring-offset-0">
                                        <SelectValue placeholder="Periodo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="week">Última Semana</SelectItem>
                                        <SelectItem value="month">Último Mes</SelectItem>
                                        <SelectItem value="all">Todo</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="date"
                                    className="w-auto"
                                    value={reportsFilter.date}
                                    onChange={(e) => handleReportFilterChange('date', e.target.value)}
                                />
                                {(reportsFilter.date || reportsFilter.period !== 'all') && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setReportsFilter({ period: 'all', date: '' })}
                                        title="Limpiar filtros"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {reports ? (
                            <ReportsHistory reports={reports} onReportClick={setSelectedReport} />
                        ) : (
                            <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
                                Cargando historial...
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Report Details Modal */}
            <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Informe de Sesión: {selectedReport?.patientName}</DialogTitle>
                        <DialogDescription>
                            {selectedReport && new Date(selectedReport.createdAt).toLocaleString()} | Dificultad: {selectedReport?.difficulty}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReport && (
                        <div className="space-y-6 mt-4">
                            {/* Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-blue-600">{selectedReport.empathyScore}%</div>
                                    <div className="text-xs text-blue-800 uppercase font-semibold">Empatía</div>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-green-600">{selectedReport.effectivenessScore}%</div>
                                    <div className="text-xs text-green-800 uppercase font-semibold">Eficacia</div>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-purple-600">{selectedReport.professionalismScore}%</div>
                                    <div className="text-xs text-purple-800 uppercase font-semibold">Profesionalidad</div>
                                </div>
                            </div>

                            {/* Markdown Content */}
                            <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg">
                                <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                    {selectedReport.feedbackMarkdown || "No hay detalles disponibles para este informe."}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
