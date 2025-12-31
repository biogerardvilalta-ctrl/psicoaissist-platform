'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BookUser, Save, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
    professionalId: z.string().optional(), // Required for Agenda Managers
    firstName: z.string().min(2, {
        message: "El nombre debe tener al menos 2 caracteres.",
    }),
    lastName: z.string().min(2, {
        message: "El apellido debe tener al menos 2 caracteres.",
    }),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    birthDate: z.string().optional(),
    emergencyContact: z.string().optional(),
    diagnosis: z.string().optional(),
    riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    notes: z.string().optional(),
    sendEmailReminders: z.boolean().default(true),
    consentData: z.boolean().default(false).refine(val => val === true, {
        message: "Debes obtener el consentimiento para el tratamiento de datos.",
    }),
    consentAI: z.boolean().default(false).refine(val => val === true, {
        message: "Debes informar sobre el uso de sistemas de IA.",
    }),
});

type ClientFormValues = z.infer<typeof formSchema>;

interface ClientFormProps {
    initialData?: Partial<ClientFormValues>;
    onSubmit: (values: ClientFormValues) => Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
    managedProfessionals?: Array<{ id: string; firstName: string; lastName: string }>;
    isAgendaManager?: boolean;
}

export function ClientForm({ initialData, onSubmit, onCancel, submitLabel = "Guardar Paciente", managedProfessionals = [], isAgendaManager = false }: ClientFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            professionalId: initialData?.professionalId || "",
            firstName: initialData?.firstName || "",
            lastName: initialData?.lastName || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            birthDate: initialData?.birthDate || "",
            emergencyContact: initialData?.emergencyContact || "",
            diagnosis: initialData?.diagnosis || "",
            riskLevel: initialData?.riskLevel || "LOW",
            notes: initialData?.notes || "",
            sendEmailReminders: initialData?.sendEmailReminders ?? true,
            consentData: false,
            consentAI: false,
        },
    });

    const handleSubmit = async (values: ClientFormValues) => {
        setIsSubmitting(true);
        setError(null);
        try {
            // Transform form booleans to API consents structure
            const apiValues = {
                ...values,
                consents: [
                    { consentType: 'DATA_STORAGE', granted: values.consentData },
                    { consentType: 'AI_PROCESSING', granted: values.consentAI }
                ]
            };
            await onSubmit(apiValues as any);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Ocurrió un error al guardar el cliente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookUser className="h-5 w-5 text-blue-600" />
                                Información Personal
                            </CardTitle>
                            <CardDescription>
                                Datos confidenciales del paciente. Esta información será cifrada.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            {/* Professional Selection (Agenda Managers only) */}
                            {isAgendaManager && (
                                <FormField
                                    control={form.control}
                                    name="professionalId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Profesional *</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar profesional" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {managedProfessionals.map((pro) => (
                                                        <SelectItem key={pro.id} value={pro.id}>
                                                            {pro.firstName} {pro.lastName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej. Juan" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Apellidos *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej. Pérez" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="correo@ejemplo.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Teléfono</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+34 600 000 000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="emergencyContact"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contacto de Emergencia</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nombre y teléfono" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-orange-600" />
                                Información Clínica Inicial
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="diagnosis"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Diagnóstico Preliminar</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej. Trastorno de ansiedad" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="riskLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nivel de Riesgo</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona un nivel" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="LOW">Bajo</SelectItem>
                                                    <SelectItem value="MEDIUM">Medio</SelectItem>
                                                    <SelectItem value="HIGH">Alto</SelectItem>
                                                    <SelectItem value="CRITICAL">Crítico</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notas Iniciales</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Observaciones importantes, motivo de consulta..."
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookUser className="h-5 w-5 text-green-600" />
                                Preferencias de Comunicación
                            </CardTitle>
                            <CardDescription>
                                Configura cómo se enviarán los recordatorios de citas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <FormField
                                control={form.control}
                                name="sendEmailReminders"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Recordatorios por Email</FormLabel>
                                            <CardDescription>
                                                Enviar recordatorios automáticos a la dirección de correo registrada.
                                            </CardDescription>
                                        </div>
                                        <FormControl>
                                            <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={field.onChange}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-blue-100 shadow-sm">
                        <CardHeader className="bg-blue-50/50">
                            <CardTitle className="flex items-center gap-2 text-blue-900">
                                <ShieldCheck className="h-5 w-5 text-blue-600" />
                                Consentimiento Informado (GDPR)
                            </CardTitle>
                            <CardDescription>
                                Es obligatorio registrar el consentimiento explícito del paciente antes de procesar sus datos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 pt-6">
                            <FormField
                                control={form.control}
                                name="consentData"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={field.onChange}
                                                className="h-4 w-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Tratamiento de Datos Personales
                                            </FormLabel>
                                            <FormDescription>
                                                El paciente autoriza el almacenamiento y tratamiento de sus datos personales y de salud en la plataforma.
                                            </FormDescription>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="consentAI"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={field.onChange}
                                                className="h-4 w-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Procesamiento mediante IA
                                            </FormLabel>
                                            <FormDescription>
                                                El paciente ha sido informado de que se utilizarán sistemas de Inteligencia Artificial como soporte a la sesión.
                                            </FormDescription>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" type="button" onClick={onCancel}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>Guardando...</>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> {submitLabel}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
