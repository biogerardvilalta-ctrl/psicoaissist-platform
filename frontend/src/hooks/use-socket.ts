import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from '@/navigation';

export type ConnectionState = 'connected' | 'disconnected' | 'reconnecting';

export const useSocket = (url: string = 'http://localhost:3001', token?: string | null) => {
    const socketRef = useRef<Socket | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [isAiLimitReached, setIsAiLimitReached] = useState(false);
    const retryCountRef = useRef(0);

    useEffect(() => {
        const authToken = token || localStorage.getItem('psychoai_access_token');
        let reconnectTimer: NodeJS.Timeout;

        const connect = () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }

            const socketIo = io(url, {
                transports: ['websocket'],
                autoConnect: true,
                reconnection: false, // We handle reconnection manually for custom backoff
                auth: { token: authToken }
            });

            socketIo.on('connect', () => {
                setConnectionState('connected');
                retryCountRef.current = 0;
                console.log('Socket connected');
            });

            socketIo.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                if (reason === 'io server disconnect') {
                    setConnectionState('disconnected');
                } else {
                    setConnectionState('reconnecting');
                    scheduleReconnect();
                }
            });

            socketIo.on('connect_error', (err) => {
                console.log('Socket connect_error:', err);
                setConnectionState('reconnecting');
                scheduleReconnect();
            });

            socketIo.on('ai_limit_reached', (data: { message: string }) => {
                console.log('%c[SOCKET] AI Limit Reached Event Received:', 'color: red; font-weight: bold;', data);
                setIsAiLimitReached(true);
            });

            // Handle multiple sessions
            socketIo.on('session_terminated', (data: any) => {
                console.log('Session terminated by another device', data);
                // Note: to implement full modal and redirect, this should ideally be handled in auth context or use a toast + navigation.
                toast({
                    title: "Sessió tancada",
                    description: "S'ha iniciat sessió des d'un altre dispositiu. La sessió actual s'ha tancat.",
                    variant: "destructive"
                });
                router.push('/auth/login');
            });

            socketRef.current = socketIo;
        };

        const scheduleReconnect = () => {
            clearTimeout(reconnectTimer);
            const backoff = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
            retryCountRef.current++;
            console.log(`Reconnecting in ${backoff}ms...`);
            reconnectTimer = setTimeout(() => {
                connect();
            }, backoff);
        };

        connect();

        return () => {
            clearTimeout(reconnectTimer);
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [url, token]);

    return {
        socket: socketRef.current,
        isConnected: connectionState === 'connected',
        connectionState,
        isAiLimitReached
    };
};
