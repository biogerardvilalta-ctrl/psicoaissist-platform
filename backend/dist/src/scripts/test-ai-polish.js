"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const ai_service_1 = require("../modules/ai/ai.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const aiService = app.get(ai_service_1.AiService);
    const testCases = [
        "Me siento muy triste y no tengo ganas de nada",
        "Tengo miedo de que pase algo malo en el trabajo",
        "Mis padres siempre me dicen que no valgo nada",
        "A veces pienso que quiero morirme",
        "Todo me sale mal, nunca hago nada bien",
        "Hola, buenos días"
    ];
    console.log('--- STARTING AI POLISH VERIFICATION ---');
    for (const text of testCases) {
        console.log(`\nINPUT: "${text}"`);
        const result = await aiService.getLiveSuggestions(text);
        console.log('INDICATORS:', result.indicators.map(i => `[${i.type.toUpperCase()}] ${i.label}`));
        console.log('QUESTIONS:', result.questions);
        console.log('CONSIDERATIONS:', result.considerations);
        if (text.includes("triste") && !result.indicators.some(i => i.type === 'mood'))
            console.error("FAIL: Missed Mood indicator");
        if (text.includes("siempre") && !result.indicators.some(i => i.type === 'pattern'))
            console.error("FAIL: Missed Pattern indicator");
        if (text.includes("morirme") && !result.indicators.some(i => i.type === 'risk'))
            console.error("FAIL: Missed Risk indicator");
    }
    console.log('\n--- VERIFICATION COMPLETE ---');
    await app.close();
}
bootstrap();
//# sourceMappingURL=test-ai-polish.js.map