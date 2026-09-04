import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch'; // Requires node-fetch or native fetch in newer node

dotenv.config();

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Checking API Key:', apiKey ? 'Present' : 'MISSING');

    if (!apiKey) {
        console.error('ERROR: GEMINI_API_KEY is not set in .env');
        return;
    }

    try {
        console.log("Listing models via REST API...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data: any = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach((m: any) => {
                // Ensure we only list models that support generating content
                if (m.supportedGenerationMethods?.includes('generateContent')) {
                    console.log(`- ${m.name} (${m.displayName})`);
                }
            });
        } else {
            console.error("No models found or error:", JSON.stringify(data, null, 2));
        }

    } catch (error: any) {
        console.error('FAILURE during REST request');
        console.error('Message:', error.message);
    }
}

testGemini();
