import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AiProvider, AiMessage, AiOptions } from '../interfaces/ai-provider.interface';

@Injectable()
export class GeminiProvider implements AiProvider {
    readonly providerName = 'gemini';
    private readonly logger = new Logger(GeminiProvider.name);
    private apiKey: string;
    private defaultModel: string;
    private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            this.logger.warn('GEMINI_API_KEY is not set. Provider will fail on execution.');
        }
        // TRIM to avoid invisible characters
        this.apiKey = apiKey ? apiKey.trim() : '';
        this.defaultModel = (this.configService.get('GEMINI_MODEL') || 'gemini-2.0-flash').trim();
    }

    async generateText(prompt: string | string[], options?: AiOptions): Promise<string> {
        const model = options?.modelName || this.defaultModel;

        try {
            const endpoint = `${this.baseUrl}/${model}:generateContent`;

            const contents = Array.isArray(prompt)
                ? [{ role: 'user', parts: [{ text: prompt.join('\n') }] }]
                : [{ role: 'user', parts: [{ text: prompt }] }];

            this.logger.log(`Calling Gemini (Raw Fetch): ${endpoint}`);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey
                },
                body: JSON.stringify({
                    contents: contents,
                    generationConfig: {
                        temperature: options?.temperature ?? 0.7,
                        maxOutputTokens: options?.maxOutputTokens ?? 1000,
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Gemini API Error: ${response.status} ${response.statusText} - ${errorText}`);
                throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                return data.candidates[0].content.parts.map((p: any) => p.text).join('');
            } else {
                this.logger.warn('Empty response candidates from Gemini');
                return '';
            }

        } catch (error) {
            this.logger.error('Error in generateText (fetch):', error);
            throw error;
        }
    }

    async generateJSON<T = any>(prompt: string, options?: AiOptions): Promise<T> {
        // Implementation for JSON not strictly required for the simulator demo but good for completeness if used elsewhere
        // Re-using generateText logic with JSON MIME type if needed, but for now throwing not implemented or simple wrapper
        // The simulator mainly uses chat() and generateText()
        const text = await this.generateText(prompt, { ...options, jsonMode: true });
        try {
            // Robust JSON extraction (Gemini sometimes wraps in markdown blocks)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("No JSON found in response");
            }
            return JSON.parse(jsonMatch[0]) as T;
        } catch (e) {
            throw new Error(`Failed to parse JSON from Gemini response: ${e.message}`);
        }
    }

    async chat(history: AiMessage[], newMessage: string, options?: AiOptions): Promise<string> {
        const model = options?.modelName || this.defaultModel;

        try {
            const endpoint = `${this.baseUrl}/${model}:generateContent`;

            // Transform history to Gemini format (user/model roles)
            // System prompt (if any) should be handled. Quick hack: Prepend to first user message if needed, 
            // or use systemInstruction if using beta API features. Sticking to simple history mapping.

            const contents = [];
            let systemInstruction: string | undefined;

            for (const msg of history) {
                if (msg.role === 'system') {
                    systemInstruction = msg.content;
                } else {
                    contents.push({
                        role: msg.role === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.content }]
                    });
                }
            }

            // Append new message
            contents.push({
                role: 'user',
                parts: [{ text: newMessage }]
            });

            const body: any = {
                contents: contents,
                generationConfig: {
                    temperature: options?.temperature ?? 0.7,
                    maxOutputTokens: options?.maxOutputTokens ?? 1000,
                }
            };

            // Inject system instruction if present (supported in v1beta)
            if (systemInstruction) {
                body.systemInstruction = {
                    parts: [{ text: systemInstruction }]
                };
            }

            this.logger.log(`Calling Gemini Chat (Raw Fetch): ${endpoint}`);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Gemini Chat API Error: ${response.status} ${response.statusText} - ${errorText}`);
                throw new Error(`Gemini Chat API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                return data.candidates[0].content.parts.map((p: any) => p.text).join('');
            } else {
                this.logger.warn('Empty response candidates from Gemini Chat');
                return '';
            }

        } catch (error) {
            this.logger.error('Error in chat (fetch):', error);
            throw error;
        }
    }

    // Helper unused in fetch implementation but kept for interface/structure if needed
    private getModel(options?: AiOptions): any {
        return null;
    }
}
