'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, MoreHorizontal, FileText, Calendar, Trash2, Pencil } from 'lucide-react';
import { ClientsAPI, Client } from '@/lib/clients-api';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

export default function ClientsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchClients = async () => {
        try {
            setIsLoading(true);
            const data = await ClientsAPI.getAll();
            setClients(data);
        } catch (error) {
            console.error('Error fetching clients:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron cargar los pacientes',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este paciente? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            await ClientsAPI.delete(id);
            toast({
                title: 'Paciente eliminado',
                description: 'El paciente ha sido eliminado correctamente.',
            });
            fetchClients();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo eliminar el paciente',
                variant: 'destructive',
            });
        }
    };

    const filteredClients = clients.filter(client => {
        const searchLower = searchQuery.toLowerCase();
        return (
            client.firstName.toLowerCase().includes(searchLower) ||
            client.lastName.toLowerCase().includes(searchLower) ||
            client.email?.toLowerCase().includes(searchLower)
        );
    });

    const getRiskBadgeColor = (level: string) => {
        switch (level) {
            case 'LOW': return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
            case 'HIGH': return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
            case 'CRITICAL': return 'bg-red-100 text-red-800 hover:bg-red-100';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona tu lista de pacientes y sus historias clínicas.
                    </p>
                </div>
                <Button onClick={() => router.push('/dashboard/clients/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Paciente
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Listado de Pacientes</CardTitle>
                    <CardDescription>
                        Tienes un total de {clients.length} pacientes activos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center py-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre o email..."
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
                                    <TableHead className="w-[250px]">Paciente</TableHead>
                                    <TableHead>Estado / Riesgo</TableHead>
                                    <TableHead>Contacto</TableHead>
                                    <TableHead>Última Sesión</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Cargando pacientes...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredClients.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No se encontraron pacientes.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredClients.map((client) => (
                                        <TableRow key={client.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarFallback>
                                                            {client.firstName[0]}{client.lastName[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {client.firstName} {client.lastName}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {client.diagnosis || 'Sin diagnóstico'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant="secondary" className={getRiskBadgeColor(client.riskLevel)}>
                                                        {client.riskLevel}
                                                    </Badge>
                                                    {client.isActive ? (
                                                        <span className="text-xs text-green-600 flex items-center">
                                                            ● Activo
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">Inactivo</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span>{client.email || '-'}</span>
                                                    <span className="text-muted-foreground">{client.phone || '-'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {client.lastSessionAt ? new Date(client.lastSessionAt).toLocaleDateString() : 'Nunca'}
                                                </div>
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
                                                        <DropdownMenuItem onClick={() => router.push(`/dashboard/clients/${client.id}`)}>
                                                            <FileText className="mr-2 h-4 w-4" /> Ver expediente
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => router.push(`/dashboard/sessions/new?clientId=${client.id}`)}>
                                                            <Calendar className="mr-2 h-4 w-4" /> Agendar sesión
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => router.push(`/dashboard/clients/${client.id}/edit`)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600"
                                                            onClick={() => handleDelete(client.id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
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
