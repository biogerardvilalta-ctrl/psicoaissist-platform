'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Calendar, FileText, Phone, Mail, Clock, Shield } from 'lucide-react';
import { ClientsAPI, Client } from '@/lib/clients-api';
import { SessionsAPI, Session } from '@/lib/sessions-api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ClientDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const [client, setClient] = useState<Client | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch Client and All Sessions simultaneously
                const [clientData, allSessions] = await Promise.all([
                    ClientsAPI.getById(params.id),
                    SessionsAPI.getAll()
                ]);

                setClient(clientData);

                // Check correct ID and filter
                // Note: SessionsAPI.getAll returns session.clientId which should match params.id
                const filtered = allSessions.filter(s => s.clientId === params.id);
                setSessions(filtered);

            } catch (error) {
                console.error('Error loading data:', error);
                toast({
                    title: "Error",
                    description: "No se pudo cargar la información.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            loadData();
        }
    }, [params.id, toast]);

    if (isLoading) return <div className="p-6">Cargando información...</div>;
    if (!client) return <div className="p-6">Paciente no encontrado</div>;

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'LOW': return 'bg-green-100 text-green-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            case 'HIGH': return 'bg-orange-100 text-orange-800';
            case 'CRITICAL': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="text-lg bg-blue-100 text-blue-700">
                                {client.firstName[0]}{client.lastName[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                {client.firstName} {client.lastName}
                                <Badge className={getRiskColor(client.riskLevel)} variant="outline">
                                    {client.riskLevel}
                                </Badge>
                            </h1>
                            <p className="text-muted-foreground text-sm flex items-center gap-2">
                                ID: {client.id.slice(0, 8)}...
                                {client.isActive ? (
                                    <span className="text-green-600 text-xs flex items-center gap-1">● Activo</span>
                                ) : (
                                    <span className="text-gray-400 text-xs">Inactivo</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push(`/dashboard/sessions/new?clientId=${client.id}`)}>
                        <Calendar className="mr-2 h-4 w-4" /> Nueva Sesión
                    </Button>
                    <Button variant="default">
                        <Edit className="mr-2 h-4 w-4" /> Editar
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="info" className="w-full">
                <TabsList>
                    <TabsTrigger value="info">Información General</TabsTrigger>
                    <TabsTrigger value="sessions">Sesiones ({sessions.length})</TabsTrigger>
                    <TabsTrigger value="notes">Notas y Documentos</TabsTrigger>
                </TabsList>

                {/* Info Tab */}
                <TabsContent value="info" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Datos de Contacto</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{client.email || "No registrado"}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{client.phone || "No registrado"}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Información Clínica</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <span className="text-sm text-muted-foreground block">Diagnóstico Principal</span>
                                    <span className="font-medium">{client.diagnosis || "No especificado"}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground block">Última Sesión</span>
                                    <span>
                                        {(() => {
                                            const lastSessionDate = client.lastSessionAt
                                                ? new Date(client.lastSessionAt)
                                                : sessions.length > 0
                                                    ? new Date(Math.max(...sessions.map(s => new Date(s.startTime).getTime())))
                                                    : null;

                                            return lastSessionDate
                                                ? format(lastSessionDate, "PPP", { locale: es })
                                                : "Sin sesiones previas";
                                        })()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Notas Privadas</CardTitle>
                            <CardDescription>Notas visibles solo para ti.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {client.notes || "No hay notas registradas para este paciente."}
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Sessions Tab */}
                <TabsContent value="sessions" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Sesiones</CardTitle>
                            <CardDescription>Sesiones realizadas con {client.firstName}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {sessions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    <p>No hay sesiones registradas.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sessions.map((session) => (
                                            <TableRow key={session.id}>
                                                <TableCell>{format(new Date(session.startTime), "PPP", { locale: es })}</TableCell>
                                                <TableCell className="capitalize">{session.sessionType.toLowerCase()}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{session.status}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/sessions/${session.id}`)}>Ver Detalle</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notes Tab Placeholder */}
                <TabsContent value="notes" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Documentos y Archivos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                <p>No hay documentos adjuntos.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
