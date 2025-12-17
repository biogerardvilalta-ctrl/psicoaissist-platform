import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AiService } from '../ai/ai.service';
export declare class SessionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly aiService;
    server: Server;
    private readonly logger;
    constructor(aiService: AiService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinSession(data: {
        sessionId: string;
    }, client: Socket): {
        event: string;
        sessionId: string;
    };
    handleUpdateNotes(data: {
        sessionId: string;
        notes: string;
    }, client: Socket): Promise<void>;
}
