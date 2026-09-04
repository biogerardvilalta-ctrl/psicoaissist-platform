import { Controller, Post, Body, Param, UseInterceptors, UploadedFile, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { TranscriptionService } from './transcription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeatureGuard, RequireFeature } from '../auth/guards/feature.guard';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard, FeatureGuard)
export class AiController {
    constructor(
        private readonly aiService: AiService,
        private readonly transcriptionService: TranscriptionService
    ) { }

    @ApiOperation({ summary: 'Generar análisis de sesión con IA' })
    @ApiResponse({ status: 200, description: 'Análisis generado' })
    @Post('session/:id/analyze')
    @RequireFeature('advancedAnalytics')
    async analyzeSession(@Param('id') sessionId: string, @Body('notes') notes: string) {
        // Controller dummy call - passing notes as blank string for transcription if checking manually
        return this.aiService.generateSessionAnalysis(sessionId, notes, "");
    }

    @ApiOperation({ summary: 'Obtener sugerencias en tiempo real de la IA' })
    @ApiResponse({ status: 200, description: 'Sugerencias obtenidas' })
    @Post('suggestions')
    @RequireFeature('advancedAnalytics')
    async getSuggestions(@Body('context') context: string) {
        return this.aiService.getLiveSuggestions(context);
    }

    @ApiOperation({ summary: 'Transcribir audio con Whisper AI' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                audio: { type: 'string', format: 'binary' },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Texto transcrito' })
    @Post('transcribe')
    @UseInterceptors(FileInterceptor('audio', {
        fileFilter: (req, file, cb) => {
            // Only allow audio file types
            const allowedMimes = [
                'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave',
                'audio/ogg', 'audio/webm', 'audio/x-m4a', 'audio/mp4',
                'audio/flac', 'audio/x-wav', 'video/webm', // browsers sometimes send audio as video/webm
            ];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new BadRequestException(`Invalid audio format: ${file.mimetype}. Allowed: mp3, wav, ogg, webm, m4a, flac`), false);
            }
        },
        limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
    }))
    async transcribeAudio(
        @UploadedFile() file: Express.Multer.File,
        @Req() req,
        @Query('isLive') isLive: string, // Add query param
    ) {
        return {
            text: await this.transcriptionService.transcribeAudio(file, req.user.id, isLive === 'true')
        };
    }

    @ApiOperation({ summary: 'Consultar asistente IA (Ayuda general)' })
    @ApiResponse({ status: 200, description: 'Respuesta generada' })
    @Post('help')
    @RequireFeature('advancedAnalytics')
    async askHelp(@Body('question') question: string, @Body('locale') locale: string) {
        return { answer: await this.aiService.askHelp(question, locale) };
    }
}
