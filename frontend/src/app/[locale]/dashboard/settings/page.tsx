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
import { CalendarIcon, BrainCircuit, Bell, Settings, Clock, Euro, Users, Palette, FileJson } from 'lucide-react';
import { AgendaManagersSettings } from '@/components/dashboard/settings/agenda-managers-settings';
import { BrandingSettings } from '@/components/dashboard/settings/branding-settings';
import { GoogleCalendarConnect } from "@/components/settings/GoogleCalendarConnect";
import { Badge } from '@/components/ui/badge';
import { useTranslations, useLocale } from 'next-intl';

import { useRouter, usePathname } from '@/navigation';
import { useSearchParams } from 'next/navigation';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('Dashboard.Settings');
  const tAI = useTranslations('AISettings');
  const locale = useLocale();

  // Navigation State
  const [activeSection, setActiveSection] = useState<'agenda' | 'ai' | 'notifications' | 'managers' | 'branding' | 'privacy'>('agenda');

  // Form State
  // ... existing state ...

  // Sync URL with Active Section
  useEffect(() => {
    const section = searchParams.get('section');
    if (section && ['agenda', 'ai', 'notifications', 'managers', 'branding', 'privacy'].includes(section)) {
      setActiveSection(section as any);
    }
  }, [searchParams]);

  const handleSectionChange = (section: typeof activeSection) => {
    setActiveSection(section);
    router.push(`/dashboard/settings?section=${section}`, { scroll: false });
  };

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

      // Redirect if on Basic plan and trying to access blocked section
      const isBasic = user.subscription?.planType?.toUpperCase() === 'BASIC';
      if (isBasic && (activeSection === 'agenda' || activeSection === 'ai')) {
        setActiveSection('notifications');
      }
    }
  }, [user, activeSection]);

  // Update Handler
  const handleUpdateProfile = async (data: any) => {
    setLoading(true);
    try {
      const updatedUser = await AuthAPI.updateProfile(data);
      updateUser({ ...user!, ...updatedUser });
      toast({
        title: t('toasts.updateSuccess'),
        description: t('toasts.updateSuccessDesc'),
      });
    } catch (error) {
      console.error(error);
      toast({
        title: t('toasts.updateError'),
        description: t('toasts.updateErrorDesc'),
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
      toast({ title: t('toasts.holidayAdded'), description: t('toasts.holidayAddedDesc') });
      setBlockDate("");
    } else {
      toast({ title: t('toasts.holidayExists'), description: t('toasts.holidayExistsDesc') });
    }
  };

  const handleAddPartialBlock = () => {
    if (!blockDate || !blockStartTime || !blockEndTime) {
      toast({ title: t('toasts.blockError'), description: t('toasts.blockErrorDesc'), variant: "destructive" });
      return;
    }
    if (blockStartTime >= blockEndTime) {
      toast({ title: t('toasts.blockError'), description: t('toasts.blockTimeError'), variant: "destructive" });
      return;
    }

    const newConfig = { ...user?.scheduleConfig };
    if (!newConfig.blockedBlocks) newConfig.blockedBlocks = [];
    newConfig.blockedBlocks.push({ date: blockDate, start: blockStartTime, end: blockEndTime });

    updateUser({ ...user!, scheduleConfig: newConfig });
    handleUpdateProfile({ scheduleConfig: newConfig });

    setBlockStartTime("");
    setBlockEndTime("");
    toast({ title: t('toasts.blockAdded'), description: t('toasts.blockAddedDesc') });
  };

  const menuItems = [
    // Hide Agenda for Basic
    ...(user?.subscription?.planType?.toUpperCase() !== 'BASIC' ? [{ id: 'agenda', label: t('sections.agenda'), icon: CalendarIcon }] : []),
    // Solo mostrar Marca Personal si es PREMIUM
    ...((user?.subscription?.planType?.toUpperCase() === 'PREMIUM' || user?.role === 'ADMIN') ? [{ id: 'branding', label: t('sections.branding'), icon: Palette }] : []),
    // Solo mostrar Gestores de Agenda si tiene el pack activado con agendaManagerEnabled o es ADMIN
    ...((user?.agendaManagerEnabled === true || user?.role === 'ADMIN') ? [{ id: 'managers', label: t('sections.managers'), icon: Users }] : []),
    // Hide AI for Basic
    ...(user?.subscription?.planType?.toUpperCase() !== 'BASIC' ? [{ id: 'ai', label: t('sections.ai'), icon: BrainCircuit }] : []),
    { id: 'notifications', label: t('sections.notifications'), icon: Bell },
    { id: 'privacy', label: t('sections.privacy'), icon: FileJson },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 max-w-6xl mx-auto h-[calc(100vh-100px)]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 space-y-2">
        <div className="mb-6 px-4">
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id as any)}
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
              <CardTitle>{t('agenda.title')}</CardTitle>
              <CardDescription>{t('agenda.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Google Calendar Integration */}
              <div className="mb-6">
                <GoogleCalendarConnect />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t('agenda.defaultDuration')}</Label>
                  <Input
                    type="number"
                    value={defaultDuration}
                    onChange={(e) => setDefaultDuration(e.target.value)}
                    onBlur={(e) => handleUpdateProfile({ defaultDuration: parseInt(e.target.value) })}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('agenda.bufferTime')}</Label>
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
                <Label>{t('agenda.hourlyRate')}</Label>
                <Input
                  type="number"
                  defaultValue={user?.hourlyRate || 60}
                  onBlur={(e) => handleUpdateProfile({ hourlyRate: parseInt(e.target.value) })}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground pt-1">
                  {t('agenda.hourlyRateHelp')}
                </p>
              </div>



              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">{t('agenda.weeklySchedule.title')}</h3>
                <p className="text-sm text-gray-500">{t('agenda.weeklySchedule.subtitle')}</p>

                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6, 0].map((day) => { // Mon to Sun
                    const config = (user?.scheduleConfig?.weekly?.[day]) || { enabled: day !== 0 && day !== 6, start: workStartHour, end: workEndHour };

                    return (
                      <div key={day} className="flex flex-col md:flex-row md:items-center gap-3 py-4 md:py-2 border-b last:border-0">
                        <div className="flex items-center justify-between w-full md:w-auto gap-4">
                          <div className="w-24 font-medium">{t(`agenda.weeklySchedule.days.${day}`)}</div>
                          <div className="flex items-center gap-3 flex-1 md:flex-none">
                            <Checkbox
                              checked={config.enabled}
                              onCheckedChange={(checked) => {
                                const newConfig = { ...user?.scheduleConfig };
                                if (!newConfig.weekly) newConfig.weekly = {};
                                newConfig.weekly[day] = { ...config, enabled: !!checked };
                                updateUser({ ...user!, scheduleConfig: newConfig });
                                handleUpdateProfile({ scheduleConfig: newConfig });
                              }}
                            />
                            <span className="text-sm text-gray-500 w-16">{config.enabled ? t('agenda.weeklySchedule.open') : t('agenda.weeklySchedule.closed')}</span>
                          </div>
                        </div>

                        {config.enabled && (
                          <div className="flex items-center gap-2 w-full md:w-auto pl-0 md:pl-4">
                            <Input
                              type="time"
                              value={config.start}
                              className="flex-1 md:w-32"
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
                              className="flex-1 md:w-32"
                              onChange={(e) => {
                                const newConfig = { ...user?.scheduleConfig };
                                if (!newConfig.weekly) newConfig.weekly = {};
                                newConfig.weekly[day] = { ...config, end: e.target.value };
                                updateUser({ ...user!, scheduleConfig: newConfig });
                              }}
                              onBlur={() => handleUpdateProfile({ scheduleConfig: user?.scheduleConfig })}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>


              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">{t('agenda.blocks.title')}</h3>
                <p className="text-sm text-gray-500">{t('agenda.blocks.subtitle')}</p>

                <div className="flex flex-col gap-4 bg-muted/50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t('agenda.blocks.date')}</Label>
                      <Input
                        type="date"
                        value={blockDate}
                        onChange={(e) => setBlockDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('agenda.blocks.start')}</Label>
                      <Input
                        type="time"
                        value={blockStartTime}
                        onChange={(e) => setBlockStartTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('agenda.blocks.end')}</Label>
                      <Input
                        type="time"
                        value={blockEndTime}
                        onChange={(e) => setBlockEndTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Button onClick={handleAddHoliday} variant="secondary" className="flex-1" disabled={!blockDate}>
                      {t('agenda.blocks.blockFullDay')}
                    </Button>
                    <Button onClick={handleAddPartialBlock} className="flex-1" disabled={!blockDate || !blockStartTime || !blockEndTime}>
                      {t('agenda.blocks.blockPartial')}
                    </Button>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-200/50">
                    <h4 className="text-sm font-medium text-gray-700">{t('agenda.blocks.holidays')}</h4>
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
                        <p className="text-sm text-gray-400 italic">{t('agenda.blocks.noHolidays')}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">{t('agenda.blocks.partialBlocks')}</h4>
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



        {/* AI SECTION */}
        {activeSection === 'ai' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('ai.title')}</CardTitle>
              <CardDescription>{t('ai.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <Checkbox
                    checked={user?.brandingConfig?.syncAiLanguage !== false}
                    onCheckedChange={(checked) => {
                      const newConfig = { ...user?.brandingConfig, syncAiLanguage: !!checked };
                      const updates: any = { brandingConfig: newConfig };

                      // If turning ON, sync immediately
                      if (checked) {
                        updates.preferredLanguage = locale;
                        setPreferredLanguage(locale);
                      }

                      updateUser({ ...user!, brandingConfig: newConfig, ...(checked ? { preferredLanguage: locale } : {}) });
                      handleUpdateProfile(updates);
                    }}
                  />
                  <div className="space-y-1 leading-none">
                    <Label>{t('ai.syncLanguage')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('ai.syncLanguageHelp')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('ai.preferredLanguage')}</Label>
                  <Select
                    value={preferredLanguage}
                    onValueChange={(val) => {
                      setPreferredLanguage(val);
                      // Disable sync when manually selecting
                      const newConfig = { ...user?.brandingConfig, syncAiLanguage: false };
                      updateUser({ ...user!, brandingConfig: newConfig, preferredLanguage: val });

                      handleUpdateProfile({
                        preferredLanguage: val,
                        brandingConfig: newConfig
                      });
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('ai.selectLanguage')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">{t('ai.languages.es')}</SelectItem>
                      <SelectItem value="ca">{t('ai.languages.ca')}</SelectItem>
                      <SelectItem value="en">{t('ai.languages.en')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground mt-2">
                    {tAI.rich('helpText', {
                      strong: (chunks) => <strong>{chunks}</strong>,
                      p: (chunks) => <p className="mb-1 last:mb-0">{chunks}</p>
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* NOTIFICATIONS SECTION */}
        {activeSection === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('notifications.title')}</CardTitle>
              <CardDescription>{t('notifications.subtitle')}</CardDescription>
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
                    {t('notifications.enableReminders')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('notifications.remindersHelp')}
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
              <CardTitle>{t('managers.title')}</CardTitle>
              <CardDescription>{t('managers.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <AgendaManagersSettings />
            </CardContent>
          </Card>
        )}

        {/* PRIVACY SECTION */}
        {activeSection === 'privacy' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('privacy.title')}</CardTitle>
              <CardDescription>{t('privacy.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                <div className="space-y-1">
                  <h4 className="font-medium text-slate-900">{t('privacy.exportData.title')}</h4>
                  <p className="text-sm text-slate-500">
                    {t('privacy.exportData.description')}
                  </p>
                </div>
                <Button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const blob = await AuthAPI.exportDataCsv();

                      // Create Download
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `psicoaissist_export_${new Date().toISOString().split('T')[0]}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);

                      toast({ title: t('privacy.exportData.success'), description: t('privacy.exportData.successDesc') });
                    } catch (e) {
                      console.error(e);
                      toast({ title: t('toasts.updateError'), description: t('privacy.exportData.error'), variant: 'destructive' });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileJson className="w-4 h-4" />
                  {loading ? t('privacy.exportData.loading') : t('privacy.exportData.button')}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                <div className="space-y-1">
                  <h4 className="font-medium text-slate-900">{t('privacy.exportReports.title')}</h4>
                  <p className="text-sm text-slate-500">
                    {t('privacy.exportReports.description')}
                  </p>
                </div>
                <Button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const { ReportsAPI } = await import('@/lib/reports-api');
                      const blob = await ReportsAPI.exportAllPdfs();

                      if (blob.size < 100) {
                        // Small size usually indicates empty or error JSON response
                        toast({ title: t('toasts.updateError'), description: t('privacy.exportReports.warning'), variant: 'default' });
                        return;
                      }

                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `mis-informes-${new Date().toISOString().split('T')[0]}.zip`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);

                      toast({ title: t('privacy.exportReports.success'), description: t('privacy.exportReports.successDesc') });
                    } catch (e) {
                      console.error(e);
                      toast({ title: t('toasts.updateError'), description: t('privacy.exportReports.error'), variant: 'destructive' });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileJson className="w-4 h-4" />
                  {t('privacy.exportReports.button')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* BRANDING SECTION */}
        {activeSection === 'branding' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('branding.title')}</CardTitle>
              <CardDescription>{t('branding.subtitle')}</CardDescription>
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