
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    try {
        // For some reason the Node SDK doesn't expose listModels directly on the main class easily in some versions, 
        // but let's try to just generate content with 'gemini-pro' to check connectivity first,
        // or try to use the model manager if accessible.
        // Actually, checking docs, listing models is via ModelService (not always exposed in high level SDK).
        // Let's just try to hit 'gemini-1.5-flash' again and print the error detailedly.

        console.log('Testing gemini-1.5-flash...');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log('Success with gemini-1.5-flash:', result.response.text());

    } catch (error) {
        console.error('Error with gemini-1.5-flash:', error.message);
    }

    try {
        console.log('Testing gemini-pro...');
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log('Success with gemini-pro:', result.response.text());

    } catch (error) {
        console.error('Error with gemini-pro:', error.message);
    }
}

run();
