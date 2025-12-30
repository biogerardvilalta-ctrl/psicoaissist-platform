'use client';

import { useState, useEffect } from 'react';
import { Brain, Mic, Activity, CheckCircle2 } from 'lucide-react';

const DEMO_SCRIPT = [
    {
        text: "Paciente: \"Siento que nadie me toma en serio en el trabajo.\"",
        type: 'transcription',
        duration: 2000
    },
    {
        text: "Momento Clave: Sentimiento de autodesvalorización",
        type: 'insight',
        trait: 'Análisis',
        color: 'bg-purple-100 text-purple-700'
    },
    {
        text: "Terapeuta: \"Debe ser frustrante. Cuéntame más sobre eso.\"",
        type: 'transcription',
        duration: 2500
    },
    {
        text: "Punto Fuerte: Validación (Empatía)",
        type: 'insight',
        trait: 'Feedback',
        color: 'bg-green-100 text-green-700'
    },
    {
        text: "Pac: \"Simplemente me callo y no digo nada.\"",
        type: 'transcription',
        duration: 1500
    },
    {
        text: "Recomendación: Explorar patrón de evitación",
        type: 'insight',
        trait: 'Supervisor IA',
        color: 'bg-blue-100 text-blue-700'
    }
];

export function HeroDemo() {
    const [displayedText, setDisplayedText] = useState('');
    const [currentStep, setCurrentStep] = useState(0);
    const [insights, setInsights] = useState<Array<{ text: string, trait: string, color: string }>>([]);
    const [isListening, setIsListening] = useState(true);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const processStep = () => {
            if (currentStep >= DEMO_SCRIPT.length) {
                // Reset loop after a pause
                timeoutId = setTimeout(() => {
                    setDisplayedText('');
                    setInsights([]);
                    setCurrentStep(0);
                }, 3000);
                return;
            }

            const step = DEMO_SCRIPT[currentStep];

            if (step.type === 'transcription') {
                setIsListening(true);
                let charIndex = 0;
                const text = step.text as string;

                const typeChar = () => {
                    if (charIndex < text.length) {
                        setDisplayedText(prev => prev + text[charIndex]);
                        charIndex++;
                        timeoutId = setTimeout(typeChar, 50); // Typing speed
                    } else {
                        // Finished typing this segment
                        setCurrentStep(prev => prev + 1);
                    }
                };

                typeChar();
            } else if (step.type === 'insight') {
                // Flash insight
                const newInsight = {
                    text: step.text as string,
                    trait: step.trait as string,
                    color: step.color as string
                };
                setInsights(prev => [...prev, newInsight]);
                setCurrentStep(prev => prev + 1);
            }
        };

        processStep();

        return () => clearTimeout(timeoutId);
    }, [currentStep]);

    return (
        <div className="relative mx-auto w-full max-w-lg">
            {/* Main Interface Card */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100/50 backdrop-blur-sm">

                {/* Header / Status Bar */}
                <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
                        <span className="text-sm font-medium text-gray-600">
                            {isListening ? 'Escuchando en vivo...' : 'En pausa'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">00:14:23</span>
                        <Mic className="w-4 h-4 text-gray-400" />
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 h-[220px] bg-gray-50/50 flex flex-col relative overflow-hidden">

                    {/* Transcription Text */}
                    <div className="font-mono text-base leading-relaxed text-gray-700 whitespace-pre-wrap">
                        {displayedText}
                        <span className="animate-blink inline-block w-0.5 h-4 ml-1 bg-blue-500 align-middle"></span>
                    </div>

                    {/* Waveform Animation (Bottom Overlay) */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-4 gap-1">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-1 bg-blue-500/50 rounded-full animate-pulse`}
                                style={{
                                    height: `${Math.random() * 24 + 8}px`,
                                    animationDuration: `${Math.random() * 0.5 + 0.5}s`
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Insights / Analysis Panel (Simulated Floating popups) */}
                <div className="bg-white p-4 border-t border-gray-100 min-h-[80px]">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        <Brain className="w-3 h-3" />
                        Análisis en Tiempo Real
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {insights.map((insight, idx) => (
                            <div
                                key={idx}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border border-transparent shadow-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500 cursor-default ${insight.color}`}
                            >
                                <span className="opacity-75">{insight.trait}:</span>
                                {insight.text}
                                <CheckCircle2 className="w-3 h-3" />
                            </div>
                        ))}
                        {insights.length === 0 && (
                            <span className="text-sm text-gray-400 italic">Esperando datos...</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Trust Badges (Decorations) */}
            <div className="absolute -right-6 top-10 flex flex-col gap-3">
                <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 animate-in fade-in zoom-in duration-700 delay-1000">
                    <div className="bg-green-100 p-2 rounded-lg">
                        <ShieldIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Estado</p>
                        <p className="text-xs font-semibold text-gray-800">Encriptado</p>
                    </div>
                </div>
            </div>

            <div className="absolute -left-6 bottom-20">
                <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 animate-in fade-in zoom-in duration-700 delay-500">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Precisión</p>
                        <p className="text-xs font-semibold text-gray-800">98.5%</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ShieldIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
    )
}
