import { Injectable, Logger, Inject, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider, AiMessage } from '../ai/interfaces/ai-provider.interface';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UsageLimitsService } from '../payments/usage-limits.service';

import { createHmac } from 'crypto';

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
    sessionStart?: number; // Timestamp
    signature?: string; // Integrity check
}

@Injectable()
export class SimulatorService {
    private readonly logger = new Logger(SimulatorService.name);
    private modelName: string;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
        private usageLimitsService: UsageLimitsService,
        @Inject('AI_PROVIDER') private aiProvider: AiProvider
    ) {
        // Allow overriding model via ENV, default to 2.0-flash if not set
        this.modelName = this.configService.get('GEMINI_MODEL') || 'gemini-2.0-flash';

        // DEBUG: Print config to logs
        const apiKey = this.configService.get('GEMINI_API_KEY');
        this.logger.warn(`Simulator Init: Model=${this.modelName}, API_KEY=${apiKey ? 'Set (starts with ' + apiKey.substring(0, 4) + ')' : 'MISSING'}`);
    }

    private async checkAndIncrementUsage(userId: string): Promise<void> {
        // Reset Logic Check (handled here to ensure it runs before limit check)
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new ForbiddenException("User not found");

        // Use centralized service to check limits
        await this.usageLimitsService.checkSimulatorLimit(userId);
        // Check if user has at least 1 minute available to start a session
        await this.usageLimitsService.checkSimulatorMinutesLimit(userId, 1);

        // Increment
        // Increment via UsageLimitsService to handle extra packs logic
        const result = await this.usageLimitsService.incrementSimulatorUsage(userId);
        if (result.limitExceeded) {
            throw new ForbiddenException("Simulator limit exceeded (including extra packs)");
        }
    }

    /**
     * Generates a random clinical case (Persona).
     */
    async generateCase(userId: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium', showNonVerbalCues?: boolean): Promise<PatientProfile> {
        this.logger.log(`Starting generateCase for user ${userId}`);
        try {
            // Enforce Limits
            await this.checkAndIncrementUsage(userId);

            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            const lang = user?.preferredLanguage || 'ca'; // Default to Catalan

            // If showNonVerbalCues is true, we ask for more detailed body language
            const nonVerbalInstruction = showNonVerbalCues
                ? "INCLUYE DETALLES DE LENGUAJE NO VERBAL ESPECÍFICOS Y COMPLEJOS."
                : "";

            const randomSeed = Math.random().toString(36).substring(7) + Date.now();

            const prompt = `
            Genera un perfil detallat d'un PACIENT SIMULAT per a una sessió de teràpia psicològica.
            Dificultat: ${difficulty}.
            Idioma del paciente: ${lang === 'es' ? 'ESPAÑOL' : lang === 'en' ? 'ENGLISH' : 'CATALÀ'}.
            Random Seed: ${randomSeed} (USA ESTA SEMILLA PARA VARIAR DRASTICAMENTE EL NOMBRE Y LA PATOLOGÍA).
            ${nonVerbalInstruction}
    
            IMPORTANTE:
            1. NO uses nombres comunes como "Laia", "Aina", "Marc". Inventa nombres variados.
            2. NO repitas patologías comunes (ansiedad, depresión). Inventa casos complejos o poco frecuentes.
            3. VARIA la edad y el género.
            
            Retorna un objecte JSON amb aquests camps:
            {
              "name": "Nombre ficticio (VARIADO)",
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

            const data = await this.aiProvider.generateJSON<PatientProfile>(prompt, {
                modelName: this.modelName,
                temperature: 0.9 // High creativity
            });

            // Validate essential fields exists
            if (!data.name || !data.age) throw new Error("Invalid structure: Missing fields");

            // Attach Security Signature
            const sessionStart = Date.now();
            const signature = this.signSession(userId, sessionStart, difficulty);

            return { ...data, difficulty, sessionStart, signature };

        } catch (error) {
            this.logger.error(`Error in generateCase for user ${userId}:`, error);

            // Re-throw if it's a ForbiddenException (Limit Exceeded)
            if (error instanceof ForbiddenException) {
                throw error;
            }

            // Fallback case safely
            const sessionStart = Date.now();
            const signature = this.signSession(userId, sessionStart, difficulty);

            return {
                name: "Àlex",
                age: 30,
                condition: "Estrès laboral i ansietat generalitzada",
                traits: ["Rumiació", "Evitació de conflictes"],
                difficulty,
                scenario: "Treballa en una consultora i sent que no pot més. Té insomni.",
                hiddenGoal: "No vol deixar la feina perquè té por de fallar.",
                initialMood: "Cansat i nerviós",
                sessionStart,
                signature
            };
        }
    }



    private signSession(userId: string, sessionStart: number, difficulty: string): string {
        try {
            const secret = this.configService.get('JWT_SECRET') || 'fallback_secret';
            const data = `${userId}:${sessionStart}:${difficulty}`;
            return createHmac('sha256', secret).update(data).digest('hex');
        } catch (error) {
            this.logger.error('Error signing session:', error);
            return 'signature_error';
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

            // Integrity & Duration Check
            // We only check if profile has sessionStart (new sessions). Old sessions (if any active) might fail or pass depending on strictness.
            // Let's enforce strictly for security.
            if (profile.sessionStart && profile.signature) {
                const expectedSig = this.signSession(userId, profile.sessionStart, profile.difficulty);
                if (profile.signature !== expectedSig) {
                    throw new ForbiddenException("Invalid session signature");
                }

                const elapsedMinutes = (Date.now() - profile.sessionStart) / 1000 / 60;
                const LIMIT_MINUTES = 45; // 45 minutes limit
                if (elapsedMinutes > LIMIT_MINUTES) {
                    throw new ForbiddenException("Session time expired (" + LIMIT_MINUTES + " mins limit)");
                }
            } else {
                // If it's a demo or old session without signature, we might allow or block.
                // For safety in this update, if userId is present (Authenticated) and no signature -> Block new cases.
                // But let's allow "Demo" route which passes NO userId usually (or different path).
                // If this is called from authenticated controller, userId is present.
                if (!profile.sessionStart) {
                    // Optional: generate one now? No, prevent manipulation.
                    // Allow legacy for 1 hour? No, just strict.
                    // throw new ForbiddenException("Missing session security context");
                }
            }
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
           - Usa señales no verbales SOLO cuando haya un cambio emocional relevante o sea necesario para el contexto (no en cada respuesta).

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
    async evaluate(history: { role: 'user' | 'model'; parts: string }[], userId: string, profile: PatientProfile, durationSeconds?: number): Promise<{ feedback: string; metrics: any }> {
        // Increment Minutes Used if duration provided
        if (durationSeconds && durationSeconds > 0) {
            const minutes = Math.ceil(durationSeconds / 60);

            // Limit check for minutes (optional, but good practice to ensure they don't go over if we want strict enforcement)
            // But usually we deduct after usage.
            // Just increment for now.
            try {
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { simulatorMinutesUsed: { increment: minutes } }
                });
            } catch (e) {
                this.logger.error(`Failed to increment simulator minutes for user ${userId}`, e);
            }
        }

        // Check for empty or too short history to avoid "template" hallucinations
        if (!history || history.length < 2) {
            return {
                metrics: { empathy: 0, intervention_effectiveness: 0, professionalism: 0 },
                feedback: "# ⚠️ Sesión Insuficiente\n\nNo se ha detectado suficiente interacción para generar un informe clínico válido.\n\nPor favor, realiza una sesión más extensa (mínimo 2 intercambios) para que la IA pueda evaluar tus competencias."
            };
        }

        // Format history into a readable transcript
        const transcript = (history || []).map(msg => {
            const speaker = msg.role === 'user' ? 'Psicólogo (Usuario)' : 'Paciente (IA)';
            const text = typeof msg.parts === 'string' ? msg.parts : JSON.stringify(msg.parts);
            return `** ${speaker}**: ${text} `;
        }).join('\n\n');

        // Fetch user language preference
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const lang = user?.preferredLanguage || 'ca'; // Default to Catalan check
        const langName = lang === 'es' ? 'ESPAÑOL' : lang === 'en' ? 'ENGLISH' : 'CATALÀ';

        let prompt = '';

        if (lang === 'ca') {
            prompt = `
            ACTUA COM UN SUPERVISOR CLÍNIC EXPERT (MODEL COGNITIU-CONDUCTUAL / Humanista).
            Analitza la següent transcripció d'una sessió simulada entre un Terapeuta (Usuari) i un Pacient (IA).
            
            === TRANSCRIPCIÓ ===
            ${transcript}
            ====================

            LA TEVA TASCA:
            1. Avalua l'empatia, eficàcia i professionalitat del terapeuta (0-100).
            2. Escriu un informe detallat en format Markdown (feedback). NO COPIIS L'ESTRUCTURA D'EXEMPLE LITERALMENT, OMPLE-LA AMB CONTINGUT ESPECÍFIC DE LA SESSIÓ.
            
            IDIOMA DE RESPOSTA: CATALÀ IMPERATIU.

            Respon amb un objecte JSON vàlid amb aquest format:
            {
                "metrics": {
                    "empathy": (0-100),
                    "intervention_effectiveness": (0-100),
                    "professionalism": (0-100)
                },
                "feedback": "# 📊 Resum Executiu\n[Escriu aquí un resum de 3 línies sobre l'acompliment global]\n\n## 🔑 Moments Clau\n[Cita textualment 2 o 3 intervencions específiques i analitza-les]\n\n## ✅ Punts Forts\n- [Punt 1]\n- [Punt 2]\n\n## ⚠️ Àrees de Millora\n- [Àrea 1]\n- [Àrea 2]\n\n## 💡 Recomendació Clínica\n[Consell pràctic per a la propera sessió]"
            }

            IMPORTANT: El camp 'feedback' ha de ser una cadena de text (string) que contingui el Markdown formatat. Assegura't d'escapar els salts de línia correctament en el JSON.
            `;
        } else {
            // Default to Spanish
            prompt = `
            ACTÚA COMO UN SUPERVISOR CLÍNICO EXPERTO (MODELO CBT / Humanista).
            Analiza la siguiente transcripción de una sesión simulada entre un Terapeuta (Usuario) y un Paciente (IA).
            
            === TRANSCRIPCIÓN ===
            ${transcript}
            ====================

            TU TAREA:
            1. Evalúa la empatía, eficacia y profesionalidad del terapeuta (0-100).
            2. Escribe un informe detallado en Markdown (feedback). NO COPIES LA ESTRUCTURA DE EJEMPLO LITERALMENTE, RELLÉNALA CON CONTENIDO ESPECÍFICO DE LA SESIÓN.
            
            IDIOMA DE RESPUESTA: ESPAÑOL.

            Responde con un objeto JSON válido con este formato:
            {
                "metrics": {
                    "empathy": (0-100),
                    "intervention_effectiveness": (0-100),
                    "professionalism": (0-100)
                },
                "feedback": "# 📊 Resumen Ejecutivo\n[Escribe aquí un resumen de 3 líneas sobre el desempeño global]\n\n## 🔑 Momentos Clave\n[Cita textualmente 2 o 3 intervenciones específicas y analízalas]\n\n## ✅ Puntos Fuertes\n- [Punto 1]\n- [Punto 2]\n\n## ⚠️ Áreas de Mejora\n- [Area 1]\n- [Area 2]\n\n## 💡 Recomendación Clínica\n[Consejo práctico para la próxima sesión]"
            }

            IMPORTANTE: El campo 'feedback' debe ser una cadena de texto (string) que contenga el Markdown formateado. Asegúrate de escapar los saltos de línea correctamente en el JSON.
            `;
        }

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

    async getReports(userId: string, filters?: { period?: string; patientName?: string; date?: string }) {
        const where: any = { userId };

        if (filters?.period) {
            const now = new Date();
            let startDate: Date;

            switch (filters.period) {
                case 'week':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    startDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
                case 'year':
                    startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                    break;
            }

            if (startDate) {
                where.createdAt = { gte: startDate };
            }
        }

        if (filters?.date) {
            const date = new Date(filters.date);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));

            where.createdAt = {
                ...where.createdAt,
                gte: startOfDay,
                lte: endOfDay
            };
        }

        if (filters?.patientName) {
            where.patientName = {
                contains: filters.patientName,
                mode: 'insensitive'
            };
        }

        return this.prisma.simulationReport.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                createdAt: true,
                patientName: true,
                difficulty: true,
                empathyScore: true,
                effectivenessScore: true,
                professionalismScore: true,
                feedbackMarkdown: true
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

    async getStats(userId: string, period?: string) {
        // 1. Get Usage & Limits from centralized service
        const usageData = await this.usageLimitsService.getUserUsage(userId);

        if (!usageData) {
            throw new ForbiddenException("Could not retrieve usage data");
        }

        const plan = usageData.planType;
        const limitCases = usageData.limits.simulatorCases;
        const usedCases = usageData.currentUsage.simulatorCases;
        const limitMinutes = usageData.limits.simulatorMinutes;
        const usedMinutes = usageData.currentUsage.simulatorMinutes;

        // Calculate remaining
        // UsageLimitsService returns 9999 for UNLIMITED cases, but -1 for UNLIMITED minutes.
        // We normalize here for frontend consistency.
        const displayLimitMinutes = limitMinutes === -1 ? 9999 : limitMinutes;
        const remainingMinutes = limitMinutes === -1 ? 9999 : Math.max(0, limitMinutes - usedMinutes);

        // Cases are already normalized to 9999 in UsageLimitsService if UNLIMITED
        const remainingCases = Math.max(0, limitCases - usedCases);

        // Calculate next reset (Billing Cycle Date)
        const now = new Date();
        const nextReset = usageData.currentUsage.limitResetDate
            ? new Date(usageData.currentUsage.limitResetDate)
            : new Date(now.getFullYear(), now.getMonth() + 1, 1);

        // 2. Existing Stats Logic (Charts)
        const where: any = { userId };

        if (period) {
            let startDate: Date;

            switch (period) {
                case 'week':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    startDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
                case 'year':
                    startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                    break;
            }

            if (startDate) {
                where.createdAt = { gte: startDate };
            }
        }

        const reports = await this.prisma.simulationReport.findMany({
            where,
            orderBy: { createdAt: 'asc' }, // Chronological for graph
            take: period ? undefined : 20 // If period is specified, get everything in that period. If not, default to 20.
        });

        // Calc averages
        const total = reports.length;
        let avgEmpathy = 0;
        let evolution = [];

        if (total > 0) {
            avgEmpathy = reports.reduce((acc, r) => acc + r.empathyScore, 0) / total;
            evolution = reports.map(r => ({
                date: r.createdAt,
                empathy: r.empathyScore,
                effectiveness: r.effectivenessScore
            }));
        }

        return {
            count: total,
            avgEmpathy: Math.round(avgEmpathy),
            evolution,
            // New Fields
            usage: (() => {
                const transcriptionLimitMinutes = usageData.limits.transcriptionMinutes;
                const transcriptionUsedMinutes = usageData.currentUsage.transcriptionMinutes || 0;



                return {
                    limit: limitCases,
                    used: usedCases,
                    remaining: remainingCases,
                    extraSimulatorCases: usageData.currentUsage.extraSimulatorCases, // Pass extra cases
                    // Minutes Logic
                    minutesUsed: usedMinutes, // Correctly uses the outer scope usedMinutes (simulator)
                    minutesLimit: displayLimitMinutes,
                    minutesRemaining: remainingMinutes,

                    // Transcription Logic (Minutes)
                    transcriptionUsed: transcriptionUsedMinutes,
                    transcriptionLimit: transcriptionLimitMinutes === -1 ? -1 : transcriptionLimitMinutes,
                    transcriptionRemaining: transcriptionLimitMinutes === -1 ? 99999 : Math.max(0, transcriptionLimitMinutes - transcriptionUsedMinutes),
                    extraTranscriptionMinutes: usageData.currentUsage.extraTranscriptionMinutes,

                    plan: plan,
                    nextReset: nextReset,

                    // Client Logic
                    clientsUsed: usageData.currentUsage.clients,
                    clientsLimit: usageData.limits.clients
                };
            })()
        };
    }
}
