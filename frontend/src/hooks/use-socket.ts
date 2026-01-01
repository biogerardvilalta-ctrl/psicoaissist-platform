import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (url: string = 'http://localhost:3001') => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isAiLimitReached, setIsAiLimitReached] = useState(false); // Added state

    useEffect(() => {
        // Init socket
        const token = localStorage.getItem('psychoai_access_token');
        const socketIo = io(url, {
            transports: ['websocket'],
            autoConnect: true,
            auth: {
                token: token
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
            console.warn('AI Limit Reached:', data.message);
            setIsAiLimitReached(true);
        });

        socketRef.current = socketIo;

        return () => {
            socketIo.disconnect();
        };
    }, [url]);

    return {
        socket: socketRef.current,
        isConnected,
        isAiLimitReached
    };
};
