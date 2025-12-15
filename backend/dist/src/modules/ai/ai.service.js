"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
let AiService = class AiService {
    async generateSessionAnalysis(sessionId, notes) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const sentiment = notes.toLowerCase().includes('triste') || notes.toLowerCase().includes('miedo')
            ? 'PREOCUPANTE'
            : 'ESTABLE';
        const clinicalImpressions = ['Evaluación Rutinaria'];
        if (notes.toLowerCase().includes('ansiedad') || notes.toLowerCase().includes('miedo')) {
            clinicalImpressions.push('Posible Trastorno de Ansiedad Generalizada');
            clinicalImpressions.push('Reacción al estrés agudo');
        }
        else if (notes.toLowerCase().includes('triste') || notes.toLowerCase().includes('llora')) {
            clinicalImpressions.push('Sintomatología depresiva leve');
        }
        return {
            summary: `Resumen generado por IA para la sesión ${sessionId}. Se observan patrones de comunicación...`,
            sentiment,
            riskLevel: sentiment === 'PREOCUPANTE' ? 'MODERADO' : 'BAJO',
            clinicalImpressions,
            suggestions: [
                'Explorar más a fondo los desencadenantes mencionados.',
                'Recomendar ejercicios de respiración diafragmática.',
                'Considerar evaluación psiquiátrica si los síntomas persisten.'
            ],
            detectedIndicators: [],
        };
    }
    async getLiveSuggestions(context) {
        const indicators = [];
        const suggestions = [
            'Preguntar sobre la duración de los síntomas.',
            'Validar las emociones del paciente.',
            'Indagar si ha tenido pensamientos similares antes.'
        ];
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
            suggestions: suggestions.slice(0, 4),
            indicators
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)()
], AiService);
//# sourceMappingURL=ai.service.js.map