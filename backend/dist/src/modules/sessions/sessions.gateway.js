"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SessionsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const ai_service_1 = require("../ai/ai.service");
const common_1 = require("@nestjs/common");
let SessionsGateway = SessionsGateway_1 = class SessionsGateway {
    constructor(aiService) {
        this.aiService = aiService;
        this.logger = new common_1.Logger(SessionsGateway_1.name);
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        console.log(`[SessionsGateway] Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        console.log(`[SessionsGateway] Client disconnected: ${client.id}`);
    }
    handleJoinSession(data, client) {
        const { sessionId } = data;
        client.join(`session_${sessionId}`);
        this.logger.log(`Client ${client.id} joined session_${sessionId}`);
        return { event: 'joined', sessionId };
    }
    async handleUpdateNotes(data, client) {
        const { sessionId, notes } = data;
        console.log(`[SessionsGateway] Received notes update for session ${sessionId}`);
        try {
            const suggestions = await this.aiService.getLiveSuggestions(notes);
            client.emit('aiSuggestions', suggestions);
            console.log(`[SessionsGateway] Sent valid AI suggestions to client ${client.id}`);
        }
        catch (error) {
            this.logger.error(`Error processing AI suggestions: ${error.message}`);
        }
    }
};
exports.SessionsGateway = SessionsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SessionsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinSession'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SessionsGateway.prototype, "handleJoinSession", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('updateNotes'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SessionsGateway.prototype, "handleUpdateNotes", null);
exports.SessionsGateway = SessionsGateway = SessionsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: 'sessions',
    }),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], SessionsGateway);
//# sourceMappingURL=sessions.gateway.js.map