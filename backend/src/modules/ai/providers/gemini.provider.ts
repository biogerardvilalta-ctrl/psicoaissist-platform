import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AiProvider, AiMessage, AiOptions } from '../interfaces/ai-provider.interface';

@Injectable()
export class GeminiProvider implements AiProvider {
    readonly providerName = 'gemini';
    private genAI: GoogleGenerativeAI;
    private readonly logger = new Logger(GeminiProvider.name);

    // Default connection settings
    private defaultModel: string;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            this.logger.warn('GEMINI_API_KEY is not set. Provider will fail on execution.');
        }
        // TRIM to avoid invisible characters causing 403s
        this.genAI = new GoogleGenerativeAI(apiKey ? apiKey.trim() : '');
        this.defaultModel = (this.configService.get('GEMINI_MODEL') || 'gemini-2.0-flash').trim();
    }

    async generateText(prompt: string | string[], options?: AiOptions): Promise<string> {
        try {
            const model = this.getModel(options);
            const input = Array.isArray(prompt) ? prompt : [prompt];

            const result = await model.generateContent(input);
            const response = await result.response;
            return response.text();
        } catch (error) {
            this.logger.error(`Error in generateText (${this.providerName}):`, error);
            throw error;
        }
    }

    async generateJSON<T = any>(prompt: string, options?: AiOptions): Promise<T> {
        try {
            const model = this.getModel({ ...options, jsonMode: true });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Robust JSON extraction (Gemini sometimes wraps in markdown blocks)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("No JSON found in response");
            }

            return JSON.parse(jsonMatch[0]) as T;
        } catch (error) {
            this.logger.error(`Error in generateJSON (${this.providerName}):`, error);
            throw error;
        }
    }

    async chat(history: AiMessage[], newMessage: string, options?: AiOptions): Promise<string> {
        try {
            const model = this.getModel(options);

            // Map generic messages to Gemini format
            const googleHistory = history.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model', // Gemini only supports 'user' and 'model' in history usually
                parts: [{ text: msg.content }]
            }));

            // Handle system prompt if present (Gemini specific: often sent as first user message or via specific API if supported)
            // For now, we assume history[0] might be system/context, handled by the caller or passed as first turn
            // *Gemini 1.5/2.0 supports systemInstruction in model config, but let's stick to standard chat history for now for simplicity or inject it.*

            // If the first message in our generic history is 'system', we should extract it
            let systemInstruction = undefined;
            const validHistory = [];

            for (const msg of history) {
                if (msg.role === 'system') {
                    systemInstruction = msg.content;
                } else {
                    validHistory.push({
                        role: msg.role === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.content }]
                    });
                }
            }

            // If systemInstruction is supported by SDK 
            const chatModel = systemInstruction ?
                this.genAI.getGenerativeModel({
                    model: options?.modelName || this.defaultModel,
                    systemInstruction: systemInstruction
                })
                : model;

            const chat = chatModel.startChat({
                history: validHistory
            });

            const result = await chat.sendMessage(newMessage);
            const response = await result.response;
            return response.text();
        } catch (error) {
            this.logger.error(`Error in chat (${this.providerName}):`, error);
            throw error;
        }
    }

    private getModel(options?: AiOptions): GenerativeModel {
        const modelName = options?.modelName || this.defaultModel;
        const generationConfig: any = {};

        if (options?.temperature !== undefined) {
            generationConfig.temperature = options.temperature;
        }
        if (options?.maxOutputTokens !== undefined) {
            generationConfig.maxOutputTokens = options.maxOutputTokens;
        }
        if (options?.jsonMode) {
            generationConfig.responseMimeType = "application/json";
        }

        return this.genAI.getGenerativeModel({
            model: modelName,
            generationConfig
        });
    }
}
