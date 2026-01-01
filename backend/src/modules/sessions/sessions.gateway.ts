
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
    // Track active sessions: socketId -> { sessionId, userId, startTime, lastDeductionTime, isLimitReached }
    private activeSessions = new Map<string, {
        sessionId: string;
        userId: string;
        interval: NodeJS.Timeout;
        limitReached: boolean;
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
                    console.log(`[SessionsGateway] User ${userId} joined session ${sessionId}. Waiting for recording to start tracking.`);
                }
            }
        } catch (e) {
            console.error('[SessionsGateway] Failed to start tracking', e);
        }

        return { event: 'joined', sessionId };
    }

    private async processMinuteDeduction(client: Socket, userId: string) {
        const sessionData = this.activeSessions.get(client.id);
        if (!sessionData) return;

        try {
            // Deduct 1 minute (60 seconds)
            const result = await this.usageLimitsService.incrementTranscriptionUsage(userId, 60);

            if (result.limitExceeded) {
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

        // 2. Authentication & Feature Check logic (re-using existing simplified check)
        // ... (rest of the method logic) ...
        try {
            // Extract token from handshake auth or headers
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');

            if (!token) return;

            const payload = this.jwtService.decode(token) as any;
            if (!payload || !payload.sub) return;

            const userId = payload.sub;

            // Check Plan Features
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { subscription: true }
            });

            const planFeatures = user?.subscription ? PLAN_FEATURES[user.subscription.planType] : null;

            if (!planFeatures?.advancedAnalytics) {
                return;
            }

            // Double check if limit reached in DB? 
            // Might be heavy to do on every keystroke/update. 
            // We rely on the interval flag 'limitReached' which is updated every minute.

        } catch (e) {
            console.error(`[SessionsGateway] Auth check failed: ${e.message}`);
            return;
        }

        // 3. Process AI Suggestions
        try {
            const suggestions = await this.aiService.getLiveSuggestions(notes);
            client.emit('aiSuggestions', suggestions);
        } catch (error) {
            this.logger.error(`Error processing AI suggestions: ${error.message}`);
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
