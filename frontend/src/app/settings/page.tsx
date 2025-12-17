'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { AuthAPI } from '@/lib/auth-api';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [enableReminders, setEnableReminders] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEnableReminders(user.enableReminders || false);
    }
  }, [user]);

  const handleReminderChange = async (checked: boolean) => {
    setEnableReminders(checked);
    setLoading(true);
    try {
      const updatedUser = await AuthAPI.updateProfile({ enableReminders: checked });
      updateUser({ ...user!, ...updatedUser });
      toast({
        title: "Configuración actualizada",
        description: `Recordatorios ${checked ? 'activados' : 'desactivados'} correctamente.`,
      });
    } catch (error) {
      console.error(error);
      setEnableReminders(!checked); // Revert on error
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>

      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>Gestiona tus preferencias de notificaciones y recordatorios.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="reminders"
              checked={enableReminders}
              onCheckedChange={handleReminderChange}
              disabled={loading}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="reminders" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Activar recordatorios por email
              </Label>
              <p className="text-sm text-muted-foreground">
                Recibe un correo 24 horas antes de tus sesiones programadas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}