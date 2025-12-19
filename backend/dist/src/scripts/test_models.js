"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generative_ai_1 = require("@google/generative-ai");
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    process.exit(1);
}
const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
async function listModels() {
    try {
        const candidates = [
            "gemini-pro",
            "gemini-1.5-flash",
            "gemini-1.5-flash-001",
            "gemini-1.5-pro-001",
            "gemini-1.0-pro"
        ];
        console.log("Testing model availability...");
        for (const modelName of candidates) {
            try {
                console.log(`Testing ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello, are you there?");
                const response = await result.response;
                console.log(`SUCCESS: ${modelName} is available.`);
                console.log(`Response: ${response.text().substring(0, 20)}...`);
            }
            catch (e) {
                console.log(`FAILED: ${modelName}. Error: ${e.message.split('\n')[0]}`);
            }
        }
    }
    catch (error) {
        console.error("Error listing models:", error);
    }
}
listModels();
//# sourceMappingURL=test_models.js.map