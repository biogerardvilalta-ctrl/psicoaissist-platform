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
import { CreditCard, Calendar, CheckCircle2, AlertCircle, Activity, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ... imports
import { simulatorService, StatsData } from '@/services/simulator.service';
import { SimulatorUsageBar } from '@/components/dashboard/usage/SimulatorUsageBar';
import { usePayments } from '@/hooks/usePayments';
import { UpgradePlanModal } from '@/components/dashboard/settings/upgrade-plan-modal';
import { Zap } from 'lucide-react';
// ... inside component
export default function ProfilePage() {
    const { user, login, reloadUser } = useAuth();
    const { toast } = useToast();
    const { openCustomerPortal, loading: paymentsLoading } = usePayments();

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
                title: "Perfil actualizado",
                description: "Tus datos han sido guardados correctamente.",
                variant: "default"
            });

            setIsEditing(false);
            // Ideally update local user context if needed, but page reload or re-fetch works
            window.location.reload();
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo actualizar el perfil.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({
                title: "Error de validación",
                description: "Las nuevas contraseñas no coinciden.",
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
                title: "Contraseña actualizada",
                description: "Tu contraseña ha sido cambiada exitosamente.",
                variant: "default"
            });

            setIsPasswordDialogOpen(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo cambiar la contraseña. Verifica tu contraseña actual.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>

            {/* Personal Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>Visualiza y actualiza tus datos personales.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Nombre</Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Apellido</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={formData.email} disabled className="bg-slate-100" />
                        <p className="text-xs text-muted-foreground">El email no se puede cambiar.</p>
                    </div>
                    <div className="pt-4 flex gap-2">
                        {isEditing ? (
                            <>
                                <Button onClick={handleSaveProfile} disabled={isLoading}>
                                    {isLoading ? "Guardando..." : "Guardar Cambios"}
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
                                    Cancelar
                                </Button>
                            </>
                        ) : (
                            <Button variant="outline" onClick={() => setIsEditing(true)}>Editar Perfil</Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Subscription Card */}
            {/* Subscription Section - Hidden for AGENDA_MANAGER */}
            {user?.role !== 'AGENDA_MANAGER' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                            Suscripción
                        </CardTitle>
                        <CardDescription>Detalles de tu plan actual y facturación.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {user?.subscription ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-purple-900">Plan Actual</p>
                                        <h3 className="text-2xl font-bold text-purple-700 capitalize">
                                            {user.subscription.planType.toLowerCase().replace('_plus', '').replace(/_/g, ' ')}
                                        </h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge variant="outline" className="bg-white">
                                            {user.subscription.currentPeriodEnd && user.subscription.currentPeriodStart &&
                                                (new Date(user.subscription.currentPeriodEnd).getTime() - new Date(user.subscription.currentPeriodStart).getTime() > 32 * 24 * 60 * 60 * 1000)
                                                ? 'Pago Anual'
                                                : 'Pago Mensual'}
                                        </Badge>
                                        <Badge variant={user.subscription.status === 'active' ? 'default' : 'destructive'} className="capitalize">
                                            {user.subscription.status === 'active' ? 'Activo' : user.subscription.status}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">Próxima Renovación</p>
                                            <p className="text-sm text-slate-500">
                                                {user.subscription.currentPeriodEnd
                                                    ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString()
                                                    : "No disponible"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        {user.subscription.status === 'active' ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">Estado</p>
                                            <p className="text-sm text-slate-500">
                                                {user.subscription.status === 'active'
                                                    ? "Tu suscripción está al corriente de pago."
                                                    : "Hay un problema con tu suscripción."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                <p className="text-slate-500 mb-4">No tienes una suscripción activa.</p>
                                <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                                    Ver Planes
                                </Button>
                            </div>
                        )}

                        {/* Consolidated Limits Display */}
                        {user?.subscription && (
                            <div className="pt-6 border-t space-y-6">
                                <h3 className="text-sm font-medium mb-3">Límites y Uso del Plan</h3>

                                {/* Active Patients */}
                                <div className="bg-blue-50/50 rounded-lg p-4 space-y-2 border border-blue-100/50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">Pacientes Activos</p>
                                            <p className="text-xs text-muted-foreground">
                                                {user?.limits?.maxClients === -1
                                                    ? "Pacientes Ilimitados"
                                                    : `${user?.usage?.clientsCount ?? 0} de ${user?.limits?.maxClients ?? 3} pacientes`}
                                            </p>
                                        </div>
                                        {user?.limits?.maxClients !== -1 && (
                                            <Badge variant={user?.limits?.maxClients !== -1 && (user?.usage?.clientsCount ?? 0) >= (user?.limits?.maxClients ?? 1) ? "destructive" : "secondary"}>
                                                {user?.usage?.clientsCount ?? 0} {user?.limits?.maxClients === -1 ? "Activos" : `/ ${user?.limits?.maxClients ?? 3}`}
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
                                        {user?.subscription?.planType.toLowerCase() !== 'basic' && (
                                            <SimulatorUsageBar
                                                usage={stats.usage.used || 0}
                                                limit={stats.usage.limit || 0}
                                                extra={stats.usage.extraSimulatorCases || 0}
                                                planName={user.subscription.planType.toLowerCase().replace('_plus', '').replace(/_/g, ' ')}
                                            />
                                        )}


                                        {/* Transcription Minutes */}
                                        <div className="bg-purple-50/50 rounded-lg p-4 space-y-3 border border-purple-100/50">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">Minutos de Transcripción (IA)</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {stats.usage.transcriptionLimit && stats.usage.transcriptionLimit === -1
                                                            ? "Ilimitado"
                                                            : stats.usage.transcriptionLimit !== undefined
                                                                ? (stats.usage.extraTranscriptionMinutes && stats.usage.extraTranscriptionMinutes > 0
                                                                    ? `${Math.round(stats.usage.transcriptionRemaining || 0)} min restantes de ${(stats.usage.transcriptionLimit || 0) - (stats.usage.extraTranscriptionMinutes || 0)} + ${stats.usage.extraTranscriptionMinutes} (Extra)`
                                                                    : `${Math.round(stats.usage.transcriptionRemaining || 0)} min restantes de ${stats.usage.transcriptionLimit}`)
                                                                : "Calculando..."}
                                                    </p>
                                                </div>
                                                <Badge variant={(stats.usage.transcriptionRemaining || 0) > 0 ? "outline" : "destructive"} className={(stats.usage.transcriptionRemaining || 0) > 0 ? "text-green-600 border-green-200 bg-green-50" : ""}>
                                                    {Math.round(stats.usage.transcriptionUsed || 0)} Min Usados
                                                </Badge>
                                            </div>

                                            {/* Base Plan Bar */}
                                            {stats.usage.transcriptionLimit && stats.usage.transcriptionLimit !== -1 && (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] text-slate-500 uppercase font-semibold">
                                                        <span>Plan Base</span>
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
                                                            <span>Pack Extra</span>
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
                                            * Los límites mensuales se reinician el {new Date(stats.usage.nextReset).toLocaleDateString()}.
                                        </p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Agenda Manager Add-on */}
                        {user?.agendaManagerEnabled && user?.subscription && (
                            <div className="pt-6 border-t space-y-4">
                                <h3 className="text-sm font-medium mb-3">Complementos Activos</h3>
                                <div className="bg-emerald-50/50 rounded-lg p-4 border border-emerald-100/50 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-emerald-900">Agenda Manager</p>
                                            <p className="text-xs text-emerald-700">
                                                Gestión delegada de agenda y pacientes
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <Badge className="bg-emerald-600 hover:bg-emerald-700 w-fit">Activado</Badge>
                                        <p className="text-xs text-muted-foreground">
                                            Renovación: {user.subscription.currentPeriodEnd ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {user?.subscription && (
                            <div className="pt-4 border-t flex justify-end gap-3">
                                <Button variant="outline" onClick={() => openCustomerPortal()} disabled={paymentsLoading}>
                                    {paymentsLoading ? "Cargando..." : "Gestionar Pagos y Facturas"}
                                </Button>
                                <Button
                                    onClick={() => setIsUpgradeModalOpen(true)}
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                                >
                                    <Zap className="w-4 h-4 mr-2" />
                                    Cambiar Plan / Comprar Pack
                                </Button>
                            </div>
                        )}

                        <UpgradePlanModal
                            isOpen={isUpgradeModalOpen}
                            onClose={() => setIsUpgradeModalOpen(false)}
                            initialViewPlans={true}
                        />
                    </CardContent>
                </Card>
            )}



            {/* Security Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Seguridad</CardTitle>
                    <CardDescription>Gestiona tu contraseña y sesiones.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
                        Cambiar Contraseña
                    </Button>
                </CardContent>
            </Card>

            {/* Change Password Dialog */}
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cambiar Contraseña</DialogTitle>
                        <DialogDescription>
                            Introduce tu contraseña actual y la nueva contraseña deseada.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Contraseña Actual</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nueva Contraseña</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleChangePassword} disabled={isLoading}>
                            {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
