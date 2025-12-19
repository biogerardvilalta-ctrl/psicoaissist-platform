
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // There isn't a direct listModels on GenericAI instance in some versions?
        // Let's try to infer or just test a few common ones.
        // Actually, the SDK wraps the API. If we can't list, we can try to generate with a few candidates.

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
            } catch (e: any) {
                console.log(`FAILED: ${modelName}. Error: ${e.message.split('\n')[0]}`);
            }
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
