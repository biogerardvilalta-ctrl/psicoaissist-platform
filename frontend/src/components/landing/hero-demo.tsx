'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, MessageSquare, Lightbulb, Zap, Mic, AlertTriangle, Brain, PlusCircle, XCircle } from 'lucide-react';

export function HeroDemo() {
    const t = useTranslations('Landing.HeroDemo');
    const [displayedText, setDisplayedText] = useState('');
    const [currentStep, setCurrentStep] = useState(0);

    const DEMO_SCRIPT = useMemo(() => [
        {
            text: t('patient_1'),
            type: 'transcription',
            duration: 2000
        },
        {
            text: t('insight_1'),
            type: 'insight',
            category: 'indicator',
            trait: 'mood'
        },
        {
            text: t('therapist_1'),
            type: 'transcription',
            duration: 2500
        },
        {
            text: t('insight_2'),
            type: 'insight',
            category: 'consideration'
        },
        {
            text: t('patient_2'),
            type: 'transcription',
            duration: 1500
        },
        {
            text: t('insight_3'),
            type: 'insight',
            category: 'question'
        }
    ], [t]);

    const [indicators, setIndicators] = useState<{ type: string; label: string }[]>([]);
    const [questions, setQuestions] = useState<string[]>([]);
    const [considerations, setConsiderations] = useState<string[]>([]);

    const [isListening, setIsListening] = useState(true);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const processStep = () => {
            if (currentStep >= DEMO_SCRIPT.length) {
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

                const typeChar = () => {
                    if (charIndex < text.length) {
                        const char = text[charIndex];
                        if (char) {
                            setDisplayedText(prev => prev + char);
                        }
                        charIndex++;
                        timeoutId = setTimeout(typeChar, 30);
                    } else {
                        const hasMoreText = DEMO_SCRIPT.slice(currentStep + 1).some(s => s.type === 'transcription');
                        setDisplayedText(prev => prev + (hasMoreText ? "\n\n" : ""));
                        setCurrentStep(prev => prev + 1);
                    }
                };

                typeChar();
            } else if (step.type === 'insight') {
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
    }, [currentStep, DEMO_SCRIPT]);

    return (
        <div className="relative mx-auto w-full max-w-md lg:max-w-lg font-sans">
            {/* Main AI Assistant Card */}
            <div className="h-[480px] sm:h-[560px] lg:h-[630px] flex flex-col border-0 shadow-elevated rounded-2xl bg-white/95 backdrop-blur-md overflow-hidden ring-1 ring-gray-200/50">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-transparent pointer-events-none rounded-2xl" />

                {/* HEADER */}
                <div className="pb-3 shrink-0 relative z-10 border-b border-gray-100/80 p-4 sm:p-5 lg:p-6">
                    <div className="flex items-center justify-between text-indigo-700 font-bold tracking-tight">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-50 rounded-lg ring-1 ring-inset ring-indigo-100">
                                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600" />
                            </div>
                            <span className="text-sm sm:text-base">{t('header')}</span>
                        </div>
                        <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-2xs font-semibold text-emerald-600">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                            {t('live')}
                        </div>
                    </div>
                    <p className="text-gray-500 font-medium text-2xs sm:text-xs mt-1">
                        {t('subheader')}
                    </p>
                </div>

                {/* CONTENT */}
                <div className="flex-1 flex flex-col pt-3 sm:pt-4 px-4 sm:px-5 lg:px-6 relative z-10 space-y-3 sm:space-y-4 overflow-y-auto scrollbar-hide">

                    {/* Simulated Context Stream */}
                    <div className="mb-1 p-2.5 sm:p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-1.5 sm:mb-2 text-2xs font-semibold text-gray-400 uppercase tracking-wider">
                            <Mic className="h-3 w-3" />
                            {t('live_transcription')}
                        </div>
                        <div className="text-2xs sm:text-xs font-mono text-gray-600 h-24 sm:h-32 lg:h-[8.75rem] overflow-y-auto leading-relaxed opacity-80 whitespace-pre-wrap scrollbar-hide">
                            {displayedText}
                            <span className="animate-blink inline-block w-0.5 h-3 ml-1 bg-primary align-middle" />
                        </div>
                    </div>

                    {/* INDICATORS AREA */}
                    {indicators.length > 0 && (
                        <div className="animate-fade-in-down">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Zap className="h-3 w-3 text-amber-500" />
                                <h4 className="text-2xs font-bold text-gray-400 uppercase tracking-widest">{t('observations')}</h4>
                            </div>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {indicators.map((ind, i) => (
                                    <span
                                        key={i}
                                        className={`
                                            inline-flex items-center rounded-full border px-2 sm:px-2.5 py-1 text-2xs sm:text-xs font-semibold shadow-card select-none
                                            ${ind.type === 'risk' ? 'bg-red-50 text-red-700 border-red-100' : ''}
                                            ${ind.type === 'mood' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : ''}
                                            ${ind.type === 'topic' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : ''}
                                            ${!['risk', 'mood', 'topic'].includes(ind.type) ? 'bg-gray-50 text-gray-700 border-gray-200' : ''}
                                        `}
                                    >
                                        {ind.type === 'mood' && <Brain className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />}
                                        {ind.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* QUESTIONS SECTION */}
                    {questions.length > 0 && (
                        <div className="animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-1.5">
                                <MessageSquare className="h-3 w-3 text-blue-500" />
                                <h4 className="text-2xs font-bold text-gray-400 uppercase tracking-widest">{t('suggested_questions')}</h4>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                                {questions.map((q, index) => (
                                    <div
                                        key={`q-${index}`}
                                        className="relative group cursor-pointer bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-card hover:shadow-soft hover:border-blue-200 transition-all duration-300 hover:-translate-y-0.5"
                                    >
                                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed pr-2">{q}</p>
                                        <div className="mt-2 sm:mt-3 flex items-center text-blue-500 text-2xs sm:text-xs font-medium">
                                            <PlusCircle className="h-3 w-3 mr-1" />
                                            {t('add_to_notes')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CONSIDERATIONS SECTION */}
                    {considerations.length > 0 && (
                        <div className="animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Lightbulb className="h-3 w-3 text-amber-500" />
                                <h4 className="text-2xs font-bold text-gray-400 uppercase tracking-widest">{t('considerations')}</h4>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                                {considerations.map((c, index) => (
                                    <div key={`c-${index}`} className="group relative bg-amber-50/50 p-3 sm:p-4 rounded-xl border border-amber-100/50 text-xs sm:text-sm">
                                        <p className="text-gray-700 leading-relaxed pr-4">{c}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-2.5 sm:p-3 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100 z-10 mt-auto">
                    <p className="text-2xs text-center text-gray-400 font-medium">
                        {t('footer')}
                    </p>
                </div>
            </div>

            {/* Decorative background blobs */}
            <div className="absolute -top-8 -right-8 w-24 sm:w-32 h-24 sm:h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob" />
            <div className="absolute -bottom-8 -left-8 w-24 sm:w-32 h-24 sm:h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000" />
        </div>
    );
}
