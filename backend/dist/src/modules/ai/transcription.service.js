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
const openai_1 = require("openai");
let TranscriptionService = class TranscriptionService {
    constructor() {
        if (process.env.OPENAI_API_KEY) {
            this.openai = new openai_1.default({
                apiKey: process.env.OPENAI_API_KEY,
            });
        }
    }
    async transcribeAudio(file) {
        console.log(`🎤 Processing audio file: ${file.originalname} (${file.size} bytes)`);
        if (this.openai && process.env.ENABLE_REAL_AI === 'true') {
            try {
            }
            catch (error) {
                console.error('OpenAI Transcription failed', error);
            }
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockTranscriptions = [
            "Me siento un poco abrumado por el trabajo últimamente. No sé cómo manejar la presión.",
            "He estado durmiendo mal y me siento muy cansado todo el día. Creo que es ansiedad.",
            "Las cosas van mejor con mi pareja, hemos podido hablar tranquilamente.",
            "Tengo miedo de fallar en mis objetivos, siento que no soy suficiente.",
            "Hoy ha sido un buen día, me siento con más energía y optimismo."
        ];
        const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
        console.log('📝 Simulated Transcription:', randomTranscription);
        return randomTranscription;
    }
};
exports.TranscriptionService = TranscriptionService;
exports.TranscriptionService = TranscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TranscriptionService);
//# sourceMappingURL=transcription.service.js.map