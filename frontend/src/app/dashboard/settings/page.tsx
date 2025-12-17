'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { AuthAPI } from '@/lib/auth-api';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  // State
  const [enableReminders, setEnableReminders] = useState<boolean>(false);
  const [defaultDuration, setDefaultDuration] = useState<string>("60");
  const [bufferTime, setBufferTime] = useState<string>("10");
  const [workStartHour, setWorkStartHour] = useState<string>("09:00");
  const [workEndHour, setWorkEndHour] = useState<string>("18:00");
  const [preferredLanguage, setPreferredLanguage] = useState<string>("es");
  const [loading, setLoading] = useState(false);

  // Initial Load
  useEffect(() => {
    if (user) {
      setEnableReminders(user.enableReminders || false);
      setDefaultDuration(user.defaultDuration?.toString() || "60");
      setBufferTime(user.bufferTime?.toString() || "10");
      setWorkStartHour(user.workStartHour || "09:00");
      setWorkEndHour(user.workEndHour || "18:00");
      setPreferredLanguage(user.preferredLanguage || "es");
    }
  }, [user]);

  // Update Handler
  const handleUpdateProfile = async (data: any) => {
    setLoading(true);
    try {
      const updatedUser = await AuthAPI.updateProfile(data);
      updateUser({ ...user!, ...updatedUser });
      toast({
        title: "Configuración actualizada",
        description: "Tus preferencias se han guardado correctamente.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración.",
        variant: "destructive"
      });
      // Revert might be complex for multiple fields, simpler to let user retry or reload
    } finally {
      setLoading(false);
    }
  };

  const handleReminderChange = (checked: boolean) => {
    setEnableReminders(checked);
    handleUpdateProfile({ enableReminders: checked });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>

      <Card>
        <CardHeader>
          <CardTitle>Agenda y Calendario</CardTitle>
          <CardDescription>Configura tus preferencias para nuevas sesiones.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Duración por defecto (minutos)</Label>
              <Input
                type="number"
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(e.target.value)}
                onBlur={(e) => handleUpdateProfile({ defaultDuration: parseInt(e.target.value) })}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>Tiempo entre sesiones (minutos)</Label>
              <Input
                type="number"
                value={bufferTime}
                onChange={(e) => setBufferTime(e.target.value)}
                onBlur={(e) => handleUpdateProfile({ bufferTime: parseInt(e.target.value) })}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Horario Laboral</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1 block">Inicio</Label>
                <Input
                  type="time"
                  value={workStartHour}
                  onChange={(e) => {
                    setWorkStartHour(e.target.value);
                  }}
                  onBlur={(e) => handleUpdateProfile({ workStartHour: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1 block">Fin</Label>
                <Input
                  type="time"
                  value={workEndHour}
                  onChange={(e) => {
                    setWorkEndHour(e.target.value);
                  }}
                  onBlur={(e) => handleUpdateProfile({ workEndHour: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inteligencia Artificial</CardTitle>
          <CardDescription>Personaliza la generación de informes y análisis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Idioma preferido para informes</Label>
            <Select
              value={preferredLanguage}
              onValueChange={(val) => {
                setPreferredLanguage(val);
                handleUpdateProfile({ preferredLanguage: val });
              }}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="ca">Català</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Este idioma se utilizará por defecto al generar los borradores de informes clínicos y análisis de sesiones.
            </p>
          </div>
        </CardContent>
      </Card>

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