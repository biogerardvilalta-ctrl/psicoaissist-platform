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
import { CreditCard, Calendar, CheckCircle2, AlertCircle, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
    const { user, login } = useAuth();
    const { toast } = useToast();

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
                                        {user.subscription.planType.toLowerCase()}
                                    </h3>
                                </div>
                                <Badge variant={user.subscription.status === 'active' ? 'default' : 'destructive'} className="capitalize">
                                    {user.subscription.status === 'active' ? 'Activo' : user.subscription.status}
                                </Badge>
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

                    {user?.subscription && (
                        <div className="pt-4 border-t flex justify-end">
                            <Button variant="outline" onClick={() => window.open('https://billing.stripe.com/p/login/test', '_blank')}>
                                Gestionar Suscripción
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Simulator Usage Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        Uso del Simulador
                    </CardTitle>
                    <CardDescription>Monitoriza tu uso mensual del simulador clínico.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-700">Sesiones Realizadas</p>
                            <h3 className="text-2xl font-bold text-slate-900">
                                {user?.simulatorUsageCount || 0}
                                <span className="text-sm font-normal text-muted-foreground ml-1">
                                    / {5 + ((user?.referralsCount || 0) * 5)} permitidas
                                </span>
                            </h3>
                        </div>
                        {user?.subscription?.planType === 'PRO' || user?.subscription?.planType === 'PREMIUM' ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Sin Límite (Plan {user.subscription.planType})
                            </Badge>
                        ) : (
                            <Badge variant="secondary">
                                {Math.max(0, (5 + ((user?.referralsCount || 0) * 5)) - (user?.simulatorUsageCount || 0))} restantes
                            </Badge>
                        )}
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{
                                width: `${Math.min(100, ((user?.simulatorUsageCount || 0) / (5 + ((user?.referralsCount || 0) * 5))) * 100)}%`
                            }}
                        />
                    </div>

                    <p className="text-xs text-muted-foreground">
                        * El límite se reinicia mensualmente. Invita colegas para obtener +5 casos cada uno.
                    </p>
                </CardContent>
            </Card>

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
        </div>
    );
}
