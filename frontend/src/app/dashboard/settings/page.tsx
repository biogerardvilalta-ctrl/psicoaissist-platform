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
import { CalendarIcon, BrainCircuit, Bell, Settings, Clock, Euro, Users, Palette } from 'lucide-react';
import { AgendaManagersSettings } from '@/components/dashboard/settings/agenda-managers-settings';
import { BrandingSettings } from '@/components/dashboard/settings/branding-settings';
import { GoogleCalendarConnect } from "@/components/settings/GoogleCalendarConnect";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  // Navigation State
  const [activeSection, setActiveSection] = useState<'agenda' | 'ai' | 'notifications' | 'billing' | 'managers' | 'branding'>('agenda');

  // Form State
  const [enableReminders, setEnableReminders] = useState<boolean>(false);
  const [defaultDuration, setDefaultDuration] = useState<string>("60");
  const [bufferTime, setBufferTime] = useState<string>("10");
  const [workStartHour, setWorkStartHour] = useState<string>("09:00");
  const [workEndHour, setWorkEndHour] = useState<string>("18:00");
  const [preferredLanguage, setPreferredLanguage] = useState<string>("ca");
  const [loading, setLoading] = useState(false);

  // Blocking State
  const [blockDate, setBlockDate] = useState<string>("");
  const [blockStartTime, setBlockStartTime] = useState<string>("");
  const [blockEndTime, setBlockEndTime] = useState<string>("");

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

  const handleAddHoliday = () => {
    if (!blockDate) return;
    const newConfig = { ...user?.scheduleConfig };
    if (!newConfig.holidays) newConfig.holidays = [];

    if (!newConfig.holidays.includes(blockDate)) {
      newConfig.holidays.push(blockDate);
      updateUser({ ...user!, scheduleConfig: newConfig });
      handleUpdateProfile({ scheduleConfig: newConfig });
      toast({ title: "Día bloqueado", description: "Se ha añadido el día festivo." });
      setBlockDate("");
    } else {
      toast({ title: "Info", description: "Este día ya está bloqueado." });
    }
  };

  const handleAddPartialBlock = () => {
    if (!blockDate || !blockStartTime || !blockEndTime) {
      toast({ title: "Error", description: "Completa fecha y horas.", variant: "destructive" });
      return;
    }
    if (blockStartTime >= blockEndTime) {
      toast({ title: "Error", description: "La hora de inicio debe ser anterior a la final.", variant: "destructive" });
      return;
    }

    const newConfig = { ...user?.scheduleConfig };
    if (!newConfig.blockedBlocks) newConfig.blockedBlocks = [];
    newConfig.blockedBlocks.push({ date: blockDate, start: blockStartTime, end: blockEndTime });

    updateUser({ ...user!, scheduleConfig: newConfig });
    handleUpdateProfile({ scheduleConfig: newConfig });

    setBlockStartTime("");
    setBlockEndTime("");
    toast({ title: "Bloqueo añadido", description: "Se ha añadido el bloqueo horario." });
  };

  const menuItems = [
    { id: 'agenda', label: 'Agenda y Calendario', icon: CalendarIcon },
    { id: 'billing', label: 'Facturación y Tarifas', icon: Euro },
    // Solo mostrar Marca Personal si es PREMIUM
    ...((user?.subscription?.planType === 'PREMIUM' || user?.role === 'ADMIN') ? [{ id: 'branding', label: 'Marca Personal', icon: Palette }] : []),
    { id: 'managers', label: 'Gestores de Agenda', icon: Users },
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

              {/* Google Calendar Integration */}
              <div className="mb-6">
                <GoogleCalendarConnect />
              </div>

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

                <div className="flex flex-col gap-4 bg-muted/50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Input
                        type="date"
                        value={blockDate}
                        onChange={(e) => setBlockDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Inicio</Label>
                      <Input
                        type="time"
                        value={blockStartTime}
                        onChange={(e) => setBlockStartTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fin</Label>
                      <Input
                        type="time"
                        value={blockEndTime}
                        onChange={(e) => setBlockEndTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button onClick={handleAddHoliday} variant="secondary" className="flex-1" disabled={!blockDate}>
                      Bloquear Día Completo
                    </Button>
                    <Button onClick={handleAddPartialBlock} className="flex-1" disabled={!blockDate || !blockStartTime || !blockEndTime}>
                      Bloquear Horario
                    </Button>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-200/50">
                    <h4 className="text-sm font-medium text-gray-700">Días Festivos (Día Completo)</h4>
                    <div className="flex flex-wrap gap-2">
                      {(user?.scheduleConfig?.holidays?.length || 0) > 0 ? (
                        user?.scheduleConfig?.holidays?.map((date: string) => (
                          <div key={date} className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-rose-200">
                            <CalendarIcon className="h-3 w-3" />
                            {date}
                            <button onClick={() => {
                              const newConfig = { ...user?.scheduleConfig };
                              if (newConfig.holidays) {
                                newConfig.holidays = newConfig.holidays.filter((d: string) => d !== date);
                                updateUser({ ...user!, scheduleConfig: newConfig }); // Update local
                                handleUpdateProfile({ scheduleConfig: newConfig });
                              }
                            }} className="hover:text-rose-900 font-bold ml-1">×</button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 italic">No hay días festivos configurados.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Bloqueos Parciales</h4>
                  <div className="flex flex-wrap gap-2">
                    {user?.scheduleConfig?.blockedBlocks?.map((block: any, idx: number) => (
                      <div key={idx} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-amber-200">
                        <Clock className="h-3 w-3" />
                        <span>{block.date}: {block.start} - {block.end}</span>
                        <button onClick={() => {
                          const newConfig = { ...user?.scheduleConfig };
                          if (newConfig.blockedBlocks) {
                            newConfig.blockedBlocks = newConfig.blockedBlocks.filter((_: any, i: number) => i !== idx);
                            updateUser({ ...user!, scheduleConfig: newConfig }); // Update local
                            handleUpdateProfile({ scheduleConfig: newConfig });
                          }
                        }} className="hover:text-amber-950 font-bold ml-1">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* BILLING SECTION */}
        {activeSection === 'billing' && (
          <Card>
            <CardHeader>
              <CardTitle>Facturación y Tarifas</CardTitle>
              <CardDescription>Gestiona tus tarifas y configuración de facturación.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Precio Sesión/Hora (€)</Label>
                  <Input
                    type="number"
                    defaultValue={user?.hourlyRate || 60}
                    onBlur={(e) => handleUpdateProfile({ hourlyRate: parseInt(e.target.value) })}
                    disabled={loading}
                    className="max-w-xs"
                  />
                  <p className="text-sm text-gray-500">
                    Este valor se utilizará para calcular los ingresos estimados en el dashboard y las estadísticas.
                  </p>
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
              <CardDescription>Personaliza la generación de informes, análisis y el simulador de pacientes.</CardDescription>
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
                  {preferredLanguage === 'ca' && (
                    <>
                      Aquest idioma definirà la redacció dels <strong>informes clínics, l'anàlisi post-sessió i l'idioma del simulador de pacients</strong>.
                      <br />
                      Nota: L'<strong>Assistent en Viu</strong> detectarà automàticament l'idioma que parlis.
                    </>
                  )}
                  {preferredLanguage === 'en' && (
                    <>
                      This language will determine the wording of <strong>clinical reports, post-session analysis, and the patient simulator language</strong>.
                      <br />
                      Note: The <strong>Live Assistant</strong> will automatically detect the language you speak.
                    </>
                  )}
                  {preferredLanguage !== 'ca' && preferredLanguage !== 'en' && (
                    <>
                      Este idioma definirá la redacción de los <strong>informes clínicos, el análisis post-sesión y el idioma del simulador de pacientes</strong>.
                      <br />
                      Nota: El <strong>Asistente en Vivo</strong> detectará automáticamente el idioma que hables.
                    </>
                  )}
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

        {/* AGENDA MANAGERS SECTION */}
        {activeSection === 'managers' && (
          <Card>
            <CardHeader>
              <CardTitle>Gestores de Agenda</CardTitle>
              <CardDescription>Gestiona los usuarios que tienen acceso a tu agenda y pacientes.</CardDescription>
            </CardHeader>
            <CardContent>
              <AgendaManagersSettings />
            </CardContent>
          </Card>
        )}

        {/* BRANDING SECTION */}
        {activeSection === 'branding' && (
          <Card>
            <CardHeader>
              <CardTitle>Marca Personal</CardTitle>
              <CardDescription>Personaliza el aspecto de tus informes y documentos con tu identidad corporativa.</CardDescription>
            </CardHeader>
            <CardContent>
              <BrandingSettings />
            </CardContent>
          </Card>
        )}
      </main>
    </div >
  );
}