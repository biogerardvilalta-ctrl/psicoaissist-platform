'use client';

import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { AuthAPI } from '@/lib/auth-api';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { CreditCard, Calendar, CheckCircle2, AlertCircle, Activity, Users, Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

// ... imports
import { simulatorService, StatsData } from '@/services/simulator.service';
import { SimulatorUsageBar } from '@/components/dashboard/usage/SimulatorUsageBar';
import { usePayments } from '@/hooks/usePayments';
import { UpgradePlanModal } from '@/components/dashboard/settings/upgrade-plan-modal';
import { Zap } from 'lucide-react';
// ... inside component
export default function ProfilePage() {
    const { user, login, reloadUser, logout } = useAuth();
    const { toast } = useToast();
    const { openCustomerPortal, loading: paymentsLoading } = usePayments();
    const t = useTranslations('Dashboard.Profile');

    // Simulator Stats
    const [stats, setStats] = useState<StatsData | null>(null);

    useEffect(() => {
        const loadStats = async () => {
            try {
                // Reload user to ensure limits are fresh and not cached
                await reloadUser();

                const data = await simulatorService.getStats('all');
                setStats(data);
            } catch (err) {
                console.error("Failed to load stats", err);
            }
        };
        loadStats();
    }, [reloadUser]);

    // Upgrade Modal State
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    // Edit Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });

    // Password Change State
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Delete Account State
    const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Cancel Subscription State
    const [isCancelSubscriptionDialogOpen, setIsCancelSubscriptionDialogOpen] = useState(false);
    const { cancelSubscription } = usePayments();

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== t('dialogs.deleteAccount.deleteWord')) return;

        setIsDeleting(true);
        try {
            await AuthAPI.deleteAccount();
            toast({
                title: t('toasts.accountDeleted'),
                description: t('toasts.accountDeletedDesc'),
            });
            await logout(); // Ensure client session is cleared
            window.location.href = '/auth/login';
        } catch (error) {
            toast({
                title: t('toasts.accountDeleteError'),
                description: t('toasts.accountDeleteErrorDesc'),
                variant: "destructive"
            });
            setIsDeleting(false);
        }
    };

    const handleCancelSubscription = async () => {
        try {
            await cancelSubscription();
            setIsCancelSubscriptionDialogOpen(false);
            toast({
                title: t('toasts.subscriptionCanceled'),
                description: t('toasts.subscriptionCanceledDesc'),
            });
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            // Error handling is already in usePayments
            setIsCancelSubscriptionDialogOpen(false);
        }
    };

    // Initialize form data when user loads
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            const updatedUser = await AuthAPI.updateProfile({
                firstName: formData.firstName,
                lastName: formData.lastName
            });

            toast({
                title: t('toasts.profileUpdated'),
                description: t('toasts.profileUpdatedDesc'),
                variant: "default"
            });

            setIsEditing(false);
            // Ideally update local user context if needed, but page reload or re-fetch works
            window.location.reload();
        } catch (error) {
            toast({
                title: t('toasts.profileError'),
                description: t('toasts.profileErrorDesc'),
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({
                title: t('toasts.passwordMismatch'),
                description: t('toasts.passwordMismatchDesc'),
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            await AuthAPI.changePassword(
                passwordData.currentPassword,
                passwordData.newPassword
            );

            toast({
                title: t('toasts.passwordUpdated'),
                description: t('toasts.passwordUpdatedDesc'),
                variant: "default"
            });

            setIsPasswordDialogOpen(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast({
                title: t('toasts.passwordError'),
                description: t('toasts.passwordErrorDesc'),
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Computed Subscription Object (Defaults to Demo if null)
    const demoExpirationDate = user?.createdAt
        ? new Date(new Date(user.createdAt).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

    const currentSubscription = user?.subscription || {
        id: 'demo-default',
        planType: 'DEMO',
        status: 'active',
        currentPeriodStart: user?.createdAt || new Date().toISOString(),
        currentPeriodEnd: demoExpirationDate
    };

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>

            {/* Personal Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('personalInfo.title')}</CardTitle>
                    <CardDescription>{t('personalInfo.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">{t('personalInfo.firstName')}</Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">{t('personalInfo.lastName')}</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">{t('personalInfo.email')}</Label>
                        <Input id="email" value={formData.email} disabled className="bg-slate-100" />
                        <p className="text-xs text-muted-foreground">{t('personalInfo.emailNote')}</p>
                    </div>
                    <div className="pt-4 flex gap-2">
                        {isEditing ? (
                            <>
                                <Button onClick={handleSaveProfile} disabled={isLoading}>
                                    {isLoading ? t('personalInfo.savingButton') : t('personalInfo.saveButton')}
                                </Button>
                                <Button variant="outline" onClick={() => {
                                    setIsEditing(false);
                                    // Reset form
                                    if (user) setFormData({
                                        firstName: user.firstName || '',
                                        lastName: user.lastName || '',
                                        email: user.email || ''
                                    });
                                }} disabled={isLoading}>
                                    {t('personalInfo.cancelButton')}
                                </Button>
                            </>
                        ) : (
                            <Button variant="outline" onClick={() => setIsEditing(true)}>{t('personalInfo.editButton')}</Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Subscription Card */}
            {user?.role !== 'AGENDA_MANAGER' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                            {t('subscription.title')}
                        </CardTitle>
                        <CardDescription>{t('subscription.subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Always show subscription details (Demo or Real) */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-purple-900">{t('subscription.currentPlan')}</p>
                                    <h3 className="text-2xl font-bold text-purple-700 capitalize">
                                        {currentSubscription.planType === 'DEMO' ? t('subscription.planDemo') : currentSubscription.planType.toLowerCase().replace('_plus', '').replace(/_/g, ' ')}
                                    </h3>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="bg-white">
                                        {currentSubscription.currentPeriodEnd && currentSubscription.currentPeriodStart &&
                                            (new Date(currentSubscription.currentPeriodEnd).getTime() - new Date(currentSubscription.currentPeriodStart).getTime() > 32 * 24 * 60 * 60 * 1000)
                                            ? t('subscription.paymentAnnual')
                                            : t('subscription.paymentMonthly')}
                                        {!currentSubscription.currentPeriodEnd && t('subscription.paymentFree')}
                                    </Badge>
                                    <Badge variant={currentSubscription.status === 'active' ? 'default' : 'destructive'} className="capitalize">
                                        {currentSubscription.status === 'active' ? t('subscription.statusActive') : currentSubscription.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">
                                            {currentSubscription.planType === 'DEMO' ? t('subscription.expirationDate') : t('subscription.nextRenewal')}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {currentSubscription.currentPeriodEnd
                                                ? new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()
                                                : t('subscription.unlimited')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    {currentSubscription.status === 'active' ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">{t('subscription.status')}</p>
                                        <p className="text-sm text-slate-500">
                                            {currentSubscription.status === 'active'
                                                ? t('subscription.statusOk')
                                                : t('subscription.statusProblem')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Consolidated Limits Display */}
                        <div className="pt-6 border-t space-y-6">
                            <h3 className="text-sm font-medium mb-3">{t('subscription.limitsTitle')}</h3>

                            {/* Active Patients */}
                            <div className="bg-blue-50/50 rounded-lg p-4 space-y-2 border border-blue-100/50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">{t('subscription.activePatients')}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {user?.limits?.maxClients === -1
                                                ? t('subscription.unlimitedPatients')
                                                : `${user?.usage?.clientsCount ?? 0} ${t('subscription.patientsCount', { count: user?.usage?.clientsCount ?? 0, max: user?.limits?.maxClients ?? 3 }).split(' ').slice(1).join(' ')}`}
                                        </p>
                                    </div>
                                    {user?.limits?.maxClients !== -1 && (
                                        <Badge variant={user?.limits?.maxClients !== -1 && (user?.usage?.clientsCount ?? 0) >= (user?.limits?.maxClients ?? 1) ? "destructive" : "secondary"}>
                                            {user?.usage?.clientsCount ?? 0} {user?.limits?.maxClients === -1 ? t('subscription.patientsActive') : `/ ${user?.limits?.maxClients ?? 3}`}
                                        </Badge>
                                    )}
                                </div>
                                {user?.limits?.maxClients !== -1 && (
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${((user?.usage?.clientsCount ?? 0) >= (user?.limits?.maxClients ?? 1))
                                                ? 'bg-red-500'
                                                : 'bg-purple-600'
                                                }`}
                                            style={{ width: `${Math.min(100, Math.round(((user?.usage?.clientsCount ?? 0) / (user?.limits?.maxClients ?? 1)) * 100))}%` }}
                                        />
                                    </div>
                                )}
                            </div>


                            {/* Simulator Stats (Merged) */}
                            {stats?.usage && (
                                <>
                                    {/* Clinical Cases */}
                                    {/* Clinical Cases */}
                                    {currentSubscription.planType !== 'BASIC' && (
                                        <SimulatorUsageBar
                                            usage={stats.usage.used || 0}
                                            limit={stats.usage.limit || 0}
                                            extra={stats.usage.extraSimulatorCases || 0}
                                            planName={currentSubscription.planType === 'DEMO' ? t('subscription.planDemo') : currentSubscription.planType.toLowerCase().replace('_plus', '').replace(/_/g, ' ')}
                                        />
                                    )}


                                    {/* Transcription Minutes */}
                                    <div className="bg-purple-50/50 rounded-lg p-4 space-y-3 border border-purple-100/50">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">{t('subscription.transcriptionMinutes')}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {stats.usage.transcriptionLimit && stats.usage.transcriptionLimit === -1
                                                        ? t('subscription.transcriptionUnlimited')
                                                        : stats.usage.transcriptionLimit !== undefined
                                                            ? (stats.usage.extraTranscriptionMinutes && stats.usage.extraTranscriptionMinutes > 0
                                                                ? t('subscription.transcriptionRemainingExtra', {
                                                                    remaining: Math.round(stats.usage.transcriptionRemaining || 0),
                                                                    baseLimit: (stats.usage.transcriptionLimit || 0) - (stats.usage.extraTranscriptionMinutes || 0),
                                                                    extra: stats.usage.extraTranscriptionMinutes
                                                                })
                                                                : t('subscription.transcriptionRemaining', {
                                                                    remaining: Math.round(stats.usage.transcriptionRemaining || 0),
                                                                    limit: stats.usage.transcriptionLimit
                                                                }))
                                                            : t('subscription.transcriptionCalculating')}
                                                </p>
                                            </div>
                                            <Badge variant={(stats.usage.transcriptionRemaining || 0) > 0 ? "outline" : "destructive"} className={(stats.usage.transcriptionRemaining || 0) > 0 ? "text-green-600 border-green-200 bg-green-50" : ""}>
                                                {t('subscription.transcriptionUsed', { used: Math.round(stats.usage.transcriptionUsed || 0) })}
                                            </Badge>
                                        </div>

                                        {/* Base Plan Bar */}
                                        {stats.usage.transcriptionLimit && stats.usage.transcriptionLimit !== -1 && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] text-slate-500 uppercase font-semibold">
                                                    <span>{t('subscription.basePlan')}</span>
                                                    <span>{Math.min(stats.usage.transcriptionUsed || 0, (stats.usage.transcriptionLimit || 0) - (stats.usage.extraTranscriptionMinutes || 0))} / {(stats.usage.transcriptionLimit || 0) - (stats.usage.extraTranscriptionMinutes || 0)}</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${(Math.min(stats.usage.transcriptionUsed || 0, (stats.usage.transcriptionLimit || 0) - (stats.usage.extraTranscriptionMinutes || 0)) >= ((stats.usage.transcriptionLimit || 0) - (stats.usage.extraTranscriptionMinutes || 0))) ? 'bg-red-500' : 'bg-green-500'}`}
                                                        style={{ width: `${Math.min(100, (Math.min(stats.usage.transcriptionUsed || 0, (stats.usage.transcriptionLimit || 0) - (stats.usage.extraTranscriptionMinutes || 0)) / ((stats.usage.transcriptionLimit || 0) - (stats.usage.extraTranscriptionMinutes || 0))) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Extra Pack Bar (Conditional) */}
                                        {/* Extra Pack Bar (Conditional) */}
                                        {(
                                            (stats.usage.extraTranscriptionMinutes && stats.usage.extraTranscriptionMinutes > 0) ||
                                            ((stats.usage.transcriptionUsed || 0) > ((stats.usage.transcriptionLimit || 0) - (stats.usage.extraTranscriptionMinutes || 0)))
                                        ) && (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] text-slate-500 uppercase font-semibold">
                                                        <span>{t('subscription.extraPack')}</span>
                                                        <span>
                                                            {Math.max(0, (stats.usage.transcriptionUsed || 0) - ((stats.usage.transcriptionLimit || 0) - (stats.usage.extraTranscriptionMinutes || 0)))}
                                                            /
                                                            {(stats.usage.extraTranscriptionMinutes || 0) + Math.max(0, (stats.usage.transcriptionUsed || 0) - ((stats.usage.transcriptionLimit || 0) - (stats.usage.extraTranscriptionMinutes || 0)))}
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${(stats.usage.extraTranscriptionMinutes || 0) === 0 ? 'bg-red-500' : 'bg-purple-500'}`}
                                                            style={{ width: `${Math.min(100, (Math.max(0, (stats.usage.transcriptionUsed || 0) - ((stats.usage.transcriptionLimit || 0) - (stats.usage.extraTranscriptionMinutes || 0))) / ((stats.usage.extraTranscriptionMinutes || 0) + Math.max(0, (stats.usage.transcriptionUsed || 0) - ((stats.usage.transcriptionLimit || 0) - (stats.usage.extraTranscriptionMinutes || 0))))) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                    </div>

                                    <p className="text-xs text-muted-foreground pt-2 border-t">
                                        {currentSubscription.planType === 'DEMO'
                                            ? t('subscription.demoExpires', { date: currentSubscription.currentPeriodEnd ? new Date(currentSubscription.currentPeriodEnd).toLocaleDateString() : 'N/A' })
                                            : t('subscription.limitsReset', { date: new Date(stats.usage.nextReset).toLocaleDateString() })}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Add-ons Section */}
                        {((user?.agendaManagerEnabled) || (user?.hasOnboardingPack)) && user?.subscription && (
                            <div className="pt-6 border-t space-y-4">
                                <h3 className="text-sm font-medium mb-3">{t('subscription.addonsTitle')}</h3>

                                {/* Agenda Manager */}
                                {user?.agendaManagerEnabled && (
                                    <div className="bg-emerald-50/50 rounded-lg p-4 border border-emerald-100/50 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-emerald-900">{t('subscription.agendaManager')}</p>
                                                <p className="text-xs text-emerald-700">
                                                    {t('subscription.agendaManagerDesc')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <Badge className="bg-emerald-600 hover:bg-emerald-700 w-fit">{t('subscription.activated')}</Badge>
                                            <p className="text-xs text-muted-foreground">
                                                {t('subscription.renewal', { date: user.subscription.currentPeriodEnd ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString() : 'N/A' })}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* On-boarding Pack */}
                                {user?.hasOnboardingPack && (
                                    <div className="bg-indigo-50/50 rounded-lg p-4 border border-indigo-100/50 flex flex-col md:flex-row justify-between items-center gap-4 mt-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <Server className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-indigo-900">{t('subscription.onboardingPack')}</p>
                                                <p className="text-xs text-indigo-700">
                                                    {t('subscription.onboardingPackDesc')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <Badge className="bg-indigo-600 hover:bg-indigo-700 w-fit">{t('subscription.inProgress')}</Badge>
                                            <p className="text-xs text-muted-foreground">
                                                {t('subscription.checkSupport')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* General Action Buttons */}
                        <div className="pt-4 border-t flex flex-col md:flex-row md:justify-end gap-3">
                            <Button variant="outline" onClick={() => openCustomerPortal()} disabled={paymentsLoading} className="w-full md:w-auto">
                                {paymentsLoading ? t('subscription.loading') : t('subscription.managePayments')}
                            </Button>
                            <Button
                                onClick={() => setIsUpgradeModalOpen(true)}
                                className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                            >
                                <Zap className="w-4 h-4 mr-2" />
                                {t('subscription.changePlan')}
                            </Button>
                        </div>

                        <UpgradePlanModal
                            isOpen={isUpgradeModalOpen}
                            onClose={() => setIsUpgradeModalOpen(false)}
                            initialViewPlans={true}
                        />
                    </CardContent>
                </Card>
            )}





            {/* Security and Danger Zone */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('security.title')}</CardTitle>
                        <CardDescription>{t('security.subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)} className="w-full">
                            {t('security.changePassword')}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-red-100 bg-red-50/10">
                    <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {t('dangerZone.title')}
                        </CardTitle>
                        <CardDescription>{t('dangerZone.subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {currentSubscription.status === 'active' && currentSubscription.planType !== 'DEMO' && (
                            <Button
                                variant="outline"
                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                onClick={() => setIsCancelSubscriptionDialogOpen(true)}
                            >
                                {t('dangerZone.cancelSubscription')}
                            </Button>
                        )}
                        <Button
                            variant="destructive"
                            className="w-full bg-red-600 hover:bg-red-700"
                            onClick={() => setIsDeleteAccountDialogOpen(true)}
                        >
                            {t('dangerZone.deleteAccount')}
                        </Button>
                    </CardContent>
                </Card>
            </div>


            {/* Cancel Subscription Dialog */}
            <Dialog open={isCancelSubscriptionDialogOpen} onOpenChange={setIsCancelSubscriptionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('dialogs.cancelSubscription.title')}</DialogTitle>
                        <DialogDescription>
                            {t('dialogs.cancelSubscription.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelSubscriptionDialogOpen(false)}>{t('dialogs.cancelSubscription.back')}</Button>
                        <Button variant="destructive" onClick={handleCancelSubscription}>
                            {t('dialogs.cancelSubscription.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Account Dialog */}
            <Dialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
                <DialogContent className="border-red-200">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">{t('dialogs.deleteAccount.title')}</DialogTitle>
                        <DialogDescription>
                            {t('dialogs.deleteAccount.description')}
                            <br /><br />
                            {t('dialogs.deleteAccount.confirmText', { text: t('dialogs.deleteAccount.deleteWord') })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <Input
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder={t('dialogs.deleteAccount.placeholder')}
                            className="border-red-200 focus-visible:ring-red-500"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteAccountDialogOpen(false)}>{t('dialogs.deleteAccount.cancel')}</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmation !== t('dialogs.deleteAccount.deleteWord') || isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? t('dialogs.deleteAccount.deleting') : t('dialogs.deleteAccount.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('dialogs.changePassword.title')}</DialogTitle>
                        <DialogDescription>
                            {t('dialogs.changePassword.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">{t('dialogs.changePassword.currentPassword')}</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">{t('dialogs.changePassword.newPassword')}</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">{t('dialogs.changePassword.confirmPassword')}</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>{t('dialogs.changePassword.cancel')}</Button>
                        <Button onClick={handleChangePassword} disabled={isLoading}>
                            {isLoading ? t('dialogs.changePassword.updating') : t('dialogs.changePassword.update')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
