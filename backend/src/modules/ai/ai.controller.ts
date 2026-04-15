import { Controller, Post, Body, Param, UseInterceptors, UploadedFile, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { TranscriptionService } from './transcription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeatureGuard, RequireFeature } from '../auth/guards/feature.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard, FeatureGuard)
export class AiController {
    constructor(
        private readonly aiService: AiService,
        private readonly transcriptionService: TranscriptionService
    ) { }

    @Post('session/:id/analyze')
    @RequireFeature('advancedAnalytics')
    async analyzeSession(@Param('id') sessionId: string, @Body('notes') notes: string) {
        // Controller dummy call - passing notes as blank string for transcription if checking manually
        return this.aiService.generateSessionAnalysis(sessionId, notes, "");
    }

    @Post('suggestions')
    @RequireFeature('advancedAnalytics')
    async getSuggestions(@Body('context') context: string) {
        return this.aiService.getLiveSuggestions(context);
    }

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

    @Post('help')
    @RequireFeature('advancedAnalytics')
    async askHelp(@Body('question') question: string, @Body('locale') locale: string) {
        return { answer: await this.aiService.askHelp(question, locale) };
    }
}
