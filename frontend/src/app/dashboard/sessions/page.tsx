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
    XCircle
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

export default function SessionsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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

    // Filter sessions based on search query (client name or notes)
    const filteredSessions = sessions.filter(session => {
        const searchLower = searchQuery.toLowerCase();
        // Check if we have client data populated
        // The API returns client object inside session usually, but we need to check interface mapping
        // Assuming session.client exists based on typical ORM population, but let's check interface later.
        // For now, safe check:
        const clientName = session.clientName ? session.clientName.toLowerCase() : '';

        return (
            clientName.includes(searchLower) ||
            session.sessionType.toLowerCase().includes(searchLower)
        );
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

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sesiones</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona tu agenda y el seguimiento de terapias.
                    </p>
                </div>
                <Button onClick={() => router.push('/dashboard/sessions/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Agendar Nueva Sesión
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Agenda de Sesiones</CardTitle>
                    <CardDescription>
                        {sessions.length} sesiones registradas en total.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center py-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por cliente o tipo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
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
                                        <TableRow key={session.id}>
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
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Abrir menú</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => router.push(`/dashboard/sessions/${session.id}`)}>
                                                            <FileText className="mr-2 h-4 w-4" /> Ver detalles
                                                        </DropdownMenuItem>
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
        </div>
    );
}
