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
        console.log(`🎤 Processing audio file: ${file.originalname} (${file.size} bytes, mimetype: ${file.mimetype}) for user ${userId}. SkipUsage: ${skipUsageTracking}`);

        if (!this.genAI) {
            console.warn('GEMINI_API_KEY missing, returning mock transcription.');
            return "Error: Clave de API de Gemini no configurada.";
        }

        const tempFilePath = path.join("/tmp", `audio_${Date.now()}_${file.originalname}`);

        try {
            // Write buffer to temporary file for upload
            fs.writeFileSync(tempFilePath, file.buffer);
            console.log(`Saved temp file: ${tempFilePath}`);

            // Calculate duration to check limits
            try {
                // Use get-audio-duration for better CJS/ESM compatibility
                const durationSeconds = await getAudioDurationInSeconds(tempFilePath);

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

            } catch (err) {
                console.error("Error calculating duration or checking limits:", err);
                if (err.status === 403) throw err;
                // Continue if just duration error, but log it
            }

            // Use GoogleAIFileManager to upload
            // Dynamic import for ESM module
            const { GoogleAIFileManager } = await import("@google/generative-ai/server");
            const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

            // Determine correct MIME type
            let mimeType = file.mimetype;
            console.log(`[TranscriptionService] Received file: ${file.originalname}, size: ${file.size}, mime: ${file.mimetype}`);

            // Fallback for generic or missing mimetype
            if (!mimeType || mimeType === 'application/octet-stream') {
                console.warn(`[TranscriptionService] Invalid/generic mimeType '${mimeType}'. Detecting from extension...`);
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
                mimeType = mimeMap[ext || ''] || 'audio/mp3'; // Default to mp3 if unknown
                console.log(`[TranscriptionService] Resolved mimeType to: ${mimeType}`);
            } else {
                // Strip parameters (e.g. ";codecs=opus")
                mimeType = mimeType.split(';')[0];
            }

            const uploadResponse = await fileManager.uploadFile(tempFilePath, {
                mimeType: mimeType,
                displayName: "Session Audio",
            });

            console.log(`Uploaded file: ${uploadResponse.file.name} (${uploadResponse.file.uri})`);

            // Wait for file to check state
            let fileState = await fileManager.getFile(uploadResponse.file.name);
            console.log(`Initial file state: ${fileState.state}`);

            // Wait while processing
            while (fileState.state === "PROCESSING") {
                console.log(`Waiting for file ${fileState.name} to process...`);
                await new Promise((resolve) => setTimeout(resolve, 1000));
                fileState = await fileManager.getFile(uploadResponse.file.name);
            }

            if (fileState.state === "FAILED") {
                throw new Error("File processing failed by Gemini.");
            }

            console.log(`File processing complete. State: ${fileState.state}`);

            // Using gemini-2.0-flash
            const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const result = await model.generateContent([
                {
                    fileData: {
                        mimeType: uploadResponse.file.mimeType,
                        fileUri: uploadResponse.file.uri
                    }
                },
                { text: "Eres un transcriptor experto multilingüe. Tu tarea es transcribir el audio literalmente (verbatim) en el idioma EXACTO en que se habla.\n\nREGLAS CRÍTICAS DE IDIOMA:\n1. DETECCIÓN AUTOMÁTICA: Si el audio es Catalán, transcribe en Catalán. Si es Español, en Español. Si es Inglés, en Inglés.\n2. PROHIBIDO TRADUCIR: Bajo ninguna circunstancia traduzcas lo que se dice. Debes ser un espejo fiel del audio.\n3. Si hay mezcla de idiomas, transcribe cada frase en su idioma original.\n\nOtras reglas:\n- Si no hay voz clara, devuelve cadena vacía.\n- Identifica hablantes si es posible ('Psicólogo/a:', 'Paciente:').\n- Separa intervenciones." }
            ]);

            const response = await result.response;
            const text = response.text();

            console.log('📝 Transcription success, length:', text.length);
            return text;

        } catch (error) {
            console.error('Gemini Transcription failed:', error);
            // Return error message to client cleanly
            throw new Error(`Error en la transcripción: ${(error as any).message}`);
        } finally {
            // Clean up temp file
            if (fs.existsSync(tempFilePath)) {
                try {
                    fs.unlinkSync(tempFilePath);
                    console.log(`Deleted temp file: ${tempFilePath}`);
                } catch (e) {
                    console.error("Error deleting temp file:", e);
                }
            }
        }
    }
}
