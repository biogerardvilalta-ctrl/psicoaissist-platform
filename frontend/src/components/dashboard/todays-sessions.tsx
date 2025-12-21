'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { SessionsAPI, Session, SessionStatus } from '@/lib/sessions-api';
import { ClientsAPI, Client } from '@/lib/clients-api';
import { Badge } from '@/components/ui/badge';
import { isToday, parseISO, compareAsc } from 'date-fns';

export function TodaysSessions() {
    const router = useRouter();
    const [sessions, setSessions] = useState<(Session & { clientName?: string })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allSessions, allClients] = await Promise.all([
                    SessionsAPI.getAll(),
                    ClientsAPI.getAll()
                ]);

                // Filter for today's sessions and not completed ones (or all?)
                // Usually "Assigned for today" implies pending or scheduled.
                const today = new Date();
                const todaysSessions = allSessions.filter(session => {
                    const sessionDate = parseISO(session.startTime);
                    return isToday(sessionDate) && session.status !== SessionStatus.CANCELLED;
                });

                // Attach client names and sort by time
                const enriched = todaysSessions.map(session => {
                    const client = allClients.find(c => c.id === session.clientId);
                    return {
                        ...session,
                        clientName: client ? `${client.firstName} ${client.lastName}` : 'Pacient Desconegut'
                    };
                }).sort((a, b) => compareAsc(parseISO(a.startTime), parseISO(b.startTime)));

                setSessions(enriched);
            } catch (error) {
                console.error("Error fetching today's sessions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleStartSession = (sessionId: string) => {
        router.push(`/dashboard/sessions/${sessionId}`);
    };

    if (loading) {
        return <div className="h-48 flex items-center justify-center text-sm text-gray-500">Cargando agenda...</div>;
    }

    return (
        <Card className="h-full border-blue-200 shadow-sm">
            <CardHeader className="pb-3 bg-blue-50/50">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-blue-900">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Agenda de Hoy
                        </CardTitle>
                        <CardDescription>
                            Tienes {sessions.length} sesiones programadas para hoy.
                        </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                {sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                        <div className="bg-gray-100 p-3 rounded-full mb-3">
                            <Calendar className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium">No hay sesiones para hoy.</p>
                        <p className="text-xs mt-1">Disfruta de tu día libre o planifica nuevas citas.</p>
                        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push('/dashboard/sessions/new')}>
                            Agendar Nueva
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between p-4 border rounded-lg bg-white hover:border-blue-300 transition-colors group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600 font-semibold text-center min-w-[70px]">
                                        <div className="text-xs uppercase text-blue-400">Hora</div>
                                        {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                            {session.clientName}
                                            {session.status === SessionStatus.COMPLETED && (
                                                <Badge variant="outline" className="text-green-600 text-[10px] h-5 px-1.5 border-green-200 bg-green-50">Completada</Badge>
                                            )}
                                        </h4>
                                        <div className="flex items-center text-xs text-gray-500 gap-3">

                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 50 min</span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    className={`${session.status === SessionStatus.COMPLETED ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-blue-600 hover:bg-blue-700'}`}
                                    onClick={() => handleStartSession(session.id)}
                                >
                                    {session.status === SessionStatus.COMPLETED ? 'Ver Detalle' : 'Iniciar'}
                                    {!session.status && <ArrowRight className="ml-2 h-4 w-4" />}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
