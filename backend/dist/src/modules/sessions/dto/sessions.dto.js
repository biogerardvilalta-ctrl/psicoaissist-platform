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
exports.SessionResponseDto = exports.UpdateSessionDto = exports.CreateSessionDto = exports.SessionType = exports.SessionStatus = void 0;
const class_validator_1 = require("class-validator");
var SessionStatus;
(function (SessionStatus) {
    SessionStatus["SCHEDULED"] = "SCHEDULED";
    SessionStatus["IN_PROGRESS"] = "IN_PROGRESS";
    SessionStatus["COMPLETED"] = "COMPLETED";
    SessionStatus["CANCELLED"] = "CANCELLED";
})(SessionStatus || (exports.SessionStatus = SessionStatus = {}));
var SessionType;
(function (SessionType) {
    SessionType["INDIVIDUAL"] = "INDIVIDUAL";
    SessionType["GROUP"] = "GROUP";
    SessionType["COUPLE"] = "COUPLE";
    SessionType["FAMILY"] = "FAMILY";
})(SessionType || (exports.SessionType = SessionType = {}));
class CreateSessionDto {
    constructor() {
        this.sessionType = SessionType.INDIVIDUAL;
    }
}
exports.CreateSessionDto = CreateSessionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "clientId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "endTime", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(SessionType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "sessionType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "notes", void 0);
class UpdateSessionDto {
}
exports.UpdateSessionDto = UpdateSessionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateSessionDto.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateSessionDto.prototype, "endTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SessionStatus),
    __metadata("design:type", String)
], UpdateSessionDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSessionDto.prototype, "notes", void 0);
class SessionResponseDto {
}
exports.SessionResponseDto = SessionResponseDto;
//# sourceMappingURL=sessions.dto.js.map