'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Loader2, Calendar as CalendarIcon, Clock, User as UserIcon, FileText, CheckCircle2 } from 'lucide-react';

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
import { UserAPI } from '@/lib/user-api';
import { useRole } from '@/hooks/useRole';
import { User } from '@/types/auth';
import { UpgradeModal } from '@/components/shared/UpgradeModal';
import { useTranslations } from 'next-intl';

export default function NewSessionPage() {
    const t = useTranslations('NewSession');
    const tCommon = useTranslations('Common');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { isAgendaManager } = useRole();
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [managedProfessionals, setManagedProfessionals] = useState<User[]>([]);
    const [managedGroups, setManagedGroups] = useState<User[]>([]); // New state for groups
    const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);

    // Create form schema with translations
    const formSchema = z.object({
        professionalId: z.string().optional(), // Required for Agenda Managers, will validate conditionally
        clientId: z.string().min(1, t('validationPatient')),
        date: z.string().min(1, t('validationDate')),
        time: z.string().min(1, t('validationTime')),
        sessionType: z.nativeEnum(SessionType, {
            required_error: t('validationSessionType'),
        }),
        notes: z.string().optional(),
    });

    // Get clientId and date from URL query param
    const preselectedClientId = searchParams.get('clientId') || '';
    const preselectedDateIso = searchParams.get('date');

    let defaultDate = format(new Date(), 'yyyy-MM-dd');
    let defaultTime = ''; // Default to empty to force selection (prevents "current time" issue)

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
            professionalId: '',
            clientId: preselectedClientId,
            date: defaultDate,
            time: defaultTime,
            sessionType: SessionType.INDIVIDUAL,
            notes: '',
        },
    });

    // Load managed professionals for Agenda Managers
    useEffect(() => {
        if (isAgendaManager()) {
            setIsLoadingProfessionals(true);
            UserAPI.getManagedProfessionals()
                .then(pros => {
                    const individuals = pros.filter(p => p.role !== 'PROFESSIONAL_GROUP');
                    const groups = pros.filter(p => p.role === 'PROFESSIONAL_GROUP');

                    setManagedProfessionals(individuals);
                    setManagedGroups(groups);

                    // Auto-select if only one professional AND no groups
                    if (individuals.length === 1 && groups.length === 0) {
                        form.setValue('professionalId', individuals[0].id);
                    }
                })
                .catch(err => console.error('Failed to load professionals', err))
                .finally(() => setIsLoadingProfessionals(false));
        }
    }, [isAgendaManager, form]);

    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    // Watch for date changes to fetch availability
    const selectedDate = form.watch('date');
    const selectedProfessionalId = form.watch('professionalId');
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');

    // Fetch Clients when Professional Changes
    useEffect(() => {
        const fetchClients = async () => {
            // Only fetch if a professional is selected (or if user is not agenda manager, i.e. own clients)
            // If isAgendaManager and no pro selected, clear clients?
            // Actually, if pro selected, fetch THEIR clients.

            try {
                setIsLoadingClients(true);
                // If I am agenda manager, I MUST pass professionalId to get THEIR clients.
                // If I am psychologist, professionalID might be undefined or my own ID, backend handles "my clients".

                const targetProId = isAgendaManager() ? selectedProfessionalId : undefined;

                if (isAgendaManager() && !targetProId) {
                    setClients([]);
                    setIsLoadingClients(false);
                    return;
                }

                const data = await ClientsAPI.getAll(true, targetProId);
                setClients(data);

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
                    title: tCommon('error'),
                    description: t('errorLoadingPatients'),
                });
            } finally {
                setIsLoadingClients(false);
            }
        };

        fetchClients();
    }, [toast, preselectedClientId, form, isAgendaManager, selectedProfessionalId]);

    // Fetch Availability when Date, Pro, or Group changes
    useEffect(() => {
        const fetchAvailability = async () => {
            if (!selectedDate) return;
            // If Agenda Manager, we need at least a professional selected.
            if (isAgendaManager() && !selectedProfessionalId) return;

            // Priority: Group ID > Professional ID
            // If Group is selected, we fetch availability for the Group (which is united availability).
            const targetId = selectedGroupId || selectedProfessionalId;

            setIsLoadingSlots(true);
            try {
                const data = await SessionsAPI.getAvailability(selectedDate, targetId);
                setAvailableSlots(data.slots);
            } catch (error) {
                console.error("Failed to fetch slots", error);
            } finally {
                setIsLoadingSlots(false);
            }
        };

        fetchAvailability();
    }, [selectedDate, selectedProfessionalId, selectedGroupId, isAgendaManager]);

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [limitMessage, setLimitMessage] = useState('');

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Validate professional selection for Agenda Managers
        if (isAgendaManager() && !values.professionalId) {
            toast({
                variant: 'destructive',
                title: tCommon('error'),
                description: t('errorSelectProfessional'),
            });
            return;
        }

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
                professionalId: values.professionalId, // Pass professional ID if Agenda Manager
            });

            toast({
                title: t('sessionScheduled'),
                description: t('sessionScheduledDesc'),
            });

            router.push('/dashboard/sessions');
            router.refresh();
        } catch (error: any) {
            console.error("Failed to create session", error);

            // Check for 403 Forbidden specifically for limits 
            if (error?.response?.status === 403 || error?.status === 403 || error?.message?.includes('limit')) {
                setLimitMessage(error.message || t('limitReached'));
                setShowUpgradeModal(true);
                // Don't show toast if showing modal
                return;
            }

            toast({
                variant: 'destructive',
                title: t('errorScheduling'),
                description: error.response?.data?.message || t('errorSchedulingDesc'),
            });
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="container max-w-2xl py-6 mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t('title')}</h1>
                <p className="text-gray-500">{t('subtitle')}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('cardTitle')}</CardTitle>
                    <CardDescription>
                        {t('cardDescription')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UpgradeModal
                        isOpen={showUpgradeModal}
                        onClose={() => setShowUpgradeModal(false)}
                        limitType="transcription"
                        message={limitMessage}
                    />
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* Professional Selection (Agenda Managers only) */}
                            {isAgendaManager() && (
                                <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                                    <h3 className="text-sm font-medium text-slate-900 mb-2">{t('agendaSelection')}</h3>

                                    <FormField
                                        control={form.control}
                                        name="professionalId"
                                        render={({ field }) => (
                                            <>
                                                <FormItem>
                                                    <FormLabel>{t('individualProfessional')}</FormLabel>
                                                    <Select
                                                        onValueChange={(val) => {
                                                            field.onChange(val);
                                                            form.setValue('time', ''); // Reset time when professional changes
                                                        }}
                                                        value={managedProfessionals.find(p => p.id === field.value) ? field.value : ''}
                                                        disabled={isLoadingProfessionals}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white">
                                                                <SelectValue placeholder={isLoadingProfessionals ? t('loading') : t('selectProfessional')} />
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
                                                </FormItem>

                                                <FormItem>
                                                    <FormLabel>{t('groupAgenda')}</FormLabel>
                                                    <Select
                                                        onValueChange={(val) => {
                                                            setSelectedGroupId(val === 'none' ? '' : val);
                                                        }}
                                                        value={selectedGroupId || 'none'}
                                                        disabled={isLoadingProfessionals}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white">
                                                                <SelectValue placeholder={isLoadingProfessionals ? t('loading') : t('selectGroup')} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="none">{t('noGroup')}</SelectItem>
                                                            {managedGroups.map((group) => (
                                                                <SelectItem key={group.id} value={group.id}>
                                                                    {group.firstName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            </>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Client Selection */}
                            <FormField
                                control={form.control}
                                name="clientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('patient')}</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isLoadingClients || !!preselectedClientId} // Disable if preselected to lock context, or allow change? Usually allow change is better, but if coming from specific client action, maybe lock. Let's keep enabled but default selected.
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={isLoadingClients ? t('loadingPatients') : t('selectPatient')} />
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
                                            <FormLabel>{t('date')}</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                                    <Input type="date" className="pl-9" {...field} onChange={(e) => {
                                                        field.onChange(e);
                                                        form.setValue('time', ''); // Reset time when date changes
                                                    }} />
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
                                            <FormLabel>{t('availableTime')}</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={isLoadingSlots}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={isLoadingSlots ? t('loadingSchedules') : t('selectTime')} />
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
                                                            {t('noAvailableSlots')}
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
                                        <FormLabel>{t('sessionType')}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('selectType')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={SessionType.INDIVIDUAL}>{t('individual')}</SelectItem>
                                                <SelectItem value={SessionType.GROUP}>{t('group')}</SelectItem>
                                                <SelectItem value={SessionType.COUPLE}>{t('couple')}</SelectItem>
                                                <SelectItem value={SessionType.FAMILY}>{t('family')}</SelectItem>
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
                                        <FormLabel>{t('preliminaryNotes')}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={t('notesPlaceholder')}
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
                                    {t('cancel')}
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t('scheduling')}
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            {t('scheduleSession')}
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
