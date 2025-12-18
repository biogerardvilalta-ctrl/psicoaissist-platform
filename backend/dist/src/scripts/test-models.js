"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generative_ai_1 = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();
async function run() {
    const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    try {
        console.log('Testing gemini-1.5-flash...');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log('Success with gemini-1.5-flash:', result.response.text());
    }
    catch (error) {
        console.error('Error with gemini-1.5-flash:', error.message);
    }
    try {
        console.log('Testing gemini-pro...');
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log('Success with gemini-pro:', result.response.text());
    }
    catch (error) {
        console.error('Error with gemini-pro:', error.message);
    }
}
run();
//# sourceMappingURL=test-models.js.map