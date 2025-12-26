import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider, AiMessage } from '../ai/interfaces/ai-provider.interface';

interface SimulationState {
    patientProfile: PatientProfile;
    messages: { role: 'user' | 'model'; parts: string }[];
}

export interface PatientProfile {
    name: string;
    age: number;
    condition: string;
    traits: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    scenario: string;
}

@Injectable()
export class SimulatorService {
    private readonly logger = new Logger(SimulatorService.name);
    private modelName = 'gemini-2.0-flash'; // Default model

    constructor(
        private configService: ConfigService,
        @Inject('AI_PROVIDER') private aiProvider: AiProvider
    ) { }

    /**
     * Generates a random clinical case (Persona).
     */
    async generateCase(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<PatientProfile> {
        const prompt = `
        Genera un perfil d'un "pacient simulat" per a l'entrenament de psicòlegs.
        Dificultat: ${difficulty}.
        
        Retorna EXCLUSIVAMENT un objecte JSON RAW (sense markdown, sense \`\`\`) amb aquest format exacte:
        {
          "name": "Nom fictici",
          "age": 25,
          "condition": "Breu descripció del motiu de consulta",
          "traits": ["Tret 1", "Tret 2"],
          "scenario": "Breu descripció del context."
        }
        `;

        try {
            const data = await this.aiProvider.generateJSON<PatientProfile>(prompt, {
                modelName: this.modelName
            });

            // Validate essential fields exists
            if (!data.name || !data.age) throw new Error("Invalid structure: Missing fields");

            return { ...data, difficulty };
        } catch (error) {
            this.logger.error('Error generating case:', error);
            // Fallback case
            return {
                name: "Àlex",
                age: 30,
                condition: "Estrès laboral i ansietat generalitzada",
                traits: ["Rumiació", "Evitació de conflictes"],
                difficulty,
                scenario: "Treballa en una consultora i sent que no pot més. Té insomni."
            };
        }
    }

    /**
     * Handles the chat interaction with the simulated patient.
     */
    async chat(history: { role: 'user' | 'model'; parts: string }[], newMessage: string, profile: PatientProfile): Promise<string> {
        const systemPrompt = `
        ACTUA COM: ${profile.name}, ${profile.age} anys.
        CONDICIÓ: ${profile.condition}.
        TRETS: ${(profile.traits || []).join(', ')}.
        CONTEXT: ${profile.scenario}.
        
        INSTRUCCIONS D'ACTUACIÓ (MÈTODE STANISLAVSKI):
        1. NO ets una IA assistent. Ets un ésser humà amb problemes.
        2. NO siguis col·laborador si no tens per què. Si tens por o vergonya, sigues evasiu.
        3. Fes servir "filler words" naturals (hmm, eh, bueno...) ocasionalment.
        4. RESPOSTES CURTES. La gent normal no fa discursos; parla en frases de 1-3 línies.
        5. MOSTRA, NO DIGUIS. En lloc de dir "estic trist", digues "no tinc ganes de llevar-me".
        6. Si la dificultat és 'hard', sigues resistent, qüestiona al terapeuta o menteix sobre els teus hàbits.
        
        IDIOMA: ${profile.name.match(/[A-Z][a-z]+/) ? 'Català' : 'Castellà'} (Detecta l'idioma de l'usuari i mantingues la coherència).
        `;

        try {
            // Convert history to Agnostic format
            const validHistory: AiMessage[] = (history || []).map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                content: typeof h.parts === 'string' ? h.parts : (h.parts as any)[0]?.text || ''
            }));

            // Prepend System Prompt
            const fullHistory: AiMessage[] = [
                { role: 'system', content: systemPrompt },
                { role: 'model', content: "Entes. Em posaré en el paper. Començem." }, // Initial acknowledgement to seed the chat
                ...validHistory
            ];

            const responseText = await this.aiProvider.chat(fullHistory, newMessage, {
                modelName: this.modelName
            });
            return responseText;
        } catch (error) {
            this.logger.error('Error in chat:', error);
            // Fallback response explicitly to avoid 500
            return "... (El pacient roman en silenci. Comprova la connexió o API Key)";
        }
    }

    /**
     * Generates a supervisory report after the session with statistics.
     */
    async evaluate(history: { role: 'user' | 'model'; parts: string }[]): Promise<{ feedback: string; metrics: any }> {
        // Format history into a readable transcript
        const transcript = (history || []).map(msg => {
            const speaker = msg.role === 'user' ? 'Psicòleg (Usuari)' : 'Pacient (IA)';
            const text = typeof msg.parts === 'string' ? msg.parts : JSON.stringify(msg.parts);
            return `**${speaker}**: ${text}`;
        }).join('\n\n');

        const prompt = `
        ACTUA COM UN SUPERVISOR CLÍNIC EXPERT (MODEL CBT/Humanista).
        Analitza la següent transcripció d'una sessió simulada.
        
        === TRANSCRIPCIÓ ===
        ${transcript}
        ====================
        
        Analitza la sessió i retorna un objecte JSON amb el següent format EXACTE:
        {
          "metrics": {
            "empathy": (0-100),
            "intervention_effectiveness": (0-100),
            "professionalism": (0-100)
          },
          "feedback": "Informe complet en format Markdown. Inclou: \n## 📊 Resum Executiu\n\n## ✅ Punts Forts\n\n## ⚠️ Àrees de Millora\n\n## 💡 Recomanació Clínica Específica"
        }
        
        Important: Retorna NOMÉS el JSON RAW (sense \`\`\`).
        `;

        try {
            const result = await this.aiProvider.generateJSON<{ feedback: string; metrics: any }>(prompt, {
                modelName: this.modelName
            });

            return result;
        } catch (error) {
            this.logger.error('Error in evaluation:', error);
            // Fallback to avoid breaking frontend
            return {
                metrics: { empathy: 50, intervention_effectiveness: 50, professionalism: 50 },
                feedback: "⚠️ Error en generar l'informe. Si us plau, torna-ho a provar.\n\n" + error
            };
        }
    }
}
