
'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Brain, MessageSquare, RefreshCw, XCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AiAPI, AiAnalysisResult } from '@/lib/ai-api';
import { useToast } from '@/hooks/use-toast';

export interface AiAssistantPanelProps {
    sessionId: string;
    isActive: boolean;
    liveContext?: string;
    onSuggestionClick?: (text: string) => void;
}

export function AiAssistantPanel({ sessionId, isActive, liveContext, onSuggestionClick }: AiAssistantPanelProps) {
    const { toast } = useToast();
    const [questions, setQuestions] = useState<string[]>([]);
    const [considerations, setConsiderations] = useState<string[]>([]);
    const [indicators, setIndicators] = useState<{ type: string; label: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Debounce ref
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleGetSuggestions = async (context: string) => {
        if (!context) return;
        setIsLoading(true);
        try {
            const result = await AiAPI.getSuggestions(context);
            if (result) {
                // Update Questions
                if (result.questions && result.questions.length > 0) {
                    setQuestions(prev => {
                        const incoming = result.questions;
                        const newUnique = incoming.filter(item => !prev.includes(item));
                        if (newUnique.length === 0) return prev;
                        return [...newUnique, ...prev];
                    });
                }

                // Update Considerations
                if (result.considerations && result.considerations.length > 0) {
                    setConsiderations(prev => {
                        const incoming = result.considerations;
                        const newUnique = incoming.filter(item => !prev.includes(item));
                        if (newUnique.length === 0) return prev;
                        return [...newUnique, ...prev];
                    });
                }

                // Update Indicators
                if (result.indicators && result.indicators.length > 0) {
                    setIndicators(prev => {
                        const incoming = result.indicators;
                        const newUniqueInds = incoming.filter(n => !prev.some(p => p.label === n.label));
                        if (newUniqueInds.length === 0) return prev;
                        return [...newUniqueInds, ...prev];
                    });
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-refresh when context changes
    useEffect(() => {
        if (!liveContext) return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            handleGetSuggestions(liveContext);
        }, 1000); // 1.0s debounce for faster reaction

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [liveContext]);

    // Initial load
    useEffect(() => {
        if (isActive && questions.length === 0 && considerations.length === 0) {
            handleGetSuggestions('Inicio de sesión');
        }
    }, [isActive]);


    if (!isActive) return null;

    return (
        <Card className="h-full border-blue-100 bg-blue-50/30 flex flex-col">
            <CardHeader className="pb-3 shrink-0">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Sparkles className="h-5 w-5" />
                    Asistente IA
                </CardTitle>
                <CardDescription>
                    {isLoading ? 'Analizando conversación...' : 'Sugerencias en tiempo real'}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 flex flex-col pt-0">

                {/* Indicators Area */}
                {indicators.length > 0 && (
                    <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                        <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Observacions orientatives (IA)</h4>
                        <p className="text-[11px] text-slate-500 mb-2 italic">
                            Durant el discurs apareixen expressions que alguns professionals consideren rellevants per a l’exploració clínica.
                        </p>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {indicators.map((ind, i) => (
                                <Badge
                                    key={i}
                                    variant="outline"
                                    className={`
                                        pl-2 pr-3 py-1 text-sm font-medium border-0 shadow-sm
                                        ${ind.type === 'risk' ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : ''}
                                        ${ind.type === 'mood' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : ''}
                                        ${ind.type === 'topic' ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' : ''}
                                    `}
                                >
                                    {ind.type === 'risk' && <AlertTriangle className="h-4 w-4 mr-1.5" />}
                                    {ind.type === 'mood' && <Brain className="h-4 w-4 mr-1.5" />}
                                    {ind.type === 'topic' && <Lightbulb className="h-4 w-4 mr-1.5" />}
                                    {ind.label}
                                </Badge>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-400">
                            (Elements descriptius basats en el contingut verbalitzat, sense valoració clínica.)
                        </p>
                    </div>
                )}

                {questions.length === 0 && considerations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground flex-1 flex flex-col justify-center">
                        <Brain className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Escuchando sesión...</p>
                    </div>
                ) : (
                    <div className="flex-1 pr-4 overflow-y-auto custom-scrollbar space-y-6">
                        {/* Questions Section */}
                        {questions.length > 0 && (
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Possibles preguntes a explorar</h4>
                                <div className="space-y-3">
                                    {questions.map((q, index) => (
                                        <div
                                            key={`q-${index}`}
                                            className="bg-white p-3 rounded-lg border shadow-sm text-sm animate-in fade-in slide-in-from-bottom-2 group relative cursor-pointer hover:bg-slate-50 transition-colors"
                                            onClick={() => {
                                                if (onSuggestionClick) onSuggestionClick(q);
                                                setQuestions(prev => prev.filter((_, i) => i !== index));
                                            }}
                                            title="Clic per afegir a notes"
                                        >
                                            <button
                                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-full transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setQuestions(prev => prev.filter((_, i) => i !== index));
                                                }}
                                                title="Descartar"
                                            >
                                                <XCircle className="h-4 w-4 text-slate-400 hover:text-red-500" />
                                            </button>
                                            <div className="flex gap-2 pr-4">
                                                <MessageSquare className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                                <p>{q}</p>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-2 italic text-right">Clic per afegir a notes</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Considerations Section */}
                        {considerations.length > 0 && (
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Altres elements a considerar</h4>
                                <div className="space-y-3">
                                    {considerations.map((c, index) => (
                                        <div key={`c-${index}`} className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 shadow-sm text-sm animate-in fade-in slide-in-from-bottom-2 group relative">
                                            <button
                                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-full transition-opacity"
                                                onClick={() => setConsiderations(prev => prev.filter((_, i) => i !== index))}
                                                title="Descartar"
                                            >
                                                <XCircle className="h-4 w-4 text-slate-400 hover:text-red-500" />
                                            </button>
                                            <div className="flex gap-2 pr-4">
                                                <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                                <p className="text-slate-700">{c}</p>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-2 italic text-right">Editable pel professional</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-4 pt-2 border-t border-blue-100 text-[10px] text-center text-slate-400 leading-tight shrink-0">
                    Aquestes aportacions tenen finalitat de suport professional. <br />
                    La decisió clínica correspon exclusivament al psicòleg.
                </div>
            </CardContent>
        </Card>
    );
}
