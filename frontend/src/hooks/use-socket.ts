import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (url: string = 'http://localhost:3001', token?: string | null) => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isAiLimitReached, setIsAiLimitReached] = useState(false); // Added state

    useEffect(() => {
        // Resolve token: explicit arg > localStorage
        const authToken = token || localStorage.getItem('psychoai_access_token');

        // Init socket
        const socketIo = io(url, {
            transports: ['websocket'],
            autoConnect: true,
            auth: {
                token: authToken
            }
        });

        socketIo.on('connect', () => {
            setIsConnected(true);
            console.log('Socket connected');
        });

        socketIo.on('disconnect', () => {
            setIsConnected(false);
            console.log('Socket disconnected');
        });

        // Added event listener for 'ai_limit_reached'
        socketIo.on('ai_limit_reached', (data: { message: string }) => {
            console.log('%c[SOCKET] AI Limit Reached Event Received:', 'color: red; font-weight: bold;', data);
            setIsAiLimitReached(true);
        });

        socketRef.current = socketIo;

        return () => {
            socketIo.disconnect();
        };
    }, [url, token]);

    return {
        socket: socketRef.current,
        isConnected,
        isAiLimitReached
    };
};
