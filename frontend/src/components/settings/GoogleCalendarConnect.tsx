"use client";

import { useTranslations } from "next-intl";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { httpClient } from "@/lib/http-client";
import { useAuth } from "@/contexts/auth-context";
import { AuthAPI } from "@/lib/auth-api";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function GoogleCalendarConnect() {
    const { toast } = useToast();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [importEnabled, setImportEnabled] = useState(true);

    useEffect(() => {
        if (user?.googleRefreshToken) {
            setIsConnected(true);
            setImportEnabled(user.googleImportCalendar ?? true);
        }
    }, [user]);

    const t = useTranslations('Dashboard.Settings.GoogleCalendar');

    useEffect(() => {
        const handleCallback = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const error = params.get('error');

            if (error) {
                toast({
                    title: t('toasts.errorTitle'),
                    description: t('toasts.errorDesc'),
                    variant: "destructive"
                });
                return;
            }

            if (code) {
                setLoading(true);
                // Clear code from URL to prevent loop/re-submission
                window.history.replaceState({}, document.title, window.location.pathname);

                try {
                    await httpClient.post('/api/v1/google/callback', { code });
                    toast({
                        title: t('toasts.connectedTitle'),
                        description: t('toasts.connectedDesc'),
                    });
                    setIsConnected(true);

                    // Refresh user profile
                    try {
                        const updatedUser = await AuthAPI.getCurrentUser();
                        updateUser(updatedUser);
                    } catch (e) {
                        console.error("Error refreshing profile", e);
                    }

                } catch (err) {
                    console.error(err);
                    toast({
                        title: t('toasts.errorTitle'),
                        description: t('toasts.errorDesc'),
                        variant: "destructive"
                    });
                } finally {
                    setLoading(false);
                }
            }
        };

        handleCallback();
    }, [updateUser, toast, t]);

    const handleToggleImport = async (checked: boolean) => {
        setImportEnabled(checked);
        try {
            const updated = await AuthAPI.updateProfile({ googleImportCalendar: checked });
            updateUser(updated);
            toast({
                title: t('toasts.updatedTitle'),
                description: checked ? t('toasts.updatedDesc') : t('toasts.updatedDescOff'),
            });
        } catch (error) {
            console.error(error);
            setImportEnabled(!checked); // Revert
            toast({ variant: 'destructive', title: t('toasts.errorTitle'), description: t('toasts.errorDesc') });
        }
    };

    const handleConnect = async () => {
        setLoading(true);
        try {
            const data = await httpClient.get<{ url: string }>('/api/v1/google/auth-url');
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No URL returned');
            }
        } catch (error) {
            console.error(error);
            toast({
                title: t('toasts.errorTitle'),
                description: t('toasts.errorDesc'),
                variant: "destructive"
            });
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>
                    {t('description')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium">{t('status')}</p>
                        <p className={`text-sm ${isConnected ? "text-green-600 font-bold" : "text-muted-foreground"}`}>
                            {isConnected ? t('connected') : t('disconnected')}
                        </p>
                    </div>
                    <Button
                        onClick={handleConnect}
                        disabled={loading || isConnected}
                        variant={isConnected ? "outline" : "default"}
                        className="w-full sm:w-auto"
                    >
                        {loading ? t('connecting') : isConnected ? t('connected') : t('connectButton')}
                    </Button>
                </div>

                {isConnected && (
                    <div className="flex items-center space-x-2 pt-4 border-t">
                        <Checkbox
                            id="import-google"
                            checked={importEnabled}
                            onCheckedChange={handleToggleImport}
                        />
                        <Label htmlFor="import-google">{t('importEvents')}</Label>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
