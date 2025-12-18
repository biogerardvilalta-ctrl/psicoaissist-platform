'use client';

import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Session, SessionStatus } from '@/lib/sessions-api';
import { useRouter } from 'next/navigation';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const locales = {
    'es': es,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarViewProps {
    sessions: Session[];
    onNavigate: (date: Date) => void;
    currentDate: Date;
    view: View;
    onViewChange: (view: View) => void;
}

import { useAuth } from '@/contexts/auth-context';

export function CalendarView({ sessions, onNavigate, currentDate, view, onViewChange }: CalendarViewProps) {
    const router = useRouter();
    const { user } = useAuth();

    // Calculate min/max times from user config or defaults
    const minTime = new Date();
    minTime.setHours(9, 0, 0); // Default 09:00

    const maxTime = new Date();
    maxTime.setHours(18, 0, 0); // Default 18:00

    if (user && user.workStartHour) {
        const [h, m] = user.workStartHour.split(':').map(Number);
        minTime.setHours(h, m, 0);
    }

    if (user && user.workEndHour) {
        const [h, m] = user.workEndHour.split(':').map(Number);
        maxTime.setHours(h, m, 0);
    }

    const events = sessions.map(session => ({
        id: session.id,
        title: `${session.clientName || 'Cliente'} - ${session.sessionType}`,
        start: new Date(session.startTime),
        end: session.endTime ? new Date(session.endTime) : new Date(new Date(session.startTime).getTime() + 60 * 60 * 1000), // Default 1 hour if no end time
        resource: session,
    }));

    const eventStyleGetter = (event: any) => {
        const session = event.resource as Session;
        let backgroundColor = '#3b82f6'; // blue-500 default
        let borderColor = '#2563eb';

        switch (session.status) {
            case SessionStatus.COMPLETED:
                backgroundColor = '#10b981'; // green-500
                borderColor = '#059669';
                break;
            case SessionStatus.CANCELLED:
                backgroundColor = '#ef4444'; // red-500
                borderColor = '#dc2626';
                break;
            case SessionStatus.SCHEDULED:
                backgroundColor = '#3b82f6'; // blue-500
                borderColor = '#2563eb';
                break;
            case SessionStatus.NO_SHOW:
                backgroundColor = '#f97316'; // orange-500
                borderColor = '#ea580c';
                break;
        }

        return {
            style: {
                backgroundColor,
                borderColor,
                borderRadius: '4px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    const handleSelectEvent = (event: any) => {
        router.push(`/dashboard/sessions/${event.id}`);
    };

    const handleSelectSlot = ({ start }: { start: Date }) => {
        // Navigate to new session with pre-filled date
        const dateStr = start.toISOString();
        router.push(`/dashboard/sessions/new?date=${dateStr}`);
    };

    return (
        <Card className="h-[700px] flex flex-col">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Calendario</CardTitle>
                        <CardDescription>Vista mensual y semanal de tus sesiones</CardDescription>
                    </div>
                    {/* Custom toolbar actions could go here if we override toolbar */}
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-4">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    culture="es"
                    views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                    view={view}
                    onView={onViewChange}
                    date={currentDate}
                    onNavigate={onNavigate}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    min={minTime}
                    max={maxTime}
                    selectable
                    messages={{
                        next: "Siguiente",
                        previous: "Anterior",
                        today: "Hoy",
                        month: "Mes",
                        week: "Semana",
                        day: "Día",
                        agenda: "Agenda",
                        date: "Fecha",
                        time: "Hora",
                        event: "Evento",
                        noEventsInRange: "No hay eventos en este rango.",
                    }}
                />
            </CardContent>
        </Card>
    );
}
