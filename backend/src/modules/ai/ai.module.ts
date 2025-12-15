
import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { TranscriptionService } from './transcription.service';

@Module({
    controllers: [AiController],
    providers: [AiService, TranscriptionService],
    exports: [AiService, TranscriptionService],
})
export class AiModule { }
