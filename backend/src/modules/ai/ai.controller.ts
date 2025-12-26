
import { Controller, Post, Body, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { TranscriptionService } from './transcription.service';

@Controller('ai')
export class AiController {
    constructor(
        private readonly aiService: AiService,
        private readonly transcriptionService: TranscriptionService
    ) { }

    @Post('session/:id/analyze')
    async analyzeSession(@Param('id') sessionId: string, @Body('notes') notes: string) {
        // Controller dummy call - passing notes as blank string for transcription if checking manually
        return this.aiService.generateSessionAnalysis(sessionId, notes, "");
    }

    @Post('suggestions')
    async getSuggestions(@Body('context') context: string) {
        return this.aiService.getLiveSuggestions(context);
    }

    @Post('transcribe')
    @UseInterceptors(FileInterceptor('audio'))
    async transcribeAudio(@UploadedFile() file: Express.Multer.File) {
        return {
            text: await this.transcriptionService.transcribeAudio(file)
        };
    }

    @Post('help')
    async askHelp(@Body('question') question: string) {
        return { answer: await this.aiService.askHelp(question) };
    }
}
