import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TranscriptionService {
    private openai: OpenAI;

    constructor() {
        // Initialize OpenAI if key is available
        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
        }
    }

    async transcribeAudio(file: Express.Multer.File): Promise<string> {
        console.log(`🎤 Processing audio file: ${file.originalname} (${file.size} bytes)`);

        // If we have a real key, try to use it (optional for MVP if user provided it)
        if (this.openai && process.env.ENABLE_REAL_AI === 'true') {
            try {
                // OpenAI requires a file object or stream. 
                // Since we have the buffer, we might need to write to tmp or use a stream.
                // For this MVP, let's stick to the mock for reliability unless explicitly requested.
            } catch (error) {
                console.error('OpenAI Transcription failed', error);
            }
        }

        // --- MOCK IMPLEMENTATION ---
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Return simulated text based on some randomness or heuristics (not possible with just audio blob)
        // We act as if the user is talking about their feelings.
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
}
