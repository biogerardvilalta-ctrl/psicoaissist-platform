'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Calendar,
    Plus,
    Search,
    Clock,
    MoreHorizontal,
    FileText,
    CheckCircle,
    User as UserIcon,
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
import { useRole } from '@/hooks/useRole';
import { UserAPI } from '@/lib/user-api';
import { User } from '@/types/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SessionsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('');
    const [patientFilter, setPatientFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Agenda Manager State
    const { isAgendaManager } = useRole();
    const [managedProfessionals, setManagedProfessionals] = useState<User[]>([]);
    const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('all');

    // Initialize from URL parameter if present
    useEffect(() => {
        const professionalIdFromUrl = searchParams.get('professionalId');
        if (professionalIdFromUrl) {
            setSelectedProfessionalId(professionalIdFromUrl);
        }
    }, [searchParams]);

    useEffect(() => {
        if (isAgendaManager()) {
            loadManagedProfessionals();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const loadManagedProfessionals = async () => {
        try {
            const pros = await UserAPI.getManagedProfessionals();
            setManagedProfessionals(pros);
        } catch (error) {
            console.error('Failed to load professionals', error);
        }
    };

    const fetchSessions = useCallback(async () => {
        try {
            setIsLoading(true);
            const filters: any = {}; // Type filters correctly if possible, or just build object
            if (isAgendaManager() && selectedProfessionalId !== 'all') {
                filters.professionalId = selectedProfessionalId;
            }
            const data = await SessionsAPI.getAll(filters);
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
    }, [toast, isAgendaManager, selectedProfessionalId]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

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
            // We use custom classNames for colors, so we can use 'outline' or 'secondary' as base
            default: return 'outline';
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
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200';
            case 'SCHEDULED': return 'bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-indigo-200';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200';
            case 'CANCELLED': return 'bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200';
            case 'NO_SHOW': return 'bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<any>('month'); // type any to avoid 'Views' import issue here if not needed

    // ... existing fetchSessions ...
    // Using getAll for now, can switch to filtered fetch if needed

    // ... existing useEffect ...

    // ... existing handlers (handleCancel, handleDelete) ...

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sesiones</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona tu agenda y el seguimiento de terapias.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    {isAgendaManager() && (
                        <div className="w-[200px]">
                            <Select
                                value={selectedProfessionalId}
                                onValueChange={(val) => setSelectedProfessionalId(val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrar por Profesional" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {managedProfessionals.map(pro => (
                                        <SelectItem key={pro.id} value={pro.id}>
                                            {pro.firstName} {pro.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <Button onClick={() => router.push('/dashboard/sessions/new')}>
                        <Plus className="mr-2 h-4 w-4" /> Agendar Nueva Sesión
                    </Button>
                </div>
            </div>
            {isAgendaManager() && managedProfessionals.length === 0 && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                    <div className="flex-1">
                        <h4 className="font-medium text-amber-900">Atención: Sin datos visibles</h4>
                        <p className="text-sm text-amber-700">
                            No se muestran sesiones porque no tienes profesionales asignados.
                        </p>
                    </div>
                </div>
            )}

            {isAgendaManager() ? (
                // Calendar-only view for Agenda Managers
                <CalendarView
                    sessions={sessions}
                    onNavigate={setCurrentDate}
                    currentDate={currentDate}
                    view={view}
                    onViewChange={setView}
                />
            ) : (
                // Full Tabs view for Psychologists
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
                                                                <UserIcon className="h-3 w-3 text-muted-foreground" />
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
            )}
        </div>
    );
}
