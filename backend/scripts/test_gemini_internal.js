const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    console.log("--- TEST DE CONEXIÓN NODJS (INTERNO) ---");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ ERROR: No hay GEMINI_API_KEY en process.env");
        process.exit(1);
    }

    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    console.log(`🔑 Key: ${apiKey.substring(0, 10)}... (Length: ${apiKey.length})`);
    console.log(`🤖 Model: ${modelName}`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    try {
        console.log("📡 Enviando solicitud...");
        const result = await model.generateContent("Say Hello");
        const response = await result.response;
        const text = response.text();
        console.log("✅ ÉXITO:", text);
    } catch (error) {
        console.error("❌ ERROR FATAL:");
        console.error(error);
    }
}

test();
