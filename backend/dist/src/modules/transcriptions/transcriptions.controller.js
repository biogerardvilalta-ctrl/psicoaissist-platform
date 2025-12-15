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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const transcriptions_service_1 = require("./transcriptions.service");
const dto_1 = require("./dto");
let TranscriptionsController = class TranscriptionsController {
    constructor(transcriptionsService) {
        this.transcriptionsService = transcriptionsService;
    }
    async uploadAudio(file, uploadDto, req) {
        return this.transcriptionsService.uploadAudioFile(req.user.sub, file, uploadDto);
    }
    async createTranscription(createDto, req) {
        return this.transcriptionsService.createTranscription(req.user.sub, createDto);
    }
    async getTranscriptions(query, req) {
        return this.transcriptionsService.getTranscriptions(req.user.sub, query);
    }
    async getTranscription(id, req) {
        return this.transcriptionsService.getTranscriptionById(req.user.sub, id);
    }
    async updateTranscription(id, updateDto, req) {
        return this.transcriptionsService.updateTranscription(req.user.sub, id, updateDto);
    }
    async createAnalysis(transcriptionId, createDto, req) {
        return this.transcriptionsService.createAnalysis(req.user.sub, {
            ...createDto,
            transcriptionId,
        });
    }
    async deleteTranscription(id, req) {
        return this.transcriptionsService.deleteTranscription(req.user.sub, id);
    }
};
exports.TranscriptionsController = TranscriptionsController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('audio')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.UploadAudioDto, Object]),
    __metadata("design:returntype", Promise)
], TranscriptionsController.prototype, "uploadAudio", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateTranscriptionDto, Object]),
    __metadata("design:returntype", Promise)
], TranscriptionsController.prototype, "createTranscription", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TranscriptionQueryDto, Object]),
    __metadata("design:returntype", Promise)
], TranscriptionsController.prototype, "getTranscriptions", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TranscriptionsController.prototype, "getTranscription", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateTranscriptionDto, Object]),
    __metadata("design:returntype", Promise)
], TranscriptionsController.prototype, "updateTranscription", null);
__decorate([
    (0, common_1.Post)(':id/analyze'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TranscriptionsController.prototype, "createAnalysis", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TranscriptionsController.prototype, "deleteTranscription", null);
exports.TranscriptionsController = TranscriptionsController = __decorate([
    (0, common_1.Controller)('transcriptions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [transcriptions_service_1.TranscriptionsService])
], TranscriptionsController);
//# sourceMappingURL=transcriptions.controller.js.map