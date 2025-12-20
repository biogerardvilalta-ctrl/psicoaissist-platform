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
import { CalendarIcon, BrainCircuit, Bell, Settings, Clock } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  // Navigation State
  const [activeSection, setActiveSection] = useState<'agenda' | 'ai' | 'notifications'>('agenda');

  // Form State
  const [enableReminders, setEnableReminders] = useState<boolean>(false);
  const [defaultDuration, setDefaultDuration] = useState<string>("60");
  const [bufferTime, setBufferTime] = useState<string>("10");
  const [workStartHour, setWorkStartHour] = useState<string>("09:00");
  const [workEndHour, setWorkEndHour] = useState<string>("18:00");
  const [preferredLanguage, setPreferredLanguage] = useState<string>("ca");
  const [loading, setLoading] = useState(false);

  // Initial Load
  useEffect(() => {
    if (user) {
      setEnableReminders(user.enableReminders || false);
      setDefaultDuration(user.defaultDuration?.toString() || "60");
      setBufferTime(user.bufferTime?.toString() || "10");
      setWorkStartHour(user.workStartHour || "09:00");
      setWorkEndHour(user.workEndHour || "18:00");
      setPreferredLanguage(user.preferredLanguage || "ca");
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
    } finally {
      setLoading(false);
    }
  };

  const handleReminderChange = (checked: boolean) => {
    setEnableReminders(checked);
    handleUpdateProfile({ enableReminders: checked });
  };

  const menuItems = [
    { id: 'agenda', label: 'Agenda y Calendario', icon: CalendarIcon },
    { id: 'ai', label: 'Inteligencia Artificial', icon: BrainCircuit },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 max-w-6xl mx-auto h-[calc(100vh-100px)]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 space-y-2">
        <div className="mb-6 px-4">
          <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                   ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pr-2">

        {/* AGENDA SECTION */}
        {activeSection === 'agenda' && (
          <Card>
            <CardHeader>
              <CardTitle>Agenda y Calendario</CardTitle>
              <CardDescription>Configura tus preferencias para nuevas sesiones y disponibilidad.</CardDescription>
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

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Horario Semanal</h3>
                <p className="text-sm text-gray-500">Configura la disponibilidad para cada día de la semana.</p>

                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6, 0].map((day) => { // Mon to Sun
                    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                    const config = (user?.scheduleConfig?.weekly?.[day]) || { enabled: day !== 0 && day !== 6, start: workStartHour, end: workEndHour };

                    return (
                      <div key={day} className="flex items-center gap-4 py-2 border-b last:border-0">
                        <div className="w-24">
                          <span className="font-medium">{dayNames[day]}</span>
                        </div>
                        <Checkbox
                          checked={config.enabled}
                          onCheckedChange={(checked) => {
                            const newConfig = { ...user?.scheduleConfig };
                            if (!newConfig.weekly) newConfig.weekly = {};
                            newConfig.weekly[day] = { ...config, enabled: !!checked };
                            // Optimistic update
                            updateUser({ ...user!, scheduleConfig: newConfig });
                            // API Call
                            handleUpdateProfile({ scheduleConfig: newConfig });
                          }}
                        />
                        <span className="text-sm text-gray-500 w-16">{config.enabled ? 'Abierto' : 'Cerrado'}</span>

                        {config.enabled && (
                          <>
                            <Input
                              type="time"
                              value={config.start}
                              className="w-32"
                              onChange={(e) => {
                                const newConfig = { ...user?.scheduleConfig };
                                if (!newConfig.weekly) newConfig.weekly = {};
                                newConfig.weekly[day] = { ...config, start: e.target.value };
                                updateUser({ ...user!, scheduleConfig: newConfig });
                              }}
                              onBlur={() => handleUpdateProfile({ scheduleConfig: user?.scheduleConfig })}
                            />
                            <span className="text-gray-400">-</span>
                            <Input
                              type="time"
                              value={config.end}
                              className="w-32"
                              onChange={(e) => {
                                const newConfig = { ...user?.scheduleConfig };
                                if (!newConfig.weekly) newConfig.weekly = {};
                                newConfig.weekly[day] = { ...config, end: e.target.value };
                                updateUser({ ...user!, scheduleConfig: newConfig });
                              }}
                              onBlur={() => handleUpdateProfile({ scheduleConfig: user?.scheduleConfig })}
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>


              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Bloqueos y Excepciones</h3>
                <p className="text-sm text-gray-500">Agrega días festivos o bloquea horas específicas.</p>

                <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input type="date" id="block-date" />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select defaultValue="full" onValueChange={(v) => {
                      const startInput = document.getElementById('block-start');
                      const endInput = document.getElementById('block-end');
                      if (v === 'full') {
                        if (startInput) (startInput as HTMLElement).style.display = 'none';
                        if (endInput) (endInput as HTMLElement).style.display = 'none';
                      } else {
                        if (startInput) (startInput as HTMLElement).style.display = 'block';
                        if (endInput) (endInput as HTMLElement).style.display = 'block';
                      }
                      document.getElementById('block-type-value')!.setAttribute('data-value', v);
                    }}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Tipo de bloqueo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Día Completo</SelectItem>
                        <SelectItem value="partial">Horas Específicas</SelectItem>
                      </SelectContent>
                    </Select>
                    <span id="block-type-value" data-value="full" className="hidden"></span>
                  </div>

                  <div className="space-y-2" id="block-start" style={{ display: 'none' }}>
                    <Label>Desde</Label>
                    <Input type="time" id="block-start-input" />
                  </div>
                  <div className="space-y-2" id="block-end" style={{ display: 'none' }}>
                    <Label>Hasta</Label>
                    <Input type="time" id="block-end-input" />
                  </div>

                  <Button onClick={() => {
                    const dateInput = document.getElementById('block-date') as HTMLInputElement;
                    const typeValue = document.getElementById('block-type-value')!.getAttribute('data-value');

                    if (!dateInput.value) return;

                    const newConfig = { ...user?.scheduleConfig };

                    if (typeValue === 'full') {
                      if (!newConfig.holidays) newConfig.holidays = [];
                      if (!newConfig.holidays.includes(dateInput.value)) {
                        newConfig.holidays.push(dateInput.value);
                        handleUpdateProfile({ scheduleConfig: newConfig });
                        dateInput.value = '';
                      }
                    } else {
                      const startInput = document.getElementById('block-start-input') as HTMLInputElement;
                      const endInput = document.getElementById('block-end-input') as HTMLInputElement;

                      if (startInput.value && endInput.value) {
                        if (!newConfig.blockedBlocks) newConfig.blockedBlocks = [];
                        newConfig.blockedBlocks.push({
                          date: dateInput.value,
                          start: startInput.value,
                          end: endInput.value
                        });
                        handleUpdateProfile({ scheduleConfig: newConfig });
                        // Clear inputs
                        startInput.value = '';
                        endInput.value = '';
                        dateInput.value = '';
                      }
                    }
                  }}>Agregar</Button>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Días Completos Bloqueados</h4>
                  <div className="flex flex-wrap gap-2">
                    {user?.scheduleConfig?.holidays?.map(date => (
                      <div key={date} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-red-200">
                        <CalendarIcon className="h-3 w-3" />
                        {date}
                        <button onClick={() => {
                          const newConfig = { ...user?.scheduleConfig };
                          if (newConfig.holidays) {
                            newConfig.holidays = newConfig.holidays.filter((d: string) => d !== date);
                            handleUpdateProfile({ scheduleConfig: newConfig });
                          }
                        }} className="hover:text-red-900 font-bold">×</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Bloqueos Parciales</h4>
                  <div className="flex flex-wrap gap-2">
                    {user?.scheduleConfig?.blockedBlocks?.map((block: any, idx: number) => (
                      <div key={idx} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-orange-200">
                        <Clock className="h-3 w-3" />
                        <span>{block.date}: {block.start} - {block.end}</span>
                        <button onClick={() => {
                          const newConfig = { ...user?.scheduleConfig };
                          if (newConfig.blockedBlocks) {
                            newConfig.blockedBlocks = newConfig.blockedBlocks.filter((_: any, i: number) => i !== idx);
                            handleUpdateProfile({ scheduleConfig: newConfig });
                          }
                        }} className="hover:text-orange-950 font-bold">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI SECTION */}
        {activeSection === 'ai' && (
          <Card>
            <CardHeader>
              <CardTitle>Inteligencia Artificial</CardTitle>
              <CardDescription>Personaliza la generación de informes y análisis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Idioma para Informes y Análisis</Label>
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
                  Este idioma definirá la redacción de los <strong>informes clínicos y el análisis post-sesión</strong>.
                  <br />
                  Nota: El <strong>Asistente en Vivo</strong> detectará automáticamente el idioma que hables.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* NOTIFICATIONS SECTION */}
        {activeSection === 'notifications' && (
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
        )}
      </main>
    </div>
  );
}