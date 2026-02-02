import { useEffect, useState, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

type NetworkQuality = 'good' | 'fair' | 'poor' | 'unknown';

// ICE Servers default (fallback)
const DEFAULT_ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
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
    const [networkQuality, setNetworkQuality] = useState<NetworkQuality>('unknown');
    const [iceConfig, setIceConfig] = useState<RTCConfiguration | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);

    // Fetch ICE Servers (TURN/STUN)
    useEffect(() => {
        const fetchIceConfig = async () => {
            try {
                // Adjust URL based on your env or proxy setup
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
                const res = await fetch(`${apiUrl}/webrtc/ice-config`);
                if (res.ok) {
                    const data = await res.json();
                    console.log("Fetched ICE Config:", data);
                    setIceConfig(data);
                } else {
                    console.warn("Failed to fetch ICE config, using default STUN");
                    setIceConfig(DEFAULT_ICE_SERVERS);
                }
            } catch (error) {
                console.error("Error fetching ICE config:", error);
                setIceConfig(DEFAULT_ICE_SERVERS);
            }
        };

        fetchIceConfig();
    }, []);

    // Initialize PeerConnection
    const createPeerConnection = useCallback((overrideRoomId?: string) => {
        if (peerConnection.current) return peerConnection.current;
        if (!iceConfig) {
            console.warn("createPeerConnection called before ICE config loaded. waiting...");
            return null;
        }

        console.log("Creating new RTCPeerConnection with config", iceConfig);
        const pc = new RTCPeerConnection(iceConfig);

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
    }, [socket, localStream, iceConfig]);

    // Handle Signaling
    useEffect(() => {
        if (!socket) return; // Only block on socket, not roomId

        const handleSignal = async (data: { type: string; payload: any; sender: string; roomId?: string }) => {
            // Use roomId from data if available (race condition fix), else ref
            const activeRoomId = data.roomId || roomIdRef.current || undefined;

            if (!peerConnection.current) {
                const pc = createPeerConnection(activeRoomId);
                if (!pc) return; // Wait for ICE config
            }
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
                    if (!pc) return; // ICE config not ready
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
                if (!pc) return;
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

    // Network Quality Monitoring
    useEffect(() => {
        if (connectionStatus !== 'connected' || !peerConnection.current) {
            setNetworkQuality('unknown');
            return;
        }

        const pc = peerConnection.current;
        let lastPacketsLost = 0;
        let lastTime = Date.now();

        const interval = setInterval(async () => {
            if (pc.connectionState !== 'connected') return;

            try {
                const stats = await pc.getStats();
                let currentPacketsLost = 0;
                let roundTripTime = 0;

                stats.forEach(report => {
                    if (report.type === 'inbound-rtp' && report.kind === 'video') {
                        currentPacketsLost = report.packetsLost;
                    }
                    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                        roundTripTime = report.currentRoundTripTime;
                    }
                });

                const now = Date.now();
                // Packets lost per second logic could be added here, 
                // but for simplicity we rely on RTT and cumulative loss delta.

                // Simple Heuristic:
                // RTT > 300ms = Poor
                // RTT > 150ms = Fair
                // RTT <= 150ms = Good

                // Also check packet loss delta ideally, but RTT is a good proxy for latency/congestion.

                if (roundTripTime > 0.3) {
                    setNetworkQuality('poor');
                } else if (roundTripTime > 0.15) {
                    setNetworkQuality('fair');
                } else {
                    setNetworkQuality('good');
                }

                // console.log(`RTT: ${roundTripTime}, Quality: ${networkQuality}`);

            } catch (e) {
                console.warn("Error getting stats", e);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [connectionStatus]);

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
        connectionStatus,
        networkQuality
    };
}
