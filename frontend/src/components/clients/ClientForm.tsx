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
import { UpgradeModal } from '@/components/shared/UpgradeModal';

import { useTranslations } from 'next-intl';

// Schema generator function to allow translations
const createFormSchema = (t: any) => z.object({
    professionalId: z.string().optional(), // Required for Agenda Managers
    firstName: z.string().min(2, {
        message: t('validation.firstNameMin'),
    }),
    lastName: z.string().min(2, {
        message: t('validation.lastNameMin'),
    }),
    email: z.string().email({ message: t('validation.emailInvalid') }).optional().or(z.literal('')),
    phone: z.string().optional(),
    birthDate: z.string().optional(),
    emergencyContact: z.string().optional(),
    diagnosis: z.string().optional(),
    riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    notes: z.string().optional(),
    sendEmailReminders: z.boolean().default(true),
    consentData: z.boolean().default(false).refine(val => val === true, {
        message: t('validation.consentDataRequired'),
    }),
    consentAI: z.boolean().default(false).refine(val => val === true, {
        message: t('validation.consentAIRequired'),
    }),
});

type ClientFormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface ClientFormProps {
    initialData?: Partial<ClientFormValues>;
    onSubmit: (values: ClientFormValues) => Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
    managedProfessionals?: Array<{ id: string; firstName: string; lastName: string }>;
    isAgendaManager?: boolean;
}

export function ClientForm({ initialData, onSubmit, onCancel, submitLabel, managedProfessionals = [], isAgendaManager = false }: ClientFormProps) {
    const t = useTranslations('Clients.Form');
    // Using t('submitLabel') as default is not possible here directly if submitLabel is prop, 
    // but the parent passes translated label. If not, we use fallback.
    const finalSubmitLabel = submitLabel || t('submitDefault');

    // Create schema with translations
    const formSchema = createFormSchema(t);

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

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [limitType, setLimitType] = useState<'clients' | 'reports' | 'transcription' | 'simulator'>('clients');
    const [limitMessage, setLimitMessage] = useState('');

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
            // Check for 403 Forbidden specifically for limits
            if (err?.response?.status === 403 || err?.status === 403 || err?.message?.includes('limit') || err?.message?.includes('upgrade')) {
                setLimitType('clients');
                setLimitMessage(err.message || 'Límite de clientes alcanzado');
                setShowUpgradeModal(true);
                // Don't set generic error if we are showing the modal
                return;
            }

            setError(err.message || t('error.generic'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                limitType={limitType}
                message={limitMessage}
            />

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
                                {t('sections.personal.title')}
                            </CardTitle>
                            <CardDescription>
                                {t('sections.personal.description')}
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
                                            <FormLabel>{t('fields.professional')}</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('placeholders.selectProfessional')} />
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
                                            <FormLabel>{t('fields.firstName')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('placeholders.firstName')} {...field} />
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
                                            <FormLabel>{t('fields.lastName')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('placeholders.lastName')} {...field} />
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
                                            <FormLabel>{t('fields.email')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('placeholders.email')} {...field} />
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
                                            <FormLabel>{t('fields.phone')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('placeholders.phone')} {...field} />
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
                                {t('sections.clinical.title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="diagnosis"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('fields.diagnosis')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('placeholders.diagnosis')} {...field} />
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
                                            <FormLabel>{t('fields.riskLevel')}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('placeholders.selectRisk')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="LOW">{t('risk.low')}</SelectItem>
                                                    <SelectItem value="MEDIUM">{t('risk.medium')}</SelectItem>
                                                    <SelectItem value="HIGH">{t('risk.high')}</SelectItem>
                                                    <SelectItem value="CRITICAL">{t('risk.critical')}</SelectItem>
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
                                {t('sections.communication.title')}
                            </CardTitle>
                            <CardDescription>
                                {t('sections.communication.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <FormField
                                control={form.control}
                                name="sendEmailReminders"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">{t('fields.emailReminders')}</FormLabel>
                                            <CardDescription>
                                                {t('fields.emailRemindersDesc')}
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
                                {t('sections.consent.title')}
                            </CardTitle>
                            <CardDescription>
                                {t('sections.consent.description')}
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
                                                {t('fields.consentData')}
                                            </FormLabel>
                                            <FormDescription>
                                                {t('fields.consentDataDesc')}
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
                                                {t('fields.consentAI')}
                                            </FormLabel>
                                            <FormDescription>
                                                {t('fields.consentAIDesc')}
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
                            {t('buttons.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>{t('buttons.saving')}</>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> {finalSubmitLabel}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
