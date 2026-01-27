
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AiService } from '../ai/ai.service';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // You might need to import JwtModule in SessionsModule
import { PrismaService } from '../../common/prisma/prisma.service';
import { PLAN_FEATURES } from '../payments/plan-features';
import { UsageLimitsService } from '../payments/usage-limits.service';

@WebSocketGateway({
    cors: {
        origin: '*', // Adjust in production
    },
    namespace: 'sessions', // Optional namespace
})
export class SessionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(SessionsGateway.name);
    // Track active sessions: socketId -> { sessionId, userId, startTime, lastDeductionTime, isLimitReached, lastAiRequestTime }
    private activeSessions = new Map<string, {
        sessionId: string;
        userId: string;
        interval: NodeJS.Timeout;
        limitReached: boolean;
        lastAiRequestTime?: number;
    }>();

    constructor(
        private readonly aiService: AiService,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly usageLimitsService: UsageLimitsService,
    ) { }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    async handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.stopTracking(client.id);
    }

    private stopTracking(clientId: string) {
        const session = this.activeSessions.get(clientId);
        if (session) {
            clearInterval(session.interval);
            this.activeSessions.delete(clientId);
            console.log(`[SessionsGateway] Stopped tracking for client ${clientId}`);
        }
    }

    @SubscribeMessage('joinSession')
    async handleJoinSession(
        @MessageBody() data: { sessionId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { sessionId } = data;
        client.join(`session_${sessionId}`);
        this.logger.log(`Client ${client.id} joined session_${sessionId}`);

        // Start tracking time for this user
        // 1. Identify User
        try {
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
            if (token) {
                const payload = this.jwtService.decode(token) as any;
                if (payload && payload.sub) {
                    const userId = payload.sub;
                    // Stop any existing tracking for this socket to be safe
                    this.stopTracking(client.id);
                    // Do NOT start interval here. Wait for start_recording.
                    console.log(`[SessionsGateway] User ${userId} joined session ${sessionId}.`);

                    // Removed: Do NOT check limit on join to avoid annoying modal. Check only on Record.
                }
            }
        } catch (e) {
            console.error('[SessionsGateway] Failed to start tracking', e);
        }

        return { event: 'joined', sessionId };
    }

    private async checkAndNotifyLimit(client: Socket, userId: string) {
        try {
            // Check if user is already at or over limit (using 1 to be safe/strict, or 0 if we want to allow exactly at limit to start? 
            // If at 600/600, we should block. So check(userId, 1) -> 601 > 600 throws.
            await this.usageLimitsService.checkTranscriptionLimit(userId, 1);
        } catch (e) {
            client.emit('ai_limit_reached', { message: 'Tu límite de transcripción se ha agotado.' });
            return true;
        }
        return false;
    }

    private async processMinuteDeduction(client: Socket, userId: string) {
        const sessionData = this.activeSessions.get(client.id);
        if (!sessionData) return;

        try {
            // Deduct 1 minute (60 seconds)
            const result: any = await this.usageLimitsService.incrementTranscriptionUsage(userId, 60);

            if (result.limitExceeded || (result.remainingMinutes !== undefined && result.remainingMinutes <= 0)) {
                sessionData.limitReached = true;
                this.activeSessions.set(client.id, sessionData);

                // Notify Client
                client.emit('ai_limit_reached', { message: 'Has consumido tus minutos de IA.' });
                console.log(`[SessionsGateway] Limit reached for user ${userId}. AI stopped.`);
            }
        } catch (e) {
            console.error(`[SessionsGateway] Error processing deduction for user ${userId}`, e);
        }
    }

    @SubscribeMessage('updateNotes')
    async handleUpdateNotes(
        @MessageBody() data: { sessionId: string; notes: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { sessionId, notes } = data;
        // console.log(`[SessionsGateway] Received notes update for session ${sessionId}`);

        // 1. Check if limit reached locally first
        const sessionData = this.activeSessions.get(client.id);
        if (sessionData && sessionData.limitReached) {
            // Limit reached, do NOT process AI
            return;
        }

        // 2. Authentication & Feature Check logic
        let userId: string;
        try {
            // Extract token from handshake auth or headers
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');

            if (!token) {
                client.emit('debug_log', { message: "No Token Found" });
                return;
            }

            const payload = this.jwtService.decode(token) as any;
            if (!payload || !payload.sub) {
                client.emit('debug_log', { message: "Invalid Token Payload" });
                return;
            }

            userId = payload.sub;

            // Check Plan Features
            // Check Plan Features using centralized logic (Respects Role Override)
            const planFeatures = await this.usageLimitsService.getPlanFeatures(userId);

            client.emit('debug_log', { message: `Plan Check: ${planFeatures ? 'OK' : 'FAIL'} (Analytics: ${planFeatures?.advancedAnalytics})` });

            if (!planFeatures?.advancedAnalytics) {
                return;
            }

            // Double check if limit reached in DB? 
            // Might be heavy to do on every keystroke/update. 
            // We rely on the interval flag 'limitReached' which is updated every minute.

        } catch (e) {
            console.error(`[SessionsGateway] Auth check failed: ${e.message}`);
            client.emit('debug_log', { message: `Auth Error: ${e.message}` });
            return;
        }

        // 3. Process AI Suggestions
        try {
            // Rate Limiting & Optimization
            // a) Length Check: Ignore very short updates (e.g. "Ah") to save tokens and calls
            // DEBUG: Lowered to 5 for testing. Original: 50
            if (!notes || notes.trim().length < 5) {
                // client.emit('debug_log', { message: `Too short: ${notes?.length || 0}` });
                return;
            }

            // b) Time Throttling: Max 1 call every 5 seconds per client
            const now = Date.now();
            if (sessionData && sessionData.lastAiRequestTime) {
                const timeSinceLastCall = now - sessionData.lastAiRequestTime;
                if (timeSinceLastCall < 5000) {
                    // client.emit('debug_log', { message: "Throttled" });
                    return;
                }
            }

            client.emit('debug_log', { message: "Calling AI Service..." });
            console.log(`[SessionsGateway] Requesting AI suggestions for User ${userId} (${notes.length} chars)`);
            const suggestions = await this.aiService.getLiveSuggestions(notes);
            console.log(`[SessionsGateway] AI Suggestions generated:`, suggestions ? 'Yes' : 'No');

            if (suggestions && (suggestions.questions.length > 0 || suggestions.considerations.length > 0)) {
                client.emit('debug_log', { message: `AI Success: ${suggestions.questions.length} Qs` });
                client.emit('aiSuggestions', suggestions);
            } else {
                client.emit('debug_log', { message: "AI Returned Empty. Sending Mock." });
                // MOCK FALLBACK TO PROVE PIPELINE
                client.emit('aiSuggestions', {
                    questions: ["¿Mock: Como te hace sentir esto?", "Mock: ¿Puedes elaborar?"],
                    considerations: ["Mock: Observar lenguaje corporal"],
                    indicators: []
                });
            }

            // Update throttle timestamp
            if (sessionData) {
                sessionData.lastAiRequestTime = now;
                this.activeSessions.set(client.id, sessionData);
            }

        } catch (error) {
            this.logger.error(`Error processing AI suggestions: ${error.message}`);
            client.emit('debug_log', { message: `AI Error: ${error.message}` });
        }
    }

    @SubscribeMessage('start_recording')
    async handleStartRecording(
        @MessageBody() data: { sessionId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { sessionId } = data;
        const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
        if (!token) return;

        try {
            const payload = this.jwtService.decode(token) as any;
            if (payload && payload.sub) {
                const userId = payload.sub;

                // Stop prior if any
                this.stopTracking(client.id);

                // Immediate check for existing limits (before starting interval)
                // Use helper to check and notify
                const isLimitReached = await this.checkAndNotifyLimit(client, userId);
                if (isLimitReached) {
                    console.warn(`[SessionsGateway] User ${userId} already at limit. Blocking recording start.`);
                    return;
                }

                const interval = setInterval(async () => {
                    await this.processMinuteDeduction(client, userId);
                }, 60 * 1000);

                this.activeSessions.set(client.id, {
                    sessionId,
                    userId,
                    interval,
                    limitReached: false
                });

                console.log(`[SessionsGateway] Started recording & billing for user ${userId} in session ${sessionId}`);
            }
        } catch (e) {
            console.error('[SessionsGateway] Failed to start recording', e);
        }
    }

    @SubscribeMessage('stop_recording')
    async handleStopRecording(
        @MessageBody() data: { sessionId: string },
        @ConnectedSocket() client: Socket,
    ) {
        // Stop billing
        this.stopTracking(client.id);
        console.log(`[SessionsGateway] Stopped recording & billing for client ${client.id}`);
    }
}
