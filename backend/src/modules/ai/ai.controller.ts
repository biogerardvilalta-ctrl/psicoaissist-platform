import { Controller, Post, Body, Param, UseInterceptors, UploadedFile, UseGuards, Req, Query } from '@nestjs/common';
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
    @UseInterceptors(FileInterceptor('audio'))
    async transcribeAudio(
        @UploadedFile() file: Express.Multer.File,
        @Req() req,
        @Query('isLive') isLive: string, // Add query param
    ) {
        return {
            text: await this.transcriptionService.transcribeAudio(file, req.user.sub, isLive === 'true')
        };
    }

    @Post('help')
    @RequireFeature('advancedAnalytics')
    async askHelp(@Body('question') question: string) {
        return { answer: await this.aiService.askHelp(question) };
    }
}
