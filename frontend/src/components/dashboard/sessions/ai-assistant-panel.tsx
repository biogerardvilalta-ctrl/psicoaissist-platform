
'use client';

import { useState } from 'react';
import { Sparkles, Brain, MessageSquare, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AiAPI, AiAnalysisResult } from '@/lib/ai-api';
import { useToast } from '@/hooks/use-toast';

// ... imports ...
import { useEffect, useRef } from 'react';
import { AlertTriangle, Lightbulb } from 'lucide-react';

interface AiAssistantPanelProps {
    sessionId: string;
    isActive: boolean;
    liveContext?: string;
}

export function AiAssistantPanel({ sessionId, isActive, liveContext }: AiAssistantPanelProps) {
    const { toast } = useToast();
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [indicators, setIndicators] = useState<{ type: string; label: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Debounce ref
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleGetSuggestions = async (context: string) => {
        if (!context) return;
        setIsLoading(true);
        try {
            const result = await AiAPI.getSuggestions(context);
            if (result && result.suggestions) {
                setSuggestions(result.suggestions);
                setIndicators(result.indicators || []);
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
        }, 1500); // 1.5s debounce

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [liveContext]);

    // Initial load
    useEffect(() => {
        if (isActive && suggestions.length === 0) {
            handleGetSuggestions('Inicio de sesión');
        }
    }, [isActive]);


    if (!isActive) return null;

    return (
        <Card className="h-full border-blue-100 bg-blue-50/30">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Sparkles className="h-5 w-5" />
                    Asistente IA
                </CardTitle>
                <CardDescription>
                    {isLoading ? 'Analizando conversación...' : 'Sugerencias en tiempo real'}
                </CardDescription>
            </CardHeader>
            <CardContent>

                {/* Indicators Area - Enhanced Styling */}
                {indicators.length > 0 && (
                    <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                        <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Indicadores Detectados</h4>
                        <div className="flex flex-wrap gap-2">
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
                    </div>
                )}

                {suggestions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Brain className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Escuchando sesión...</p>
                    </div>
                ) : (
                    <div className="h-[300px] pr-4 overflow-y-auto custom-scrollbar">
                        <div className="space-y-3">
                            {suggestions.map((suggestion, index) => (
                                <div key={index} className="bg-white p-3 rounded-lg border shadow-sm text-sm animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex gap-2">
                                        <MessageSquare className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                        <p>{suggestion}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-4 text-xs text-center text-slate-400">
                    Se actualiza automáticamente al hablar...
                </div>
            </CardContent>
        </Card>
    );
}
