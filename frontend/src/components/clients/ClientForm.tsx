'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BookUser, Save, AlertCircle } from 'lucide-react';
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
});

type ClientFormValues = z.infer<typeof formSchema>;

interface ClientFormProps {
    initialData?: Partial<ClientFormValues>;
    onSubmit: (values: ClientFormValues) => Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
}

export function ClientForm({ initialData, onSubmit, onCancel, submitLabel = "Guardar Paciente" }: ClientFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: initialData?.firstName || "",
            lastName: initialData?.lastName || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            birthDate: initialData?.birthDate || "",
            emergencyContact: initialData?.emergencyContact || "",
            diagnosis: initialData?.diagnosis || "",
            riskLevel: initialData?.riskLevel || "LOW",
            notes: initialData?.notes || "",
        },
    });

    const handleSubmit = async (values: ClientFormValues) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await onSubmit(values);
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
