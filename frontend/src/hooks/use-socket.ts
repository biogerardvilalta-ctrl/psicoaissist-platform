
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (url: string = 'http://localhost:3001') => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Init socket
        const socketIo = io(url, {
            transports: ['websocket'],
            autoConnect: true,
        });

        socketIo.on('connect', () => {
            setIsConnected(true);
            console.log('Socket connected');
        });

        socketIo.on('disconnect', () => {
            setIsConnected(false);
            console.log('Socket disconnected');
        });

        socketRef.current = socketIo;

        return () => {
            socketIo.disconnect();
        };
    }, [url]);

    return {
        socket: socketRef.current,
        isConnected
    };
};
