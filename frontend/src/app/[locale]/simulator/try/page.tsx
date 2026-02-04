'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Send, Loader2, Lock } from 'lucide-react';

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface PatientProfile {
    name: string;
    age: number;
    condition: string;
    traits: string[];
    scenario: string;
}

export default function PublicSimulatorPage() {
    const [profile, setProfile] = useState<PatientProfile | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLimitReached, setIsLimitReached] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const API_URL = envUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

    useEffect(() => {
        startDemo();
    }, []);

    useEffect(() => {
        // Use a small timeout to allow DOM layout to update before scrolling
        const timer = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
        }, 100);
        return () => clearTimeout(timer);
    }, [messages, isLoading]); // Scroll on new messages OR when loading state changes (e.g. typing indicator appears)

    const startDemo = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${API_URL}/api/v1/simulator/demo/start`);
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const data = await res.json();
            setProfile(data);
        } catch (error) {
            console.error("Failed to start demo", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !profile) return;
        if (messages.length >= 6) {
            setIsLimitReached(true);
            return;
        }

        const userMsg = { role: 'user' as const, text: input };
        const newHistory = [...messages, userMsg];
        setMessages(newHistory);
        setInput('');
        setIsLoading(true);

        try {
            const historyPayload = newHistory.map(m => ({ role: m.role, parts: m.text }));

            const res = await fetch(`${API_URL}/api/v1/simulator/demo/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.text,
                    history: historyPayload,
                    profile: profile
                })
            });

            const data = await res.json();

            if (data.response && data.response.includes("(Límite de la demo alcanzado")) {
                setIsLimitReached(true);
            } else {
                setMessages(prev => [...prev, { role: 'model', text: data.response }]);
            }

        } catch (error) {
            console.error("Chat error", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // h-[100dvh] ensures it fits the actual visible screen on mobile (addressing address bar resize)
        <div className="h-[100dvh] bg-gray-50 flex flex-col overflow-hidden">
            <Header />

            <main className="flex-1 flex flex-col w-full max-w-2xl mx-auto pt-16 sm:pt-20 pb-0 px-0 sm:px-4">

                {/* Chat Container */}
                <div className="flex-1 flex flex-col bg-white sm:rounded-xl shadow-lg border-x sm:border border-gray-200 overflow-hidden relative">

                    {/* Header Info */}
                    <div className="bg-white border-b border-gray-100 p-3 shrink-0 z-10">
                        {profile ? (
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        <h2 className="font-bold text-gray-800 text-sm leading-tight">{profile.name}, {profile.age}</h2>
                                    </div>
                                    <p className="text-xs text-indigo-600 font-medium mt-0.5">{profile.condition}</p>
                                </div>
                                <div className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                                    Demo
                                </div>
                            </div>
                        ) : (
                            <div className="h-10 animate-pulse bg-gray-100 rounded"></div>
                        )}
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                        {/* Voice Capability Note */}
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex items-start gap-3">
                            <span className="text-xl">🎙️</span>
                            <div>
                                <p className="text-sm font-medium text-blue-900">
                                    Nota para la demo:
                                </p>
                                <p className="text-sm text-blue-800">
                                    Esta versión es <strong>solo texto</strong>. La plataforma completa permite <strong>conversar por voz</strong> fluida en tiempo real.
                                </p>
                            </div>
                        </div>

                        {messages.length === 0 && !isLoading && (
                            <div className="text-center text-gray-400 mt-8 px-4">
                                <p className="mb-2 text-2xl">👋</p>
                                <p className="font-medium">Hola, soy Marta.</p>
                                <p className="text-sm mt-1">Estoy lista para empezar la sesión.</p>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-gray-50 text-gray-500 rounded-2xl px-4 py-2 text-sm flex items-center gap-2">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Escribiendo...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-1" />
                    </div>

                    {/* Limit Overlay */}
                    {isLimitReached && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-20 p-6 animate-in fade-in duration-500">
                            <div className="text-center w-full max-w-sm">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-blue-50">
                                    <Lock className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Sesión Finalizada</h3>
                                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                    Has alcanzado el límite de la demo gratuita.<br />
                                    Crea tu cuenta para ver el análisis clínico y acceder a todos los pacientes.
                                </p>
                                <div className="space-y-3">
                                    <Link href="/auth/register" className="block w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                                        Crear Cuenta Gratis
                                    </Link>
                                    <Link href="/pricing" className="block text-xs text-gray-500 hover:text-blue-600 font-medium">
                                        Ver planes y precios
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="bg-white border-t border-gray-100 p-3 shrink-0 safe-pb">
                        <form className="flex gap-2 max-w-full items-end" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Escribe tu mensaje..."
                                className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-3 text-[15px] focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none max-h-32 min-h-[46px]"
                                rows={1}
                                disabled={isLoading || isLimitReached}
                                style={{ height: 'auto', minHeight: '46px' }}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || isLimitReached || !input.trim()}
                                className="bg-blue-600 text-white w-[46px] h-[46px] rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-sm shrink-0"
                            >
                                <Send className="w-5 h-5 ml-0.5" />
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
