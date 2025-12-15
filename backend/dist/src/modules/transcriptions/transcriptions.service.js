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
exports.TranscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
const fs = require("fs/promises");
const path = require("path");
let TranscriptionsService = class TranscriptionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async uploadAudioFile(userId, file, uploadDto) {
        try {
            const allowedTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm'];
            if (!allowedTypes.includes(file.mimetype)) {
                throw new common_1.BadRequestException('Tipo de archivo no soportado. Use MP3, MP4, WAV o WebM.');
            }
            const maxSize = 100 * 1024 * 1024;
            if (file.size > maxSize) {
                throw new common_1.BadRequestException('El archivo es demasiado grande. Máximo 100MB.');
            }
            const uploadDir = path.join(process.cwd(), 'uploads', 'audio', userId);
            await fs.mkdir(uploadDir, { recursive: true });
            const fileExtension = path.extname(file.originalname);
            const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${fileExtension}`;
            const filePath = path.join(uploadDir, filename);
            await fs.writeFile(filePath, file.buffer);
            const audioFile = await this.prisma.audioFile.create({
                data: {
                    userId,
                    sessionId: uploadDto.sessionId,
                    filename,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    fileSize: BigInt(file.size),
                    filePath,
                    status: client_1.ProcessingStatus.UPLOADED,
                    transcriptionStatus: client_1.TranscriptionStatus.PENDING,
                },
            });
            return audioFile;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error al subir archivo: ${error.message}`);
        }
    }
    async createTranscription(userId, createDto) {
        const audioFile = await this.prisma.audioFile.findFirst({
            where: {
                id: createDto.audioFileId,
                userId,
            },
        });
        if (!audioFile) {
            throw new common_1.NotFoundException('Archivo de audio no encontrado');
        }
        await this.prisma.audioFile.update({
            where: { id: audioFile.id },
            data: { transcriptionStatus: client_1.TranscriptionStatus.PROCESSING },
        });
        const transcription = await this.prisma.transcription.create({
            data: {
                audioFile: {
                    connect: { id: createDto.audioFileId }
                },
                user: {
                    connect: { id: userId }
                },
                ...(createDto.sessionId && {
                    session: {
                        connect: { id: createDto.sessionId }
                    }
                }),
                content: '',
                service: createDto.service,
                language: createDto.language,
                status: client_1.TranscriptionStatus.PROCESSING,
            },
        });
        this.processTranscription(transcription.id);
        return transcription;
    }
    async getTranscriptions(userId, query) {
        const where = { userId };
        if (query.sessionId) {
            where.sessionId = query.sessionId;
        }
        if (query.status) {
            where.status = query.status;
        }
        const transcriptions = await this.prisma.transcription.findMany({
            where,
            include: {
                audioFile: true,
                session: {
                    select: {
                        id: true,
                        startTime: true,
                        sessionType: true,
                    },
                },
                analyses: {
                    select: {
                        id: true,
                        analysisType: true,
                        status: true,
                        confidence: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: query.limit,
            skip: query.offset,
        });
        return transcriptions;
    }
    async getTranscriptionById(userId, id) {
        const transcription = await this.prisma.transcription.findFirst({
            where: { id, userId },
            include: {
                audioFile: true,
                session: true,
                analyses: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!transcription) {
            throw new common_1.NotFoundException('Transcripción no encontrada');
        }
        return transcription;
    }
    async updateTranscription(userId, id, updateDto) {
        const transcription = await this.prisma.transcription.findFirst({
            where: { id, userId },
        });
        if (!transcription) {
            throw new common_1.NotFoundException('Transcripción no encontrada');
        }
        const updated = await this.prisma.transcription.update({
            where: { id },
            data: {
                ...updateDto,
                editedBy: updateDto.isEdited ? userId : undefined,
                editedAt: updateDto.isEdited ? new Date() : undefined,
            },
        });
        return updated;
    }
    async createAnalysis(userId, createDto) {
        const transcription = await this.prisma.transcription.findFirst({
            where: { id: createDto.transcriptionId, userId },
        });
        if (!transcription) {
            throw new common_1.NotFoundException('Transcripción no encontrada');
        }
        const analysis = await this.prisma.transcriptionAnalysis.create({
            data: {
                transcription: {
                    connect: { id: createDto.transcriptionId }
                },
                user: {
                    connect: { id: userId }
                },
                analysisType: createDto.analysisType,
                aiService: createDto.aiService || 'openai',
                model: createDto.model || 'gpt-4',
                status: client_1.AnalysisStatus.PROCESSING,
                results: {},
            },
        });
        this.processAnalysis(analysis.id);
        return analysis;
    }
    async deleteTranscription(userId, id) {
        const transcription = await this.prisma.transcription.findFirst({
            where: { id, userId },
            include: { audioFile: true },
        });
        if (!transcription) {
            throw new common_1.NotFoundException('Transcripción no encontrada');
        }
        try {
            await fs.unlink(transcription.audioFile.filePath);
        }
        catch (error) {
            console.error('Error deleting audio file:', error);
        }
        await this.prisma.audioFile.delete({
            where: { id: transcription.audioFileId },
        });
        return { message: 'Transcripción eliminada exitosamente' };
    }
    async processTranscription(transcriptionId) {
        setTimeout(async () => {
            try {
                const mockContent = `Esta es una transcripción de ejemplo generada automáticamente. 
        En una implementación real, aquí estaría el contenido transcrito del audio usando servicios como OpenAI Whisper.
        
        La transcripción incluiría el diálogo completo de la sesión, con timestamps y identificación de hablantes cuando sea posible.`;
                const mockSpeakers = {
                    speakers: [
                        { id: 'speaker_1', name: 'Psicólogo', segments: [] },
                        { id: 'speaker_2', name: 'Paciente', segments: [] }
                    ]
                };
                const mockTimestamps = {
                    words: [
                        { word: 'Esta', start: 0.5, end: 0.8 },
                        { word: 'es', start: 0.9, end: 1.1 },
                        { word: 'una', start: 1.2, end: 1.4 }
                    ]
                };
                await this.prisma.transcription.update({
                    where: { id: transcriptionId },
                    data: {
                        content: mockContent,
                        speakers: mockSpeakers,
                        timestamps: mockTimestamps,
                        status: client_1.TranscriptionStatus.COMPLETED,
                        confidence: 0.92,
                        wordCount: mockContent.split(' ').length,
                        processingTime: 45,
                        completedAt: new Date(),
                    },
                });
                const transcription = await this.prisma.transcription.findUnique({
                    where: { id: transcriptionId },
                    select: { audioFileId: true }
                });
                if (transcription) {
                    await this.prisma.audioFile.update({
                        where: { id: transcription.audioFileId },
                        data: {
                            transcriptionStatus: client_1.TranscriptionStatus.COMPLETED,
                            processedAt: new Date(),
                        },
                    });
                }
            }
            catch (error) {
                console.error('Error processing transcription:', error);
                await this.prisma.transcription.update({
                    where: { id: transcriptionId },
                    data: { status: client_1.TranscriptionStatus.FAILED },
                });
            }
        }, 5000);
    }
    async processAnalysis(analysisId) {
        setTimeout(async () => {
            try {
                const analysis = await this.prisma.transcriptionAnalysis.findUnique({
                    where: { id: analysisId }
                });
                if (!analysis)
                    return;
                let mockResults = {};
                switch (analysis.analysisType) {
                    case 'SENTIMENT_ANALYSIS':
                        mockResults = {
                            overall_sentiment: 'neutral',
                            confidence: 0.78,
                            sentiments: [
                                { text: 'Inicio de sesión', sentiment: 'positive', score: 0.6 },
                                { text: 'Discusión de problemas', sentiment: 'negative', score: -0.4 },
                                { text: 'Resolución', sentiment: 'positive', score: 0.8 }
                            ]
                        };
                        break;
                    case 'EMOTION_DETECTION':
                        mockResults = {
                            primary_emotions: ['calm', 'concerned', 'hopeful'],
                            emotion_timeline: [
                                { timestamp: 0, emotions: { calm: 0.8, neutral: 0.2 } },
                                { timestamp: 300, emotions: { concerned: 0.7, anxious: 0.3 } },
                                { timestamp: 600, emotions: { hopeful: 0.9, calm: 0.1 } }
                            ]
                        };
                        break;
                    case 'KEY_THEMES':
                        mockResults = {
                            themes: [
                                { theme: 'Ansiedad laboral', confidence: 0.85, mentions: 5 },
                                { theme: 'Relaciones familiares', confidence: 0.72, mentions: 3 },
                                { theme: 'Estrategias de afrontamiento', confidence: 0.68, mentions: 4 }
                            ]
                        };
                        break;
                    case 'SUMMARY':
                        mockResults = {
                            summary: 'Sesión enfocada en estrategias de manejo de ansiedad laboral. El paciente mostró avances en técnicas de relajación.',
                            key_points: [
                                'Implementación de técnicas de respiración',
                                'Identificación de disparadores de ansiedad',
                                'Planificación de ejercicios para la próxima semana'
                            ],
                            recommendations: [
                                'Continuar con ejercicios de mindfulness',
                                'Llevar diario de emociones'
                            ]
                        };
                        break;
                }
                await this.prisma.transcriptionAnalysis.update({
                    where: { id: analysisId },
                    data: {
                        results: mockResults,
                        confidence: mockResults.confidence || 0.75,
                        status: client_1.AnalysisStatus.COMPLETED,
                        processingTime: 30,
                        completedAt: new Date(),
                    },
                });
            }
            catch (error) {
                console.error('Error processing analysis:', error);
                await this.prisma.transcriptionAnalysis.update({
                    where: { id: analysisId },
                    data: { status: client_1.AnalysisStatus.FAILED },
                });
            }
        }, 3000);
    }
};
exports.TranscriptionsService = TranscriptionsService;
exports.TranscriptionsService = TranscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TranscriptionsService);
//# sourceMappingURL=transcriptions.service.js.map