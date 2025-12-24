import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

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
    private genAI: GoogleGenerativeAI;
    private readonly logger = new Logger(SimulatorService.name);
    private modelName = 'gemini-2.0-flash'; // Available model

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        this.genAI = new GoogleGenerativeAI(apiKey || '');
    }

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
            const model = this.genAI.getGenerativeModel({
                model: this.modelName,
                generationConfig: { responseMimeType: "application/json" }
            });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            // Aggressive cleanup to ensure no markdown
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();

            const data = JSON.parse(text);

            // Validate essential fields exists
            if (!data.name || !data.age) throw new Error("Invalid structure");

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
        
        ESTÀS EN TERÀPIA. Parla com un pacient, no com una IA.
        - Respostes curtes i naturals (com a conversa oral).
        - Mostra emocions segons els teus trets.
        - Si la dificultat és alta, sigues resistent o confús.
        - NO t'identifiquis com una IA. Ets un personatge de rol.
        - Idioma: Català o Castellà (adapta't a l'usuari).
        `;

        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName });

            // Validate and sanitize history
            const validHistory = (history || []).map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.parts || '' }]
            }));

            // Construct history for Gemini SDK
            const chatObj = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: systemPrompt }]
                    },
                    {
                        role: "model",
                        parts: [{ text: "Entes. Em posaré en el paper. Començem." }]
                    },
                    ...validHistory
                ]
            });

            const result = await chatObj.sendMessage(newMessage);
            const response = await result.response;
            return response.text();
        } catch (error) {
            this.logger.error('Error in chat:', error);
            // Fallback response explicitly to avoid 500
            return "... (El pacient roman en silenci. Comprova la connexió o API Key)";
        }
    }

    /**
     * Generates a supervisory report after the session.
     */
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
            const model = this.genAI.getGenerativeModel({
                model: this.modelName,
                generationConfig: { responseMimeType: "application/json" }
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(text);
        } catch (error) {
            this.logger.error('Error in evaluation:', error);
            return {
                metrics: { empathy: 0, intervention_effectiveness: 0, professionalism: 0 },
                feedback: "⚠️ No s'ha pogut generar l'informe detallat degut a un error del sistema."
            };
        }
    }
}
