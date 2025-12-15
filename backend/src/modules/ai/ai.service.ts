
import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
    /**
     * Generates a summary and analysis for a completed session.
     * In a real implementation, this would call an LLM (OpenAI/Gemini).
     */
    async generateSessionAnalysis(sessionId: string, notes: string): Promise<{
        summary: string;
        sentiment: string;
        suggestions: string[];
        clinicalImpressions?: string[];
        detectedIndicators?: { type: string; label: string }[];
        riskLevel?: string;
    }> {
        // Mock implementation with simulated delay and basic heuristics
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const sentiment = notes.toLowerCase().includes('triste') || notes.toLowerCase().includes('miedo')
            ? 'PREOCUPANTE'
            : 'ESTABLE';

        // Basic heuristic to simulate "Clinical Impressions"
        const clinicalImpressions = ['Evaluación Rutinaria'];
        if (notes.toLowerCase().includes('ansiedad') || notes.toLowerCase().includes('miedo')) {
            clinicalImpressions.push('Posible Trastorno de Ansiedad Generalizada');
            clinicalImpressions.push('Reacción al estrés agudo');
        } else if (notes.toLowerCase().includes('triste') || notes.toLowerCase().includes('llora')) {
            clinicalImpressions.push('Sintomatología depresiva leve');
        }

        return {
            summary: `Resumen generado por IA para la sesión ${sessionId}. Se observan patrones de comunicación...`,
            sentiment,
            riskLevel: sentiment === 'PREOCUPANTE' ? 'MODERADO' : 'BAJO',
            clinicalImpressions,
            // In a real app, these would be aggregated from the live analysis events
            suggestions: [
                'Explorar más a fondo los desencadenantes mencionados.',
                'Recomendar ejercicios de respiración diafragmática.',
                'Considerar evaluación psiquiátrica si los síntomas persisten.'
            ],
            detectedIndicators: [], // Placeholder for now
        };
    }

    /**
     * Generates real-time suggestions during a session.
     */
    async getLiveSuggestions(context: string): Promise<{ suggestions: string[]; indicators: { type: string; label: string }[] }> {
        // Mock implementation
        const indicators = [];
        const suggestions = [
            'Preguntar sobre la duración de los síntomas.',
            'Validar las emociones del paciente.',
            'Indagar si ha tenido pensamientos similares antes.'
        ];

        // Dynamic Mock Logic
        if (context.toLowerCase().includes('triste') || context.toLowerCase().includes('llora')) {
            indicators.push({ type: 'mood', label: 'Bajo Estado de Ánimo' });
            suggestions.unshift('¿Desde cuándo te sientes así de triste?');
            suggestions.unshift('¿Hay algo específico que desencadene este llanto?');
        }
        if (context.toLowerCase().includes('miedo') || context.toLowerCase().includes('ansiedad')) {
            indicators.push({ type: 'risk', label: 'Ansiedad Detectada' });
            suggestions.unshift('¿Podrías describir qué sientes físicamente cuando tienes miedo?');
            suggestions.unshift('Vamos a intentar respirar juntos, ¿te parece bien?');
        }
        if (context.toLowerCase().includes('familia') || context.toLowerCase().includes('madre')) {
            indicators.push({ type: 'topic', label: 'Dinámica Familiar' });
            suggestions.unshift('¿Cómo describirías tu relación con ella actualmente?');
        }

        return {
            suggestions: suggestions.slice(0, 4), // Limit to 4
            indicators
        };
    }
}
