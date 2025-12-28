import { Injectable, Logger, Inject, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider, AiMessage } from '../ai/interfaces/ai-provider.interface';
import { PrismaService } from '../../common/prisma/prisma.service';

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
    hiddenGoal?: string; // e.g. "Ocultar mi consumo de alcohol"
    initialMood?: string; // e.g. "Defensive", "Tearful"
    defenseMechanisms?: string[]; // e.g. ["Projection", "Intellectualization"]
    communicationStyle?: string; // e.g. "Passive-Aggressive", "Tangential", "Monosyllabic"
    triggers?: string[]; // e.g. ["Mention of father", "Silence"]
}

@Injectable()
export class SimulatorService {
    private readonly logger = new Logger(SimulatorService.name);
    private modelName = 'gemini-2.0-flash'; // Default model

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
        @Inject('AI_PROVIDER') private aiProvider: AiProvider
    ) { }

    private async checkAndIncrementUsage(userId: string): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true }
        });

        if (!user) throw new ForbiddenException("User not found");

        const plan = user.subscription?.planType || 'basic';

        // Unlimited plans
        if (['premium', 'clinics', 'admin'].includes(plan)) return;

        // Basic plan (No access, though frontend should hide it)
        if (plan === 'basic') {
            throw new ForbiddenException("El plan Basic no incluye simulador. Actualiza a Pro.");
        }

        // Pro / Team Plan (Limited to 5 + Referrals)
        const baseLimit = 100; // Increased for development/testing
        const referralBonus = (user.referralsCount || 0) * 5;
        const totalLimit = baseLimit + referralBonus;

        // Reset Logic
        const now = new Date();
        const lastReset = user.simulatorLastReset || new Date(0);
        const isNewMonth = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();

        if (isNewMonth) {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    simulatorUsageCount: 1, // Start with 1 for this usage
                    simulatorLastReset: now
                }
            });
            return;
        }

        if (user.simulatorUsageCount >= totalLimit) {
            throw new ForbiddenException(`Has alcanzado el límite de ${totalLimit} casos/mes (${baseLimit} base + ${referralBonus} por referidos). Invita a más profesionales para ampliar.`);
        }

        // Increment
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                simulatorUsageCount: { increment: 1 }
            }
        });
    }

    /**
     * Generates a random clinical case (Persona).
     */
    async generateCase(userId: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium', showNonVerbalCues?: boolean): Promise<PatientProfile> {
        // Enforce Limits
        await this.checkAndIncrementUsage(userId);

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const lang = user?.preferredLanguage || 'ca'; // Default to Catalan

        // If showNonVerbalCues is true, we ask for more detailed body language
        const nonVerbalInstruction = showNonVerbalCues
            ? "INCLUYE DETALLES DE LENGUAJE NO VERBAL ESPECÍFICOS Y COMPLEJOS."
            : "";

        const prompt = `
        Genera un perfil detallat d'un PACIENT SIMULAT per a una sessió de teràpia psicològica.
        Dificultat: ${difficulty}.
        Idioma del paciente: ${lang === 'es' ? 'ESPAÑOL' : lang === 'en' ? 'ENGLISH' : 'CATALÀ'}.
        ${nonVerbalInstruction}
        
        Retorna un objecte JSON amb aquests camps:
        {
          "name": "Nombre ficticio",
          "age": 25,
          "condition": "Breve descripción del motivo de consulta",
          "traits": ["Rasgo 1", "Rasgo 2"],
          "scenario": "Breve descripción del contexto.",
          "hiddenGoal": "Un objetivo oculto o resistencia que el paciente tiene (ej: no hablar de su padre, ocultar una adicción).",
          "initialMood": "Estado emocional inicial (ej: Defensivo, Lloroso, Ansioso).",
          "defenseMechanisms": ["Mecanismo 1", "Mecanismo 2 (ej: Proyección, Racionalización, Evitación)"],
          "communicationStyle": "Estilo de comunicación (ej: Pasivo-Agresivo, Monosilábico, Verborreico, Tangencial)",
          "triggers": ["Temas o actitudes verbales que provocan una reacción defensiva inmediata"]
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
                scenario: "Treballa en una consultora i sent que no pot més. Té insomni.",
                hiddenGoal: "No vol deixar la feina perquè té por de fallar.",
                initialMood: "Cansat i nerviós"
            };
        }
    }

    /**
     * Handles the chat interaction with the simulated patient.
     */
    async chat(history: { role: 'user' | 'model'; parts: string }[], newMessage: string, profile: PatientProfile, userId?: string): Promise<string> {
        let lang = 'ca';
        if (userId) {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (user?.preferredLanguage) lang = user.preferredLanguage;
        }

        const systemPrompt = `
        IDIOMA DE RESPUESTA: ${lang === 'es' ? 'ESPAÑOL (CAST)' : lang === 'en' ? 'ENGLISH' : 'CATALÀ'}.
        ACTUA COM: ${profile.name}, ${profile.age} anys.
            CONDICIÓ: ${profile.condition}.
        TRETS: ${(profile.traits || []).join(', ')}.
        CONTEXT: ${profile.scenario}.
        OBJETIVO OCULTO: ${profile.hiddenGoal || 'Ninguno'}.
        HUMOR INICIAL: ${profile.initialMood || 'Neutral'}.
        
        MECANISMOS DE DEFENSA: ${(profile.defenseMechanisms || []).join(', ') || 'Racionalización'}.
        ESTILO COMUNICATIVO: ${profile.communicationStyle || 'Neutro'}.
        TRIGGERS: ${(profile.triggers || []).join(', ') || 'Ninguno'}.
        
        INSTRUCCIONS DE SIMULACIÓ AVANÇADA(MOTOR PSICOLÒGIC):
        1. ESTADO INTERNO(3 EJES):
        - RAPPORT(0 - 100): Conexión con el terapeuta.Sube con empatía, baja con juicio.
           - ANSIEDAD(0 - 100): Nivel de activación.Sube si se tocan "triggers" antes de tiempo.
           - INSIGHT(0 - 100): Comprensión del problema.Empieza BAJO(10 - 20).Solo sube con preguntas reflexivas muy buenas.
        
        2. REGLA "SHOW, DON'T TELL"(IMPORTANTE):
        - NO digas "estoy nervioso".
           - USA ACCIONES ENTRE ASTERISCOS: "*Desvía la mirada y juega con las manos*" o "*Se calla abruptamente*".
           - Incluye al menos una señal no verbal en cada respuesta.

        3. RESISTENCIA DINÁMICA:
        - Si el terapeuta va muy rápido -> Activa mecanismo de defensa(ej: cambia de tema, intelectualiza).
           - Si toca un TRIGGER con bajo RAPPORT -> Poned defensivo o silencio total.
           - Si el RAPPORT es alto(> 70) -> Empieza a soltar "pistas" del Objetivo Oculto.

        ESTILO DE HABLA:
        - Ajustado al ESTILO COMUNICATIVO.
        - Usa titubeos naturales("eh...", "bueno...") si la ANSIEDAD es alta.
        - Respuestas de longitud realista(no monólogos, salvo que seas "Verborreico").

            IDIOMA: Español(Mantén coherencia con la variante regional si el nombre lo sugiere).
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
    async evaluate(history: { role: 'user' | 'model'; parts: string }[], userId: string, profile: PatientProfile): Promise<{ feedback: string; metrics: any }> {
        // Format history into a readable transcript
        const transcript = (history || []).map(msg => {
            const speaker = msg.role === 'user' ? 'Psicólogo (Usuario)' : 'Paciente (IA)';
            const text = typeof msg.parts === 'string' ? msg.parts : JSON.stringify(msg.parts);
            return `** ${speaker}**: ${text} `;
        }).join('\n\n');

        const prompt = `
        ACTÚA COMO UN SUPERVISOR CLÍNICO EXPERTO(MODELO CBT / Humanista).
        Analiza la siguiente transcripción de una sesión simulada.
        
        === TRANSCRIPCIÓN ===
            ${transcript}
        ====================

            Analiza la sesión y retorna un objeto JSON con el siguiente formato EXACTO:
        {
            "metrics": {
                "empathy": (0 - 100),
                    "intervention_effectiveness": (0 - 100),
                        "professionalism": (0 - 100)
            },
            "feedback": "Informe completo en formato Markdown. Estructura: \n## 📊 Resumen Ejecutivo\n\n## 🔑 Momentos Clave\n(Identifica 2-3 intercambios donde el terapeuta lo hizo bien o mal)\n\n## ✅ Puntos Fuertes\n\n## ⚠️ Áreas de Mejora\n\n## 💡 Recomendación Clínica"
        }

        Importante: Retorna SOLO el JSON RAW(sin \`\`\`).
        `;

        try {
            const result = await this.aiProvider.generateJSON<{ feedback: string; metrics: any }>(prompt, {
                modelName: this.modelName
            });

            // Save Report to DB
            await this.prisma.simulationReport.create({
                data: {
                    userId,
                    patientName: profile.name,
                    difficulty: profile.difficulty,
                    scenario: profile.scenario,
                    empathyScore: result.metrics.empathy,
                    effectivenessScore: result.metrics.intervention_effectiveness,
                    professionalismScore: result.metrics.professionalism,
                    feedbackMarkdown: result.feedback
                }
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

    async getReports(userId: string) {
        return this.prisma.simulationReport.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                createdAt: true,
                patientName: true,
                difficulty: true,
                empathyScore: true,
                effectivenessScore: true,
                professionalismScore: true
            }
        });
    }

    async getReportById(reportId: string, userId: string) {
        const report = await this.prisma.simulationReport.findFirst({
            where: { id: reportId, userId }
        });
        if (!report) throw new ForbiddenException("Report not found");
        return report;
    }

    async getStats(userId: string) {
        const reports = await this.prisma.simulationReport.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' }, // Chronological for graph
            take: 20 // Last 20 sessions
        });

        // Calc averages
        const total = reports.length;
        if (total === 0) return { count: 0, avgEmpathy: 0, evolution: [] };

        const avgEmpathy = reports.reduce((acc, r) => acc + r.empathyScore, 0) / total;

        return {
            count: total,
            avgEmpathy: Math.round(avgEmpathy),
            evolution: reports.map(r => ({
                date: r.createdAt,
                empathy: r.empathyScore,
                effectiveness: r.effectivenessScore
            }))
        };
    }
}
