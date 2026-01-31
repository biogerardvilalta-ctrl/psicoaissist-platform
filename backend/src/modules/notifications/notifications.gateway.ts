import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
    cors: {
        origin: [
            'https://psicoaissist.com',
            'https://www.psicoaissist.com',
            'http://localhost:3000',
        ],
        credentials: true,
    },
    namespace: 'notifications',
})
export class NotificationsGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // Map to store connected clients: userId -> Set<socketId>
    private connectedClients: Map<string, Set<string>> = new Map();

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = this.extractToken(client);
            if (!token) {
                throw new UnauthorizedException('No token provided');
            }

            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('JWT_SECRET'),
            });

            const userId = payload.sub;
            client.data.userId = userId;

            if (!this.connectedClients.has(userId)) {
                this.connectedClients.set(userId, new Set());
            }
            this.connectedClients.get(userId).add(client.id);

            // Join a room specifically for this user for easy broadcasting
            client.join(`user_${userId}`);

            console.log(`Client connected: ${client.id}, User: ${userId}`);
        } catch (error) {
            console.error(`Connection unauthorized: ${error.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if (userId && this.connectedClients.has(userId)) {
            const userSockets = this.connectedClients.get(userId);
            userSockets.delete(client.id);
            if (userSockets.size === 0) {
                this.connectedClients.delete(userId);
            }
        }
        console.log(`Client disconnected: ${client.id}`);
    }

    // Method to send notification to a specific user
    sendNotificationToUser(userId: string, notification: any) {
        this.server.to(`user_${userId}`).emit('new_notification', notification);
    }

    private extractToken(client: Socket): string | undefined {
        // 1. Handshake auth object
        if (client.handshake.auth?.token) {
            return client.handshake.auth.token;
        }
        // 2. Handshake headers
        const authHeader = client.handshake.headers.authorization;
        if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
            return authHeader.split(' ')[1];
        }
        // 3. Query params (last resort, often used by simple clients)
        if (client.handshake.query?.token) {
            return client.handshake.query.token as string;
        }
        return undefined;
    }
}
