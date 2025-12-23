"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { httpClient } from "@/lib/http-client";
import { useAuth } from "@/contexts/auth-context";
import { AuthAPI } from "@/lib/auth-api";

export function GoogleCalendarConnect() {
    const { toast } = useToast();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (user?.googleRefreshToken) {
            setIsConnected(true);
        }
    }, [user]);

    useEffect(() => {
        const handleCallback = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const error = params.get('error');

            if (error) {
                toast({
                    title: "Error de conexión",
                    description: "No se pudo conectar con Google Calendar.",
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
                        title: "Conectado",
                        description: "Google Calendar se ha conectado correctamente.",
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
                        title: "Error",
                        description: "Fallo al intercambiar el token con Google.",
                        variant: "destructive"
                    });
                } finally {
                    setLoading(false);
                }
            }
        };

        handleCallback();
    }, [updateUser, toast]);

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
                title: "Error",
                description: "Failed to initiate Google connection",
                variant: "destructive"
            });
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Integración con Google Calendar</CardTitle>
                <CardDescription>
                    Conecta tu calendario para sincronizar eventos automáticamente.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Estado</p>
                        <p className={`text-sm ${isConnected ? "text-green-600 font-bold" : "text-muted-foreground"}`}>
                            {isConnected ? "Conectado" : "No conectado"}
                        </p>
                    </div>
                    <Button onClick={handleConnect} disabled={loading || isConnected} variant={isConnected ? "outline" : "default"}>
                        {loading ? "Conectando..." : isConnected ? "Conectado" : "Conectar Google Calendar"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
