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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptionQueryDto = exports.CreateAnalysisDto = exports.UpdateTranscriptionDto = exports.CreateTranscriptionDto = exports.UploadAudioDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class UploadAudioDto {
}
exports.UploadAudioDto = UploadAudioDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UploadAudioDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadAudioDto.prototype, "title", void 0);
class CreateTranscriptionDto {
    constructor() {
        this.service = client_1.TranscriptionService.OPENAI_WHISPER;
        this.language = 'es';
    }
}
exports.CreateTranscriptionDto = CreateTranscriptionDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTranscriptionDto.prototype, "audioFileId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TranscriptionService),
    __metadata("design:type", String)
], CreateTranscriptionDto.prototype, "service", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTranscriptionDto.prototype, "language", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTranscriptionDto.prototype, "sessionId", void 0);
class UpdateTranscriptionDto {
}
exports.UpdateTranscriptionDto = UpdateTranscriptionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTranscriptionDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTranscriptionDto.prototype, "isEdited", void 0);
class CreateAnalysisDto {
}
exports.CreateAnalysisDto = CreateAnalysisDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAnalysisDto.prototype, "transcriptionId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.AnalysisType),
    __metadata("design:type", String)
], CreateAnalysisDto.prototype, "analysisType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAnalysisDto.prototype, "aiService", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAnalysisDto.prototype, "model", void 0);
class TranscriptionQueryDto {
    constructor() {
        this.limit = 20;
        this.offset = 0;
    }
}
exports.TranscriptionQueryDto = TranscriptionQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TranscriptionQueryDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TranscriptionQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TranscriptionQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TranscriptionQueryDto.prototype, "offset", void 0);
//# sourceMappingURL=index.js.map