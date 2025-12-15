"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptionsModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const transcriptions_controller_1 = require("./transcriptions.controller");
const transcriptions_service_1 = require("./transcriptions.service");
let TranscriptionsModule = class TranscriptionsModule {
};
exports.TranscriptionsModule = TranscriptionsModule;
exports.TranscriptionsModule = TranscriptionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.register({
                dest: './uploads',
                limits: {
                    fileSize: 100 * 1024 * 1024,
                },
            }),
        ],
        controllers: [transcriptions_controller_1.TranscriptionsController],
        providers: [transcriptions_service_1.TranscriptionsService],
        exports: [transcriptions_service_1.TranscriptionsService],
    })
], TranscriptionsModule);
//# sourceMappingURL=transcriptions.module.js.map