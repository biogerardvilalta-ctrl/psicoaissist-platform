'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, MoreHorizontal, FileText, Calendar, Trash2, Pencil, PieChart, RefreshCcw } from 'lucide-react';
import { ClientsAPI, Client } from '@/lib/clients-api';
import { UserAPI } from '@/lib/user-api';
import { User } from '@/types/auth';
import { useRole } from '@/hooks/useRole';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('active');

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

    const fetchClients = useCallback(async (isActive: boolean) => {
        try {
            setIsLoading(true);
            const data = await ClientsAPI.getAll(isActive, isAgendaManager() ? selectedProfessionalId : undefined);
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
    }, [toast, isAgendaManager, selectedProfessionalId]); // Re-fetch when professional changes

    useEffect(() => {
        fetchClients(activeTab === 'active');
    }, [activeTab, fetchClients]);

    const handleArchive = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas archivar este paciente?')) {
            return;
        }

        try {
            await ClientsAPI.delete(id);
            toast({
                title: 'Paciente archivado',
                description: 'El paciente ha sido archivado correctamente.',
            });
            fetchClients(activeTab === 'active');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo archivar el paciente',
                variant: 'destructive',
            });
        }
    };

    const handleRestore = async (id: string) => {
        try {
            await ClientsAPI.restore(id);
            toast({
                title: 'Paciente restaurado',
                description: 'El paciente ha sido restaurado y movido a la lista de activos.',
            });
            fetchClients(activeTab === 'active'); // Refresh current list (item should disappear)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo restaurar el paciente',
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
            case 'LOW': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
            case 'MEDIUM': return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
            case 'HIGH': return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
            case 'CRITICAL': return 'bg-rose-100 text-rose-800 hover:bg-rose-100';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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

            {isAgendaManager() && managedProfessionals.length === 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                    <div className="flex-1">
                        <h4 className="font-medium text-amber-900">Atención: Sin datos visibles</h4>
                        <p className="text-sm text-amber-700">
                            No se muestran pacientes porque no tienes profesionales asignados.
                        </p>
                    </div>
                </div>
            )}

            <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="active">Activos</TabsTrigger>
                    <TabsTrigger value="archived">Archivados</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle>{activeTab === 'active' ? 'Listado de Pacientes Activos' : 'Pacientes Archivados'}</CardTitle>
                            <CardDescription>
                                {activeTab === 'active'
                                    ? `Tienes un total de ${clients.length} pacientes activos.`
                                    : `Tienes un total de ${clients.length} pacientes archivados.`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 py-4 flex-col sm:flex-row">
                                <div className="relative w-full max-w-sm">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre o email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>

                                {isAgendaManager() && (
                                    <div className="w-full sm:w-[250px]">
                                        <Select
                                            value={selectedProfessionalId}
                                            onValueChange={(val) => {
                                                setSelectedProfessionalId(val);
                                                // fetchClients triggered by useEffect dependency or manually?
                                                // Ideally useCallback dep catches it, but we need to trigger effect or call it.
                                                // Actually, fetchClients is in useEffect [activeTab, fetchClients]. 
                                                // fetchClients depends on selectedProfessionalId.
                                                // So changing state -> new fetchClients -> useEffect triggers.
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Filtrar por Profesional" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos los profesionales</SelectItem>
                                                {managedProfessionals.map(pro => (
                                                    <SelectItem key={pro.id} value={pro.id}>
                                                        {pro.firstName} {pro.lastName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
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
                                                    {activeTab === 'active'
                                                        ? 'No se encontraron pacientes activos.'
                                                        : 'No se encontraron pacientes archivados.'}
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
                                                                <span className="text-xs text-emerald-600 flex items-center">
                                                                    ● Activo
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground">Archivado</span>
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
                                                                {client.isActive && (
                                                                    <>
                                                                        <DropdownMenuItem onClick={() => router.push(`/dashboard/sessions/new?clientId=${client.id}`)}>
                                                                            <Calendar className="mr-2 h-4 w-4" /> Agendar sesión
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => router.push(`/dashboard/statistics?clientId=${client.id}`)}>
                                                                            <PieChart className="mr-2 h-4 w-4" /> Estadísticas
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => router.push(`/dashboard/clients/${client.id}/edit`)}>
                                                                            <Pencil className="mr-2 h-4 w-4" /> Editar
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            className="text-red-600 focus:text-red-600"
                                                                            onClick={() => handleArchive(client.id)}
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" /> Archivar
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                                {!client.isActive && (
                                                                    <DropdownMenuItem
                                                                        className="text-emerald-600 focus:text-emerald-600"
                                                                        onClick={() => handleRestore(client.id)}
                                                                    >
                                                                        <RefreshCcw className="mr-2 h-4 w-4" /> Restaurar
                                                                    </DropdownMenuItem>
                                                                )}
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
            </Tabs>
        </div>
    );
}
