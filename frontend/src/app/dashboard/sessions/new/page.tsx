'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Loader2, Calendar as CalendarIcon, Clock, User, FileText, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SessionsAPI, SessionType } from '@/lib/sessions-api';
import { ClientsAPI, Client } from '@/lib/clients-api';

const formSchema = z.object({
    clientId: z.string().min(1, 'Debes seleccionar un paciente'),
    date: z.string().min(1, 'La fecha es requerida'),
    time: z.string().min(1, 'La hora es requerida'),
    sessionType: z.nativeEnum(SessionType, {
        required_error: 'El tipo de sesión es requerido',
    }),
    notes: z.string().optional(),
});

export default function NewSessionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get clientId and date from URL query param
    const preselectedClientId = searchParams.get('clientId') || '';
    const preselectedDateIso = searchParams.get('date');

    let defaultDate = format(new Date(), 'yyyy-MM-dd');
    let defaultTime = format(new Date(), 'HH:mm');

    if (preselectedDateIso) {
        try {
            const dateObj = new Date(preselectedDateIso);
            if (!isNaN(dateObj.getTime())) {
                defaultDate = format(dateObj, 'yyyy-MM-dd');
                defaultTime = format(dateObj, 'HH:mm');
            }
        } catch (e) {
            console.error('Invalid date param', e);
        }
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            clientId: preselectedClientId,
            date: defaultDate,
            time: defaultTime,
            sessionType: SessionType.INDIVIDUAL,
            notes: '',
        },
    });

    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    // Watch for date changes to fetch availability
    const selectedDate = form.watch('date');

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const data = await ClientsAPI.getAll();
                setClients(data);

                // If we have a preselected client ID that exists in the fetched list, set it
                if (preselectedClientId) {
                    const clientExists = data.find(c => c.id === preselectedClientId);
                    if (clientExists) {
                        form.setValue('clientId', preselectedClientId);
                    }
                }
            } catch (error) {
                console.error('Error fetching clients:', error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'No se pudieron cargar los pacientes.',
                });
            } finally {
                setIsLoadingClients(false);
            }
        };

        fetchClients();
    }, [toast, preselectedClientId, form]);

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!selectedDate) return;

            setIsLoadingSlots(true);
            try {
                // Ensure correct formatted date YYYY-MM-DD
                const data = await SessionsAPI.getAvailability(selectedDate);
                setAvailableSlots(data.slots);
            } catch (error) {
                console.error("Failed to fetch slots", error);
                // Optionally toast
            } finally {
                setIsLoadingSlots(false);
            }
        };

        fetchAvailability();
    }, [selectedDate]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            // Combine date and time into ISO string
            const dateTimeString = `${values.date}T${values.time}:00`;
            const startTime = new Date(dateTimeString).toISOString();

            await SessionsAPI.create({
                clientId: values.clientId,
                startTime: startTime,
                sessionType: values.sessionType,
                notes: values.notes,
            });

            toast({
                title: 'Sesión agendada',
                description: 'La sesión se ha creado correctamente.',
            });

            router.push('/dashboard/sessions');
            router.refresh();
        } catch (error) {
            console.error('Error creating session:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Ocurrió un error al crear la sesión.',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="container max-w-2xl py-6 mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Agendar Nueva Sesión</h1>
                <p className="text-gray-500">Programa una sesión para uno de tus pacientes.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detalles de la Sesión</CardTitle>
                    <CardDescription>
                        Completa la información para programar la cita.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* Client Selection */}
                            <FormField
                                control={form.control}
                                name="clientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Paciente</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isLoadingClients || !!preselectedClientId} // Disable if preselected to lock context, or allow change? Usually allow change is better, but if coming from specific client action, maybe lock. Let's keep enabled but default selected.
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={isLoadingClients ? "Cargando pacientes..." : "Seleccionar paciente"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {clients.map((client) => (
                                                    <SelectItem key={client.id} value={client.id}>
                                                        {client.firstName} {client.lastName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                {/* Date */}
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                                    <Input type="date" className="pl-9" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Time */}
                                <FormField
                                    control={form.control}
                                    name="time"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hora Disponible</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={isLoadingSlots}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={isLoadingSlots ? "Cargando horarios..." : "Seleccionar hora"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {availableSlots.length > 0 ? (
                                                        availableSlots.map((slot) => (
                                                            <SelectItem key={slot} value={slot}>
                                                                {slot}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                                            No hay horarios disponibles
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Session Type */}
                            <FormField
                                control={form.control}
                                name="sessionType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Sesión</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={SessionType.INDIVIDUAL}>Individual</SelectItem>
                                                <SelectItem value={SessionType.GROUP}>Grupal</SelectItem>
                                                <SelectItem value={SessionType.COUPLE}>Pareja</SelectItem>
                                                <SelectItem value={SessionType.FAMILY}>Familiar</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Notes */}
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notas preliminares (Opcional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Agregar notas o motivo de consulta..."
                                                className="resize-none min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Agendando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Agendar Sesión
                                        </>
                                    )}
                                </Button>
                            </div>

                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
