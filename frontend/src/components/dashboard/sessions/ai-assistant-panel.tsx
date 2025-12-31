

'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Brain, MessageSquare, PlusCircle, XCircle, AlertTriangle, Lightbulb, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Socket } from 'socket.io-client';

export interface AiAssistantPanelProps {
    sessionId: string;
    isActive: boolean;
    liveContext?: string;
    onSuggestionClick?: (text: string) => void;
    socket?: Socket | null; // Added socket prop
    isConnected?: boolean;
}

import { useAuthStore } from '@/store/auth-store';

// ... imports

export function AiAssistantPanel({ sessionId, isActive, liveContext, onSuggestionClick, socket, isConnected }: AiAssistantPanelProps) {
    const { toast } = useToast();
    const { user } = useAuthStore();

    // Check for advancedAnalytics feature (Pro/Business/Premium)
    // Basic plan does not have this feature in plan-features.ts
    // Assuming the user object has subscription.planType or features
    // Since we don't have PLAN_FEATURES on frontend easily, we check planType or specific feature flag if available
    // Ideally user object should have a 'features' array or we deduce it.
    // For now, let's assume 'basic' plan lacks it.

    const planType = user?.subscription?.planType || 'basic';
    const hasAdvancedAnalytics = planType !== 'basic' && planType !== 'demo';

    const [questions, setQuestions] = useState<string[]>([]);
    const [considerations, setConsiderations] = useState<string[]>([]);
    const [indicators, setIndicators] = useState<{ type: string; label: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Socket Listener
    useEffect(() => {
        if (!socket || !isActive) return;

        const handleAiSuggestions = (data: any) => {
            setIsLoading(false); // Stop loading when data arrives
            if (data) {
                // Update Questions - REPLACE strategy
                if (data.questions && data.questions.length > 0) {
                    setQuestions(data.questions.slice(0, 5));

                    // Simple toast notification for new content
                    setTimeout(() => {
                        toast({
                            description: "Noves suggerències disponibles",
                            className: "bg-blue-50 border-blue-200 text-blue-800",
                            duration: 2000,
                        });
                    }, 0);
                }

                // Update Considerations - REPLACE strategy
                if (data.considerations && data.considerations.length > 0) {
                    setConsiderations(data.considerations.slice(0, 3));
                }

                // Update Indicators - REPLACE strategy
                if (data.indicators && data.indicators.length > 0) {
                    setIndicators(data.indicators);
                }
            }
        };

        socket.on('aiSuggestions', handleAiSuggestions);

        return () => {
            socket.off('aiSuggestions', handleAiSuggestions);
        };
    }, [socket, isActive, toast]);


    // Emit updates when context changes (Throttled)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (!liveContext || !socket || !isActive) return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            if (isConnected) {
                setIsLoading(true); // Show loading while waiting for socket response
                socket.emit('updateNotes', { sessionId, notes: liveContext });
            }
        }, 1500); // 1.5s throttle to avoid spamming the backend

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [liveContext, socket, sessionId, isActive, isConnected]);


    if (!isActive) return null;

    return (
        <Card className="h-full flex flex-col border-0 shadow-lg bg-white/80 backdrop-blur-md overflow-hidden ring-1 ring-slate-200/50">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />

            <CardHeader className="pb-3 shrink-0 relative z-10 border-b border-blue-100/50">
                <CardTitle className="flex items-center justify-between text-indigo-700 font-bold tracking-tight">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-100 rounded-lg">
                            <Sparkles className="h-4 w-4 text-indigo-600" />
                        </div>
                        Asistente IA
                        {isLoading && hasAdvancedAnalytics && <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse ml-2" />}
                    </div>
                    {hasAdvancedAnalytics ? (
                        isConnected ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px] px-1.5 py-0 h-5">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" />
                                Live
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 text-[10px] px-1.5 py-0 h-5">
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mr-1" />
                                Offline
                            </Badge>
                        )
                    ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[10px] px-1.5 py-0 h-5">
                            Plan Básico
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium text-xs">
                    Anàlisi en temps real • 100% Privat
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 min-h-0 flex flex-col pt-4 relative z-10 overflow-y-auto custom-scrollbar space-y-6">

                {/* Indicators Area */}
                {indicators.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-3 w-3 text-amber-500" />
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Observacions</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {indicators.map((ind, i) => (
                                <Badge
                                    key={i}
                                    variant="secondary"
                                    className={`
                                        pl-2 pr-3 py-1.5 text-xs font-medium border shadow-sm transition-all hover:scale-105 select-none
                                        ${ind.type === 'risk' ? 'bg-red-50 text-red-700 border-red-100' : ''}
                                        ${ind.type === 'mood' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : ''}
                                        ${ind.type === 'topic' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : ''}
                                    `}
                                >
                                    {ind.type === 'risk' && <AlertTriangle className="h-3 w-3 mr-1.5" />}
                                    {ind.type === 'mood' && <Brain className="h-3 w-3 mr-1.5" />}
                                    {ind.type === 'topic' && <Lightbulb className="h-3 w-3 mr-1.5" />}
                                    {ind.label}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {questions.length === 0 && considerations.length === 0 ? (
                    <div className="text-center py-12 flex-1 flex flex-col justify-center items-center opacity-50">
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                            <Brain className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">Escoltant la sessió...</p>
                        <p className="text-xs text-slate-400 mt-1">Parla o escriu per rebre suggeriments</p>
                    </div>
                ) : (
                    <div className="space-y-6 pb-4">
                        {/* Questions Section */}
                        {questions.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <MessageSquare className="h-3 w-3 text-blue-500" />
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Preguntes Suggerides</h4>
                                </div>
                                <div className="space-y-3">
                                    {questions.map((q, index) => (
                                        <div
                                            key={`q-${index}`}
                                            onClick={() => {
                                                if (onSuggestionClick) onSuggestionClick(q);
                                                setQuestions(prev => prev.filter((_, i) => i !== index));
                                            }}
                                            className="
                                                relative group cursor-pointer bg-white p-4 rounded-xl border border-slate-100 shadow-sm 
                                                hover:shadow-md hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-0.5
                                                animate-in fade-in slide-in-from-bottom-4
                                            "
                                        >
                                            <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setQuestions(prev => prev.filter((_, i) => i !== index));
                                                    }}
                                                    className="bg-white rounded-full p-1 shadow-sm border border-slate-200 hover:bg-slate-50"
                                                >
                                                    <XCircle className="h-4 w-4 text-slate-400 hover:text-red-500" />
                                                </button>
                                            </div>

                                            <p className="text-sm text-slate-700 leading-relaxed pr-2">{q}</p>

                                            <div className="mt-3 flex items-center text-blue-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                <PlusCircle className="h-3 w-3 mr-1" />
                                                Afegir a notes
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Considerations Section */}
                        {considerations.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Lightbulb className="h-3 w-3 text-amber-500" />
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Consideracions</h4>
                                </div>
                                <div className="space-y-3">
                                    {considerations.map((c, index) => (
                                        <div key={`c-${index}`} className="group relative bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 text-sm animate-in fade-in slide-in-from-bottom-4">
                                            <button
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-amber-100 rounded-full"
                                                onClick={() => setConsiderations(prev => prev.filter((_, i) => i !== index))}
                                            >
                                                <XCircle className="h-3 w-3 text-amber-400 hover:text-red-500" />
                                            </button>
                                            <p className="text-slate-700 leading-relaxed pr-4">{c}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            <div className="p-3 bg-slate-50/80 backdrop-blur-sm border-t border-slate-100 z-10">
                <p className="text-[10px] text-center text-slate-400 font-medium">
                    Ia Assistance © 2025 • PsicoAIssist
                </p>
            </div>
        </Card>
    );
}
