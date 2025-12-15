'use client';

import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
    const { user } = useAuth();

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>Visualiza y actualiza tus datos personales.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nombre</Label>
                            <Input value={user?.firstName} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Apellido</Label>
                            <Input value={user?.lastName} disabled />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={user?.email} disabled />
                    </div>
                    <div className="pt-4">
                        <Button variant="outline">Editar Perfil</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Seguridad</CardTitle>
                    <CardDescription>Gestiona tu contraseña y sesiones.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline">Cambiar Contraseña</Button>
                </CardContent>
            </Card>
        </div>
    );
}
