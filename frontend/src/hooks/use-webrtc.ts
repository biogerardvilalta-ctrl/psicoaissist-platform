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
    const roomIdRef = useRef(roomId);

    // Update ref when prop changes
    useEffect(() => {
        roomIdRef.current = roomId;
    }, [roomId]);

    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'initial' | 'connecting' | 'connected' | 'disconnected'>('initial');
    const peerConnection = useRef<RTCPeerConnection | null>(null);

    // Initialize PeerConnection
    const createPeerConnection = useCallback((overrideRoomId?: string) => {
        if (peerConnection.current) return peerConnection.current;

        console.log("Creating new RTCPeerConnection");
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = (event) => {
            const targetRoomId = overrideRoomId || roomIdRef.current;
            if (event.candidate && socket && targetRoomId) {
                socket.emit('signal', {
                    roomId: targetRoomId,
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
    }, [socket, localStream]);

    // Handle Signaling
    useEffect(() => {
        if (!socket) return; // Only block on socket, not roomId

        const handleSignal = async (data: { type: string; payload: any; sender: string; roomId?: string }) => {
            // Use roomId from data if available (race condition fix), else ref
            const activeRoomId = data.roomId || roomIdRef.current || undefined;

            if (!peerConnection.current) createPeerConnection(activeRoomId);
            const pc = peerConnection.current!;

            try {
                if (data.type === 'offer') {
                    console.log("Received Offer");
                    await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);

                    if (activeRoomId) {
                        socket.emit('signal', {
                            roomId: activeRoomId,
                            type: 'answer',
                            payload: answer
                        });
                    } else {
                        console.error("Cannot send answer: No Room ID available");
                    }
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
                console.log("Creating Offer (Peer Joined)...");
                const roomIdToUse = roomIdRef.current;
                if (roomIdToUse) {
                    const pc = createPeerConnection(roomIdToUse);
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket.emit('signal', {
                        roomId: roomIdToUse,
                        type: 'offer',
                        payload: offer
                    });
                }
            }
        };

        const handleRoomJoined = async (data: any) => {
            console.log("[useWebRTC] Room Joined Event", data);

            // If I am Host and there are already people here (peerCount > 1), I should offer.
            if (identity === 'host' && data.peerCount > 1 && data.roomId) {
                console.log("[useWebRTC] Creating Offer (Late Join Trigger)...");
                const pc = createPeerConnection(data.roomId);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('signal', {
                    roomId: data.roomId,
                    type: 'offer',
                    payload: offer
                });
            } else {
                console.log(`[useWebRTC] Not initiating offer. Identity: ${identity}, Peers: ${data.peerCount}`);
            }
        };

        socket.on('peer-joined', handlePeerJoined);
        socket.on('room-joined', handleRoomJoined);

        return () => {
            socket.off('signal', handleSignal);
            socket.off('peer-joined', handlePeerJoined);
            socket.off('room-joined', handleRoomJoined);
        };
    }, [socket, identity, createPeerConnection]); // Removed roomId dependency

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
