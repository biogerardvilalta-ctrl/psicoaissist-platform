"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    data?: any;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    sendTestNotification: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user, tokens } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!user || !tokens?.accessToken) {
            return;
        }

        // Initialize Socket
        // Socket.io connection usually connects to root, not /api/v1, unless configured otherwise on backend
        // Checking backend gateway: @WebSocketGateway({ namespace: 'notifications' }) -> path default is /socket.io
        // So this part is likely fine if backend doesn't put global prefix on websockets (NestJS default behavior)
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        // Remove /api/v1 suffix if present for the socket connection
        const socketBaseUrl = baseUrl.replace(/\/api\/v1$/, '');

        // Connect to the 'notifications' namespace
        const newSocket = io(`${socketBaseUrl}/notifications`, {
            auth: {
                token: tokens.accessToken,
            },

            reconnectionAttempts: 5,
        });

        newSocket.on('connect', () => {
            console.log('Connected to notification service');
        });

        newSocket.on('new_notification', (notification: Notification) => {
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Play sound
            try {
                const audio = new Audio('/sounds/notification.mp3'); // Assuming file exists or use external
                // Fallback to a simple beep if no file, but best to assume a file or use a data URI
                // Using a simple data URI for a "ding" sound to avoid 404s
                audio.src = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
                audio.play().catch(e => console.log('Audio play failed', e));
            } catch (e) {
                console.error("Audio error", e);
            }

            // Show toast
            toast({
                title: notification.title,
                description: notification.message,
                variant: notification.type === 'ERROR' ? 'destructive' : 'default',
            });
        });

        setSocket(newSocket);

        // Fetch initial notifications
        const fetchNotifications = async () => {
            try {
                // Correct base URL construction: handles if env var already has /api/v1
                let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
                // Remove trailing slash
                baseUrl = baseUrl.replace(/\/$/, '');
                // If the env URL DOES NOT end in /api/v1, populate it. If it does, leave it alone.
                if (!baseUrl.endsWith('/api/v1')) {
                    baseUrl = `${baseUrl}/api/v1`;
                }

                const res = await fetch(`${baseUrl}/notifications?limit=20`, {
                    headers: { Authorization: `Bearer ${tokens.accessToken}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                }

                const countRes = await fetch(`${baseUrl}/notifications/unread-count`, {
                    headers: { Authorization: `Bearer ${tokens.accessToken}` }
                });
                if (countRes.ok) {
                    const data = await countRes.json();
                    setUnreadCount(data.count);
                }
            } catch (err) {
                console.error("Failed to load notifications", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();

        return () => {
            newSocket.disconnect();
        };
    }, [user, tokens?.accessToken, toast]); // stable dependency on accessToken

    const markAsRead = async (id: string) => {
        try {
            let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
            baseUrl = baseUrl.replace(/\/$/, '');
            if (!baseUrl.endsWith('/api/v1')) {
                baseUrl = `${baseUrl}/api/v1`;
            }
            await fetch(`${baseUrl}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${tokens?.accessToken}` }
            });

            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
            baseUrl = baseUrl.replace(/\/$/, '');
            if (!baseUrl.endsWith('/api/v1')) {
                baseUrl = `${baseUrl}/api/v1`;
            }
            await fetch(`${baseUrl}/notifications/read-all`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${tokens?.accessToken}` }
            });

            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const sendTestNotification = async () => {
        try {
            let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
            baseUrl = baseUrl.replace(/\/$/, '');
            if (!baseUrl.endsWith('/api/v1')) {
                baseUrl = `${baseUrl}/api/v1`;
            }
            await fetch(`${baseUrl}/notifications/test`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${tokens?.accessToken}` }
            });
        } catch (error) {
            console.error("Failed to send test notification", error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, isLoading, markAsRead, markAllAsRead, sendTestNotification }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
