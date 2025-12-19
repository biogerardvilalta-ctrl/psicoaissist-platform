
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'fs';
import * as path from 'path';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testTranscription() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // We need a dummy audio file. I'll create a very small one or expect one exists.
        // Actually, without a file it's hard. 
        // Let's try to verify just the text generation first to be sure the model is 100% working for *text* 
        // effectively confirming the 400 is definitely about the audio part.

        console.log("Testing text generation...");
        const textResult = await model.generateContent("Hello?");
        console.log("Text response:", textResult.response.text());

        // Now ideally we'd test audio.
        // I will log instructions to the user or try to read a dummy file if I can make one.
        // For now, let's fix the mimeType stripping in the main code as it's the most likely culprit.

    } catch (error) {
        console.error("Error:", error);
    }
}

testTranscription();
