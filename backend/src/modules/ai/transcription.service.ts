import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TranscriptionService {
    private genAI: GoogleGenerativeAI;

    constructor() {
        if (process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        } else {
            console.error("GEMINI_API_KEY is not set");
        }
    }

    async transcribeAudio(file: Express.Multer.File): Promise<string> {
        console.log(`🎤 Processing audio file: ${file.originalname} (${file.size} bytes, mimetype: ${file.mimetype})`);

        if (!this.genAI) {
            console.warn('GEMINI_API_KEY missing, returning mock transcription.');
            return "Error: Clave de API de Gemini no configurada.";
        }

        try {
            // Write buffer to temporary file for upload
            const tempFilePath = path.join("/tmp", `audio_${Date.now()}_${file.originalname}`);
            fs.writeFileSync(tempFilePath, file.buffer);
            console.log(`Saved temp file: ${tempFilePath}`);

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
                { text: "Transcribe el audio verbatim." }
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
