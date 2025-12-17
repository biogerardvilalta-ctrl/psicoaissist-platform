
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
import { Logger } from '@nestjs/common';

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

    constructor(private readonly aiService: AiService) { }

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
