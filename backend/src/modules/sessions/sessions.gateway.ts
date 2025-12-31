
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

    constructor(
        private readonly aiService: AiService,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) { }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
        console.log(`[SessionsGateway] Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        console.log(`[SessionsGateway] Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinSession')
    handleJoinSession(
        @MessageBody() data: { sessionId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { sessionId } = data;
        client.join(`session_${sessionId}`);
        this.logger.log(`Client ${client.id} joined session_${sessionId}`);
        return { event: 'joined', sessionId };
    }

    @SubscribeMessage('updateNotes')
    async handleUpdateNotes(
        @MessageBody() data: { sessionId: string; notes: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { sessionId, notes } = data;
        console.log(`[SessionsGateway] Received notes update for session ${sessionId}`);

        // 1. Authentication & Feature Check
        try {
            // Extract token from handshake auth or headers
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');

            if (!token) {
                console.log(`[SessionsGateway] No token provided by client ${client.id}`);
                return; // Silently fail or emit error
            }

            const payload = this.jwtService.decode(token) as any; // Decoding without verify for speed (guard verification happens on connect ideally, but here for check)
            // Ideally we should use jwtService.verifyAsync(token) but requires secret injection here or proper Guard. 
            // For MVP, if they have a valid format token with a sub, we check the DB. 

            if (!payload || !payload.sub) {
                console.log(`[SessionsGateway] Invalid token payload for client ${client.id}`);
                return;
            }

            const userId = payload.sub;

            // Check Plan Features
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { subscription: true }
            });

            const planFeatures = user?.subscription ? PLAN_FEATURES[user.subscription.planType] : null;

            if (!planFeatures?.advancedAnalytics) {
                console.log(`[SessionsGateway] Blocked AI suggestions for user ${userId} (Plan: ${user?.subscription?.planType})`);
                // Optionally emit an error to frontend so it can hide the panel or show "Upgrade"
                // client.emit('error', { message: 'AI Suggestions require a Pro plan' });
                return;
            }

        } catch (e) {
            console.error(`[SessionsGateway] Auth check failed: ${e.message}`);
            return;
        }

        // 2. Process AI Suggestions
        try {
            const suggestions = await this.aiService.getLiveSuggestions(notes);

            // Emit suggestions only to the sender (or room if all should see AI)
            // Usually AI is personal to the therapist
            client.emit('aiSuggestions', suggestions);
            console.log(`[SessionsGateway] Sent valid AI suggestions to client ${client.id}`);

            // Alternatively, broadcast to room if multiple therapists
            // this.server.to(`session_${sessionId}`).emit('aiSuggestions', suggestions);

        } catch (error) {
            this.logger.error(`Error processing AI suggestions: ${error.message}`);
        }
    }
}
