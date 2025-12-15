'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, Clock, User, FileText, MoreHorizontal, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SessionsAPI, Session, SessionStatus } from '@/lib/sessions-api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

import { useToast } from '@/hooks/use-toast';

export default function SessionsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            setIsLoading(true);
            const data = await SessionsAPI.getAll();
            setSessions(data);
        } catch (error) {
            console.error('Error loading sessions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: SessionStatus) => {
        switch (status) {
            case SessionStatus.SCHEDULED:
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Programada</Badge>;
            case SessionStatus.IN_PROGRESS:
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 animate-pulse">En Curso</Badge>;
            case SessionStatus.COMPLETED:
                return <Badge variant="outline" className="bg-gray-100 text-gray-700">Completada</Badge>;
            case SessionStatus.CANCELLED:
                return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">Cancelada</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredSessions = sessions.filter(session =>
        session.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.sessionType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sesiones</h1>
                    <p className="text-muted-foreground">Gestiona tus citas y sesiones terapéuticas.</p>
                </div>
                <Button onClick={() => router.push('/dashboard/sessions/new')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Nueva Sesión
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Próximas Sesiones</CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por paciente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">Cargando sesiones...</div>
                    ) : filteredSessions.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay sesiones</h3>
                            <p className="mt-1 text-sm text-gray-500">Comienza agendando una nueva sesión.</p>
                            <div className="mt-6">
                                <Button onClick={() => router.push('/dashboard/sessions/new')} variant="outline">
                                    <Plus className="mr-2 h-4 w-4" /> Nueva Sesión
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha / Hora</TableHead>
                                        <TableHead>Paciente</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSessions.map((session) => (
                                        <TableRow key={session.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">
                                                        {format(new Date(session.startTime), "d 'de' MMMM", { locale: es })}
                                                    </span>
                                                    <span className="text-sm text-gray-500 flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {format(new Date(session.startTime), "HH:mm")}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{session.clientName || 'Paciente'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="capitalize">
                                                    {session.sessionType.toLowerCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(session.status)}</TableCell>
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
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/sessions/${session.id}`} className="cursor-pointer flex items-center w-full">
                                                                <FileText className="mr-2 h-4 w-4" /> Ver Detalles
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600 cursor-pointer"
                                                            onClick={async () => {
                                                                if (!confirm('¿Estás seguro de cancelar esta sesión?')) return;
                                                                try {
                                                                    await SessionsAPI.update(session.id, { status: SessionStatus.CANCELLED });
                                                                    toast({
                                                                        title: "Sesión cancelada",
                                                                        description: "La sesión ha sido marcada como cancelada.",
                                                                    });
                                                                    loadSessions();
                                                                } catch (error) {
                                                                    console.error('Error cancelling session', error);
                                                                    toast({
                                                                        title: "Error",
                                                                        description: "No se pudo cancelar la sesión.",
                                                                        variant: "destructive",
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            Cancelar Cita
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
