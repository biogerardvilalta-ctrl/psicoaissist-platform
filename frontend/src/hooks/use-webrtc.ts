import { useEffect, useState, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
    ],
};

interface WebRTCProps {
    socket: Socket | null;
    roomId: string | null;
    localStream: MediaStream | null;
    identity: 'host' | 'guest'; // 'host' (Pro) initiates the call
}

export function useWebRTC({ socket, roomId, localStream, identity }: WebRTCProps) {
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'initial' | 'connecting' | 'connected' | 'disconnected'>('initial');
    const peerConnection = useRef<RTCPeerConnection | null>(null);

    // Initialize PeerConnection
    const createPeerConnection = useCallback(() => {
        if (peerConnection.current) return peerConnection.current;

        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = (event) => {
            if (event.candidate && socket && roomId) {
                socket.emit('signal', {
                    roomId,
                    type: 'ice-candidate',
                    payload: event.candidate,
                });
            }
        };

        pc.ontrack = (event) => {
            console.log("Received remote track", event.streams[0]);
            setRemoteStream(event.streams[0]);
        };

        pc.onconnectionstatechange = () => {
            console.log("Connection State:", pc.connectionState);
            switch (pc.connectionState) {
                case 'connected':
                    setConnectionStatus('connected');
                    break;
                case 'disconnected':
                case 'failed':
                case 'closed':
                    setConnectionStatus('disconnected');
                    break;
                default:
                    setConnectionStatus('connecting');
            }
        };

        // Add local tracks
        if (localStream) {
            localStream.getTracks().forEach(track => {
                pc.addTrack(track, localStream);
            });
        }

        peerConnection.current = pc;
        return pc;
    }, [socket, roomId, localStream]);

    // Handle Signaling
    useEffect(() => {
        if (!socket || !roomId) return;

        const handleSignal = async (data: { type: string; payload: any; sender: string }) => {
            if (!peerConnection.current) createPeerConnection();
            const pc = peerConnection.current!;

            try {
                if (data.type === 'offer') {
                    console.log("Received Offer");
                    await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit('signal', {
                        roomId,
                        type: 'answer',
                        payload: answer
                    });
                } else if (data.type === 'answer') {
                    console.log("Received Answer");
                    await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
                } else if (data.type === 'ice-candidate') {
                    // console.log("Received ICE Candidate");
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(data.payload));
                    } catch (e) {
                        console.error("Error adding ice candidate", e);
                    }
                }
            } catch (error) {
                console.error("Signaling Error", error);
            }
        };

        socket.on('signal', handleSignal);

        // If I am the HOST, and a peer joins, I must INITIATE the offer.
        const handlePeerJoined = async () => {
            console.log("Peer Joined. Identity:", identity);
            if (identity === 'host') {
                console.log("Creating Offer...");
                const pc = createPeerConnection();
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('signal', {
                    roomId,
                    type: 'offer',
                    payload: offer
                });
            }
        };

        socket.on('peer-joined', handlePeerJoined);

        return () => {
            socket.off('signal', handleSignal);
            socket.off('peer-joined', handlePeerJoined);
        };
    }, [socket, roomId, identity, createPeerConnection]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }
        };
    }, []);

    return {
        remoteStream,
        connectionStatus
    };
}
