'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar,
    Plus,
    Search,
    Clock,
    MoreHorizontal,
    FileText,
    CheckCircle,
    User,
    XCircle,
    Play
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SessionsAPI, Session, SessionStatus } from '@/lib/sessions-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarView } from '@/components/dashboard/sessions/calendar-view';

export default function SessionsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('');
    const [patientFilter, setPatientFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const fetchSessions = async () => {
        try {
            setIsLoading(true);
            const data = await SessionsAPI.getAll();
            setSessions(data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron cargar las sesiones',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleCancel = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas cancelar esta sesión?')) return;
        try {
            await SessionsAPI.update(id, { status: SessionStatus.CANCELLED });
            toast({
                title: 'Sesión cancelada',
                description: 'La sesión ha sido cancelada correctamente.',
            });
            fetchSessions();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo cancelar la sesión',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta sesión?')) {
            return;
        }

        try {
            await SessionsAPI.delete(id);
            toast({
                title: 'Sesión eliminada',
                description: 'La sesión ha sido eliminada correctamente.',
            });
            fetchSessions();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo eliminar la sesión',
                variant: 'destructive',
            });
        }
    };

    // Filter sessions based on all filters
    const filteredSessions = sessions.filter(session => {
        // Date Filter
        if (dateFilter) {
            const sessionDate = format(new Date(session.startTime), 'yyyy-MM-dd');
            if (sessionDate !== dateFilter) return false;
        }

        // Patient Filter
        if (patientFilter) {
            const clientName = session.clientName ? session.clientName.toLowerCase() : '';
            if (!clientName.includes(patientFilter.toLowerCase())) return false;
        }

        // Type Filter
        if (typeFilter !== 'ALL') {
            if (session.sessionType !== typeFilter) return false;
        }

        // Status Filter
        if (statusFilter !== 'ALL') {
            if (session.status !== statusFilter) return false;
        }

        return true;
    });

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'default'; // primary/black
            case 'SCHEDULED': return 'outline';
            case 'CANCELLED': return 'destructive';
            case 'IN_PROGRESS': return 'secondary';
            default: return 'secondary';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'Completada';
            case 'SCHEDULED': return 'Programada';
            case 'CANCELLED': return 'Cancelada';
            case 'IN_PROGRESS': return 'En Curso';
            case 'NO_SHOW': return 'No asistió';
            default: return status;
        }
    };

    const getStatusClassName = (status: string) => {
        if (status === 'SCHEDULED') {
            return 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200';
        }
        return '';
    };

    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<any>('month'); // type any to avoid 'Views' import issue here if not needed

    // ... existing fetchSessions ...
    // Using getAll for now, can switch to filtered fetch if needed

    // ... existing useEffect ...

    // ... existing handlers (handleCancel, handleDelete) ...

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sesiones</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona tu agenda y el seguimiento de terapias.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => router.push('/dashboard/sessions/new')}>
                        <Plus className="mr-2 h-4 w-4" /> Agendar Nueva Sesión
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">Lista</TabsTrigger>
                    <TabsTrigger value="calendar">Calendario</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle>Agenda de Sesiones</CardTitle>
                            <CardDescription>
                                {sessions.length} sesiones registradas en total.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Fecha</label>
                                    <Input
                                        type="date"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Paciente</label>
                                    <Input
                                        placeholder="Buscar paciente..."
                                        value={patientFilter}
                                        onChange={(e) => setPatientFilter(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tipo</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                    >
                                        <option value="ALL">Todos</option>
                                        <option value="INDIVIDUAL">Individual</option>
                                        <option value="GROUP">Grupal</option>
                                        <option value="FAMILY">Familiar</option>
                                        <option value="COUPLE">Pareja</option>
                                        <option value="CONSULTATION">Consulta</option>
                                        <option value="EMERGENCY">Urgencia</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Estado</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="ALL">Todos</option>
                                        <option value="SCHEDULED">Programada</option>
                                        <option value="COMPLETED">Completada</option>
                                        <option value="CANCELLED">Cancelada</option>
                                        <option value="IN_PROGRESS">En Curso</option>
                                        <option value="NO_SHOW">No asistió</option>
                                    </select>
                                </div>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha y Hora</TableHead>
                                            <TableHead>Paciente</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center">
                                                    Cargando sesiones...
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredSessions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center">
                                                    No se encontraron sesiones.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredSessions.map((session) => (
                                                <TableRow
                                                    key={session.id}
                                                    className={`
                                                        ${session.status === 'SCHEDULED' ? 'bg-indigo-50 hover:bg-indigo-100 cursor-pointer border-l-4 border-l-indigo-500' : ''}
                                                        transition-colors
                                                    `}
                                                    onClick={() => {
                                                        const target = `/dashboard/sessions/${session.id}`;
                                                        router.push(target);
                                                    }}
                                                >
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium flex items-center gap-2">
                                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                {format(new Date(session.startTime), 'PPP', { locale: es })}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                                <Clock className="h-3 w-3" />
                                                                {format(new Date(session.startTime), 'p', { locale: es })}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium flex items-center gap-2">
                                                            <User className="h-3 w-3 text-muted-foreground" />
                                                            {session.clientName || 'Cliente desconocido'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{session.sessionType}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={getStatusBadgeVariant(session.status) as any}
                                                            className={getStatusClassName(session.status)}
                                                        >
                                                            {getStatusLabel(session.status)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Abrir menú</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                                {session.status === SessionStatus.SCHEDULED ? (
                                                                    <DropdownMenuItem onClick={() => router.push(`/dashboard/sessions/${session.id}?start=true`)}>
                                                                        <Play className="mr-2 h-4 w-4 text-blue-600" /> Iniciar sesión
                                                                    </DropdownMenuItem>
                                                                ) : (
                                                                    <DropdownMenuItem onClick={() => router.push(`/dashboard/sessions/${session.id}`)}>
                                                                        <FileText className="mr-2 h-4 w-4" /> Ver detalles
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {session.status === SessionStatus.SCHEDULED && (
                                                                    <DropdownMenuItem onClick={() => handleCancel(session.id)}>
                                                                        <XCircle className="mr-2 h-4 w-4 text-orange-500" /> Cancelar sesión
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-red-600 focus:text-red-600"
                                                                    onClick={() => handleDelete(session.id)}
                                                                >
                                                                    Eliminar
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="calendar">
                    <CalendarView
                        sessions={sessions}
                        onNavigate={setCurrentDate}
                        currentDate={currentDate}
                        view={view}
                        onViewChange={setView}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
