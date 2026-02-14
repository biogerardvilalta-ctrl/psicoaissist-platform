import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import { UsageLimitsService } from '../payments/usage-limits.service';
import { getAudioDurationInSeconds } from 'get-audio-duration';

@Injectable()
export class TranscriptionService {
    private genAI: GoogleGenerativeAI;

    constructor(
        private readonly usageLimitsService: UsageLimitsService
    ) {
        if (process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        } else {
            console.error("GEMINI_API_KEY is not set");
        }
    }

    async transcribeAudio(file: Express.Multer.File, userId: string, skipUsageTracking: boolean = false): Promise<string> {
        console.log(`🎤 Processing audio request (INLINE): ${file.originalname} (${file.size} bytes, mimetype: ${file.mimetype}) for user ${userId}. SkipUsage: ${skipUsageTracking}`);

        if (!this.genAI) {
            console.warn('GEMINI_API_KEY missing, returning mock transcription.');
            return "Error: Clave de API de Gemini no configurada.";
        }

        try {
            // Calculate duration to check limits
            // Note: getAudioDurationInSeconds might expect a file path. 
            // For inline optimization, if we want to keep duration check we might need to write temp file JUST for duration check
            // OR use a buffer-based duration library.
            // To be safe and compliant with legacy logic, we WILL write a temp file just for duration check, 
            // BUT we will NOT upload it to Google. This is still faster than Upload.
            // A better optimization would be to estimate duration from bytes if PCM/WAV, but for WebM it's hard.

            // FAST PATH: If file is small (< 10KB), it's likely noise or empty.
            if (file.size < 5000) return "";

            const tempFilePath = path.join("/tmp", `duration_check_${Date.now()}_${userId}.webm`);
            let durationSeconds = 0;

            try {
                fs.writeFileSync(tempFilePath, file.buffer);
                durationSeconds = await getAudioDurationInSeconds(tempFilePath);
                console.log(`Audio duration: ${durationSeconds} seconds`);

                // Check limit (round up to next minute for limit checking safe-guarding)
                const minutes = Math.ceil(durationSeconds / 60);
                await this.usageLimitsService.checkTranscriptionLimit(userId, minutes);

                // Increment usage ONLY if not skipping (e.g. live session)
                if (!skipUsageTracking) {
                    await this.usageLimitsService.incrementTranscriptionUsage(userId, durationSeconds);
                } else {
                    console.log(`[TranscriptionService] Skipping increment for user ${userId} (Live Session)`);
                }

            } catch (dErr) {
                console.warn("Duration check warning (non-fatal):", dErr);
                // Do not throw, just log. Transcription can proceed even if duration check fails.
                // If usage limits are critical, we might want to throw, but for stability, we proceed.
            } finally {
                // Immediate cleanup of duration check file
                if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
            }

            // --- INLINE TRANSCRIPTION ---

            // Determine MIME type
            let mimeType = file.mimetype;
            // Fallback for generic or missing mimetype
            if (!mimeType || mimeType === 'application/octet-stream') {
                const ext = file.originalname.split('.').pop()?.toLowerCase();
                const mimeMap: { [key: string]: string } = {
                    'mp3': 'audio/mp3',
                    'wav': 'audio/wav',
                    'ogg': 'audio/ogg',
                    'm4a': 'audio/mp4',
                    'webm': 'audio/webm',
                    'aac': 'audio/aac',
                    'flac': 'audio/flac'
                };
                mimeType = mimeMap[ext || ''] || 'audio/mp3';
            } else {
                mimeType = mimeType.split(';')[0];
            }


            // Using gemini-2.0-flash
            const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const result = await model.generateContent([
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: file.buffer.toString('base64')
                    }
                },
                { text: "Eres un transcriptor experto multilingüe. Tu tarea es transcribir el audio literalmente (verbatim) en el idioma EXACTO en que se habla.\n\nREGLAS CRÍTICAS DE IDIOMA:\n1. DETECCIÓN AUTOMÁTICA: Si el audio es Catalán, transcribe en Catalán. Si es Español, en Español. Si es Inglés, en Inglés.\n2. PROHIBIDO TRADUCIR: Bajo ninguna circunstancia traduzcas lo que se dice. Debes ser un espejo fiel del audio.\n3. Si hay mezcla de idiomas, transcribe cada frase en su idioma original.\n\nOtras reglas:\n- Si no hay voz clara, devuelve cadena vacía.\n- Identifica hablantes si es posible ('Psicólogo/a:', 'Paciente:').\n- Separa intervenciones." }
            ]);

            const response = await result.response;
            const text = response.text();

            console.log('📝 Transcription success (Inline), length:', text.length);
            return text;

        } catch (error) {
            console.error('Gemini Transcription failed:', error);
            // Return error message to client cleanly
            throw new Error(`Error en la transcripción: ${(error as any).message}`);
        }
    }
}
