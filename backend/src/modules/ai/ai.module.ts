import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { TranscriptionService } from './transcription.service';
import { GeminiProvider } from './providers/gemini.provider';
import { PaymentsModule } from '../payments/payments.module';

@Module({
    imports: [ConfigModule, PaymentsModule],
    controllers: [AiController],
    providers: [
        AiService,
        TranscriptionService,
        GeminiProvider,
        {
            provide: 'AI_PROVIDER',
            useExisting: GeminiProvider // Alias to the concrete class
        }
    ],
    exports: [AiService, TranscriptionService, 'AI_PROVIDER', GeminiProvider],
})
export class AiModule { }
