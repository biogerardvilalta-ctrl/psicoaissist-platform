'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import {
    Calendar,
    Plus,
    Search,
    Clock,
    MoreHorizontal,
    FileText,
    CheckCircle,
    User as UserIcon,
    XCircle,
    Play
} from 'lucide-react';
import { format } from 'date-fns';
import { es, ca, enUS as en } from 'date-fns/locale';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarView } from '@/components/dashboard/sessions/calendar-view';
import { useRole } from '@/hooks/useRole';
import { UserAPI } from '@/lib/user-api';
import { User } from '@/types/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations, useLocale } from 'next-intl';

const localeMap: Record<string, any> = {
    es,
    ca,
    en
};

export default function SessionsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const t = useTranslations('Calendar');
    const locale = useLocale();
    const currentLocale = localeMap[locale] || es;

    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('');
    const [patientFilter, setPatientFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

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

    const fetchSessions = useCallback(async () => {
        try {
            setIsLoading(true);
            const filters: any = {}; // Type filters correctly if possible, or just build object
            if (isAgendaManager() && selectedProfessionalId !== 'all') {
                filters.professionalId = selectedProfessionalId;
            }
            const data = await SessionsAPI.getAll(filters);
            setSessions(data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
            toast({
                title: t('toasts.loadError'),
                description: t('toasts.loadErrorDesc'),
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast, isAgendaManager, selectedProfessionalId]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const handleCancel = async (id: string) => {
        if (!confirm(t('actions.cancelConfirm'))) return;
        try {
            await SessionsAPI.update(id, { status: SessionStatus.CANCELLED });
            toast({
                title: t('toasts.cancelSuccess'),
                description: t('toasts.cancelSuccessDesc'),
            });
            fetchSessions();
        } catch (error) {
            toast({
                title: t('toasts.loadError'),
                description: t('toasts.cancelError'),
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('actions.deleteConfirm'))) {
            return;
        }

        try {
            await SessionsAPI.delete(id);
            toast({
                title: t('toasts.deleteSuccess'),
                description: t('toasts.deleteSuccessDesc'),
            });
            fetchSessions();
        } catch (error) {
            toast({
                title: t('toasts.loadError'),
                description: t('toasts.deleteError'),
                variant: 'destructive',
            });
        }
    };

    // Filter sessions based on all filters
    const filteredSessions = sessions.filter(session => {
        // Date Filter
        if (dateFilter) {
            const sessionDate = format(new Date(session.startTime), 'yyyy-MM-dd');
            if (sessionDate !== dateFilter) return false;
        }

        // Patient Filter
        if (patientFilter) {
            const clientName = session.clientName ? session.clientName.toLowerCase() : '';
            if (!clientName.includes(patientFilter.toLowerCase())) return false;
        }

        // Type Filter
        if (typeFilter !== 'ALL') {
            if (session.sessionType !== typeFilter) return false;
        }

        // Status Filter
        if (statusFilter !== 'ALL') {
            if (session.status !== statusFilter) return false;
        }

        return true;
    });

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            // We use custom classNames for colors, so we can use 'outline' or 'secondary' as base
            default: return 'outline';
        }
    };

    const getStatusLabel = (status: string) => {
        const statusKey = status as keyof typeof SessionStatus;
        return t(`status.${statusKey}`) || status;
    };

    const getStatusClassName = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200';
            case 'SCHEDULED': return 'bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-indigo-200';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200';
            case 'CANCELLED': return 'bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200';
            case 'NO_SHOW': return 'bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<any>('month'); // type any to avoid 'Views' import issue here if not needed

    // ... existing fetchSessions ...
    // Using getAll for now, can switch to filtered fetch if needed

    // ... existing useEffect ...

    // ... existing handlers (handleCancel, handleDelete) ...

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t('subtitle')}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    {isAgendaManager() && (
                        <div className="w-[200px]">
                            <Select
                                value={selectedProfessionalId}
                                onValueChange={(val) => setSelectedProfessionalId(val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('filters.professional')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('filters.allProfessionals')}</SelectItem>
                                    {managedProfessionals.map(pro => (
                                        <SelectItem key={pro.id} value={pro.id}>
                                            {pro.firstName} {pro.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <Button onClick={() => router.push('/dashboard/sessions/new')}>
                        <Plus className="mr-2 h-4 w-4" /> {t('newSession')}
                    </Button>
                </div>
            </div>
            {isAgendaManager() && managedProfessionals.length === 0 && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                    <div className="flex-1">
                        <h4 className="font-medium text-amber-900">{t('alerts.noDataTitle')}</h4>
                        <p className="text-sm text-amber-700">
                            {t('alerts.noDataDesc')}
                        </p>
                    </div>
                </div>
            )}

            {isAgendaManager() ? (
                // Calendar-only view for Agenda Managers
                <CalendarView
                    sessions={sessions}
                    onNavigate={setCurrentDate}
                    currentDate={currentDate}
                    view={view}
                    onViewChange={setView}
                />
            ) : (
                // Full Tabs view for Psychologists
                <Tabs defaultValue="list" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="list">{t('tabs.list')}</TabsTrigger>
                        <TabsTrigger value="calendar">{t('tabs.calendar')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>{t('list.title')}</CardTitle>
                                <CardDescription>
                                    {t('list.description', { count: sessions.length })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t('filters.date')}</label>
                                        <Input
                                            type="date"
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t('filters.patient')}</label>
                                        <Input
                                            placeholder={t('filters.patientPlaceholder')}
                                            value={patientFilter}
                                            onChange={(e) => setPatientFilter(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t('filters.type')}</label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                        >
                                            <option value="ALL">{t('filters.allTypes')}</option>
                                            <option value="INDIVIDUAL">{t('types.INDIVIDUAL')}</option>
                                            <option value="GROUP">{t('types.GROUP')}</option>
                                            <option value="FAMILY">{t('types.FAMILY')}</option>
                                            <option value="COUPLE">{t('types.COUPLE')}</option>
                                            <option value="CONSULTATION">{t('types.CONSULTATION')}</option>
                                            <option value="EMERGENCY">{t('types.EMERGENCY')}</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t('filters.status')}</label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="ALL">{t('filters.allStatuses')}</option>
                                            <option value="SCHEDULED">{t('status.SCHEDULED')}</option>
                                            <option value="COMPLETED">{t('status.COMPLETED')}</option>
                                            <option value="CANCELLED">{t('status.CANCELLED')}</option>
                                            <option value="IN_PROGRESS">{t('status.IN_PROGRESS')}</option>
                                            <option value="NO_SHOW">{t('status.NO_SHOW')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{t('table.headers.dateTime')}</TableHead>
                                                <TableHead>{t('table.headers.patient')}</TableHead>
                                                <TableHead>{t('table.headers.type')}</TableHead>
                                                <TableHead>{t('table.headers.status')}</TableHead>
                                                <TableHead className="text-right">{t('table.headers.actions')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-24 text-center">
                                                        {t('table.loading')}
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredSessions.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-24 text-center">
                                                        {t('table.noData')}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredSessions.map((session) => (
                                                    <TableRow
                                                        key={session.id}
                                                        className={`
                                                            ${session.status === 'SCHEDULED' ? 'bg-indigo-50 hover:bg-indigo-100 cursor-pointer border-l-4 border-l-indigo-500' : ''}
                                                            transition-colors
                                                        `}
                                                        onClick={() => {
                                                            const target = `/dashboard/sessions/${session.id}`;
                                                            router.push(target);
                                                        }}
                                                    >
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium flex items-center gap-2">
                                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                    {format(new Date(session.startTime), 'PPP', { locale: currentLocale })}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {format(new Date(session.startTime), 'p', { locale: currentLocale })}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium flex items-center gap-2">
                                                                <UserIcon className="h-3 w-3 text-muted-foreground" />
                                                                {session.clientName || t('table.unknownClient')}
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
                                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                                        <span className="sr-only">{t('table.headers.actions')}</span>
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>{t('table.headers.actions')}</DropdownMenuLabel>
                                                                    {session.status === SessionStatus.SCHEDULED ? (
                                                                        <DropdownMenuItem onClick={() => router.push(`/dashboard/sessions/${session.id}?start=true`)}>
                                                                            <Play className="mr-2 h-4 w-4 text-blue-600" /> {t('actions.startSession')}
                                                                        </DropdownMenuItem>
                                                                    ) : (
                                                                        <DropdownMenuItem onClick={() => router.push(`/dashboard/sessions/${session.id}`)}>
                                                                            <FileText className="mr-2 h-4 w-4" /> {t('actions.viewDetails')}
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {session.status === SessionStatus.SCHEDULED && (
                                                                        <DropdownMenuItem onClick={() => handleCancel(session.id)}>
                                                                            <XCircle className="mr-2 h-4 w-4 text-orange-500" /> {t('actions.cancelSession')}
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        className="text-red-600 focus:text-red-600"
                                                                        onClick={() => handleDelete(session.id)}
                                                                    >
                                                                        {t('actions.delete')}
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
                    </TabsContent>

                    <TabsContent value="calendar">
                        <CalendarView
                            sessions={sessions}
                            onNavigate={setCurrentDate}
                            currentDate={currentDate}
                            view={view}
                            onViewChange={setView}
                        />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
