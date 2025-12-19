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
exports.TranscriptionService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
let TranscriptionService = class TranscriptionService {
    constructor() {
        if (process.env.GEMINI_API_KEY) {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        }
        else {
            console.error("GEMINI_API_KEY is not set");
        }
    }
    async transcribeAudio(file) {
        console.log(`🎤 Processing audio file: ${file.originalname} (${file.size} bytes, mimetype: ${file.mimetype})`);
        if (!this.genAI) {
            console.warn('GEMINI_API_KEY missing, returning mock transcription.');
            return "Error: Clave de API de Gemini no configurada.";
        }
        try {
            const tempFilePath = path.join("/tmp", `audio_${Date.now()}_${file.originalname}`);
            fs.writeFileSync(tempFilePath, file.buffer);
            console.log(`Saved temp file: ${tempFilePath}`);
            const { GoogleAIFileManager } = await Promise.resolve().then(() => require("@google/generative-ai/server"));
            const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
            let mimeType = file.mimetype;
            console.log(`[TranscriptionService] Received file: ${file.originalname}, size: ${file.size}, mime: ${file.mimetype}`);
            if (!mimeType || mimeType === 'application/octet-stream') {
                console.warn(`[TranscriptionService] Invalid/generic mimeType '${mimeType}'. Detecting from extension...`);
                const ext = file.originalname.split('.').pop()?.toLowerCase();
                const mimeMap = {
                    'mp3': 'audio/mp3',
                    'wav': 'audio/wav',
                    'ogg': 'audio/ogg',
                    'm4a': 'audio/mp4',
                    'webm': 'audio/webm',
                    'aac': 'audio/aac',
                    'flac': 'audio/flac'
                };
                mimeType = mimeMap[ext || ''] || 'audio/mp3';
                console.log(`[TranscriptionService] Resolved mimeType to: ${mimeType}`);
            }
            else {
                mimeType = mimeType.split(';')[0];
            }
            const uploadResponse = await fileManager.uploadFile(tempFilePath, {
                mimeType: mimeType,
                displayName: "Session Audio",
            });
            console.log(`Uploaded file: ${uploadResponse.file.name} (${uploadResponse.file.uri})`);
            let fileState = await fileManager.getFile(uploadResponse.file.name);
            console.log(`Initial file state: ${fileState.state}`);
            while (fileState.state === "PROCESSING") {
                console.log(`Waiting for file ${fileState.name} to process...`);
                await new Promise((resolve) => setTimeout(resolve, 1000));
                fileState = await fileManager.getFile(uploadResponse.file.name);
            }
            if (fileState.state === "FAILED") {
                throw new Error("File processing failed by Gemini.");
            }
            console.log(`File processing complete. State: ${fileState.state}`);
            const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent([
                {
                    fileData: {
                        mimeType: uploadResponse.file.mimeType,
                        fileUri: uploadResponse.file.uri
                    }
                },
                { text: "Transcribe el audio verbatim." }
            ]);
            fs.unlinkSync(tempFilePath);
            const response = await result.response;
            const text = response.text();
            console.log('📝 Transcription success, length:', text.length);
            return text;
        }
        catch (error) {
            console.error('Gemini Transcription failed:', error);
            return `Error en la transcripción: ${error.message}`;
        }
    }
};
exports.TranscriptionService = TranscriptionService;
exports.TranscriptionService = TranscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TranscriptionService);
//# sourceMappingURL=transcription.service.js.map