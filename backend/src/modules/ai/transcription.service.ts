import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import { UsageLimitsService } from '../payments/usage-limits.service';

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

    async transcribeAudio(file: Express.Multer.File, userId: string): Promise<string> {
        console.log(`🎤 Processing audio file: ${file.originalname} (${file.size} bytes, mimetype: ${file.mimetype}) for user ${userId}`);

        if (!this.genAI) {
            console.warn('GEMINI_API_KEY missing, returning mock transcription.');
            return "Error: Clave de API de Gemini no configurada.";
        }

        try {
            // Write buffer to temporary file for upload
            const tempFilePath = path.join("/tmp", `audio_${Date.now()}_${file.originalname}`);
            fs.writeFileSync(tempFilePath, file.buffer);
            console.log(`Saved temp file: ${tempFilePath}`);

            // Calculate duration to check limits
            try {
                // Dynamically import music-metadata (ESM)
                const { parseFile } = await import('music-metadata');
                const metadata = await parseFile(tempFilePath);
                const durationSeconds = metadata.format.duration || 0;

                console.log(`Audio duration: ${durationSeconds} seconds`);

                // Check limit (round up to next minute for limit checking safe-guarding)
                const minutes = Math.ceil(durationSeconds / 60);
                await this.usageLimitsService.checkTranscriptionLimit(userId, minutes);

                // Increment usage
                await this.usageLimitsService.incrementTranscriptionUsage(userId, durationSeconds);

            } catch (err) {
                console.error("Error calculating duration or checking limits:", err);
                // If we can't calculate duration (e.g. format issue), we might want to fail or proceed with caution.
                // For now, let's allow it but log error, OR fail. Safety first -> Fail?
                // But for robustness let's Log and Proceed if it's just duration calc error, 
                // UNLESS it's ForbiddenException from checkTranscriptionLimit.
                if (err.status === 403) throw err;
            }

            // Use GoogleAIFileManager to upload
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
                { text: "Transcribe el audio verbatim. FORMATO OBLIGATORIO: Identifica por contexto quién es el profesional y quién es el paciente. Usa las etiquetas 'Psicólogo/a:' y 'Paciente:' (o 'Paciente 1:', 'Paciente 2:' si hay varios). Si no estás seguro, usa 'Hablante 1:'. Separa intervenciones con saltos de línea." }
            ]);

            // Clean up temp file
            fs.unlinkSync(tempFilePath);

            // Delete file from Gemini (optional, good practice)
            // await fileManager.deleteFile(uploadResponse.file.name); 

            const response = await result.response;
            const text = response.text();

            console.log('📝 Transcription success, length:', text.length);
            return text;

        } catch (error) {
            console.error('Gemini Transcription failed:', error);
            return `Error en la transcripción: ${(error as any).message}`;
        }
    }
}
