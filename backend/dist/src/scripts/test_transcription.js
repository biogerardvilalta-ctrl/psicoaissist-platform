"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generative_ai_1 = require("@google/generative-ai");
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    process.exit(1);
}
const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
async function testTranscription() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        console.log("Testing text generation...");
        const textResult = await model.generateContent("Hello?");
        console.log("Text response:", textResult.response.text());
    }
    catch (error) {
        console.error("Error:", error);
    }
}
testTranscription();
//# sourceMappingURL=test_transcription.js.map