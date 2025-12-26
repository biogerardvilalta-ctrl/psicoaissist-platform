import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { TranscriptionService } from './transcription.service';
import { GeminiProvider } from './providers/gemini.provider';

@Module({
    imports: [ConfigModule],
    controllers: [AiController],
    providers: [
        AiService,
        TranscriptionService,
        {
            provide: 'AI_PROVIDER',
            useClass: GeminiProvider // Default provider
        }
    ],
    exports: [AiService, TranscriptionService, 'AI_PROVIDER'],
})
export class AiModule { }
