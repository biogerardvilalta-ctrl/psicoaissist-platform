'use client';

import { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, Lightbulb, Zap, Mic, AlertTriangle, Brain, PlusCircle, XCircle } from 'lucide-react';

const DEMO_SCRIPT = [
    {
        text: "Paciente: \"Siento que nadie me toma en serio en el trabajo.\"",
        type: 'transcription',
        duration: 2000
    },
    {
        text: "Sentimiento de invisibilidad", // Indicator
        type: 'insight',
        category: 'indicator',
        trait: 'mood' // for coloring
    },
    {
        text: "Terapeuta: \"Debe ser frustrante. Cuéntame más sobre eso.\"",
        type: 'transcription',
        duration: 2500
    },
    {
        text: "Validar la emoción subyacente", // Consideration
        type: 'insight',
        category: 'consideration'
    },
    {
        text: "Pac: \"Simplemente me callo y no digo nada.\"",
        type: 'transcription',
        duration: 1500
    },
    {
        text: "¿Qué temes que pasaría si hablaras?", // Question
        type: 'insight',
        category: 'question'
    }
];

export function HeroDemo() {
    const [displayedText, setDisplayedText] = useState('');
    const [currentStep, setCurrentStep] = useState(0);

    // State for the AI Assistant parts
    const [indicators, setIndicators] = useState<{ type: string; label: string }[]>([]);
    const [questions, setQuestions] = useState<string[]>([]);
    const [considerations, setConsiderations] = useState<string[]>([]);

    const [isListening, setIsListening] = useState(true);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const processStep = () => {
            if (currentStep >= DEMO_SCRIPT.length) {
                // Reset loop after a pause
                timeoutId = setTimeout(() => {
                    setDisplayedText('');
                    setIndicators([]);
                    setQuestions([]);
                    setConsiderations([]);
                    setCurrentStep(0);
                }, 4000);
                return;
            }

            const step = DEMO_SCRIPT[currentStep];

            if (step.type === 'transcription') {
                setIsListening(true);
                let charIndex = 0;
                const text = step.text as string;

                // For demo purposes, we append to text, or replace if it gets too long?
                // Let's just append for the stream effect.

                const typeChar = () => {
                    if (charIndex < text.length) {
                        setDisplayedText(prev => prev + text[charIndex]);
                        charIndex++;
                        timeoutId = setTimeout(typeChar, 30); // Typing speed
                    } else {
                        // Finished typing this segment
                        const hasMoreText = DEMO_SCRIPT.slice(currentStep + 1).some(s => s.type === 'transcription');
                        setDisplayedText(prev => prev + (hasMoreText ? "\n\n" : ""));
                        setCurrentStep(prev => prev + 1);
                    }
                };

                typeChar();
            } else if (step.type === 'insight') {
                // Add to specific category
                if (step.category === 'indicator') {
                    setIndicators(prev => [...prev, { type: step.trait || 'topic', label: step.text as string }]);
                } else if (step.category === 'question') {
                    setQuestions(prev => [...prev, step.text as string]);
                } else if (step.category === 'consideration') {
                    setConsiderations(prev => [...prev, step.text as string]);
                }
                setCurrentStep(prev => prev + 1);
            }
        };

        processStep();

        return () => clearTimeout(timeoutId);
    }, [currentStep]);

    return (
        <div className="relative mx-auto w-full max-w-lg font-sans">
            {/* Main AI Assistant Card Structure - larger and no scroll */}
            <div className="h-[630px] flex flex-col border-0 shadow-2xl rounded-xl bg-white/90 backdrop-blur-md overflow-hidden ring-1 ring-slate-200/50">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />

                {/* HEADER */}
                <div className="pb-3 shrink-0 relative z-10 border-b border-blue-100/50 p-6">
                    <div className="flex items-center justify-between text-indigo-700 font-bold tracking-tight">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-100 rounded-lg">
                                <Sparkles className="h-4 w-4 text-indigo-600" />
                            </div>
                            Asistente IA
                        </div>
                        <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0 text-[10px] font-semibold transition-colors text-emerald-600 h-5">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                            Live
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium text-xs mt-1">
                        Análisis en tiempo real • 100% Privado
                    </p>
                </div>

                {/* CONTENT - No scroll, larger area */}
                <div className="flex-1 flex flex-col pt-4 px-6 relative z-10 space-y-4">

                    {/* Simulated Context Stream (To show what AI is listening to) */}
                    {/* This is NOT in the real panel, but necessary for the demo to make sense. We style it minimally. */}
                    <div className="mb-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400 uppercase">
                            <Mic className="h-3 w-3" />
                            Transcripción en vivo
                        </div>
                        <div className="text-xs font-mono text-slate-600 h-[8.75rem] overflow-y-auto leading-relaxed opacity-80 whitespace-pre-wrap scrollbar-hide">
                            {displayedText}
                            <span className="animate-blink inline-block w-0.5 h-3 ml-1 bg-blue-500 align-middle"></span>
                        </div>
                    </div>

                    {/* INDICATORS AREA */}
                    {indicators.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-2 mb-1">
                                <Zap className="h-3 w-3 text-amber-500" />
                                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Observaciones</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {indicators.map((ind, i) => (
                                    <span
                                        key={i}
                                        className={`
                                            inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                                            pl-2 pr-3 py-1.5 shadow-sm select-none
                                            ${ind.type === 'risk' ? 'bg-red-50 text-red-700 border-red-100' : ''}
                                            ${ind.type === 'mood' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : ''}
                                            ${ind.type === 'topic' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : ''}
                                            ${!['risk', 'mood', 'topic'].includes(ind.type) ? 'bg-slate-100 text-slate-700 border-slate-200' : ''}
                                        `}
                                    >
                                        {ind.type === 'mood' && <Brain className="h-3 w-3 mr-1.5" />}
                                        {ind.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* QUESTIONS SECTION */}
                    {questions.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                            <div className="flex items-center gap-2 mb-1">
                                <MessageSquare className="h-3 w-3 text-blue-500" />
                                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Preguntas Sugeridas</h4>
                            </div>
                            <div className="space-y-3">
                                {questions.map((q, index) => (
                                    <div
                                        key={`q-${index}`}
                                        className="
                                            relative group cursor-pointer bg-white p-4 rounded-xl border border-slate-100 shadow-sm 
                                            hover:shadow-md hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-0.5
                                        "
                                    >
                                        <p className="text-sm text-slate-700 leading-relaxed pr-2">{q}</p>
                                        <div className="mt-3 flex items-center text-blue-500 text-xs font-medium">
                                            <PlusCircle className="h-3 w-3 mr-1" />
                                            Añadir a notas
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CONSIDERATIONS SECTION */}
                    {considerations.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                            <div className="flex items-center gap-2 mb-1">
                                <Lightbulb className="h-3 w-3 text-amber-500" />
                                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Consideraciones</h4>
                            </div>
                            <div className="space-y-3">
                                {considerations.map((c, index) => (
                                    <div key={`c-${index}`} className="group relative bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 text-sm">
                                        <p className="text-slate-700 leading-relaxed pr-4">{c}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-3 bg-slate-50/80 backdrop-blur-sm border-t border-slate-100 z-10 mt-auto">
                    <p className="text-[10px] text-center text-slate-400 font-medium">
                        Ia Assistance © 2025 • PsicoAIssist
                    </p>
                </div>
            </div>

            {/* Decorative background globs matched to Live panel vibes */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>
    );
}
