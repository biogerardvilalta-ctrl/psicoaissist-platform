export interface AiMessage {
    role: 'user' | 'model' | 'system';
    content: string;
}

export interface AiOptions {
    temperature?: number;
    maxOutputTokens?: number;
    modelName?: string;
    jsonMode?: boolean;
}

export interface AiProvider {
    /**
     * The name of the provider (e.g. 'gemini', 'openai')
     */
    readonly providerName: string;

    /**
     * Generates a text completion for a given prompt (or list of prompt parts).
     */
    generateText(prompt: string | string[], options?: AiOptions): Promise<string>;

    /**
     * Generates a structured JSON object.
     * The provider must ensure the output is valid JSON, parsing it if necessary.
     */
    generateJSON<T = any>(prompt: string, options?: AiOptions): Promise<T>;

    /**
     * Handles a chat interaction.
     */
    chat(history: AiMessage[], newMessage: string, options?: AiOptions): Promise<string>;
}
