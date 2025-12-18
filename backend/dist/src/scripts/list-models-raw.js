const https = require('https');
const dotenv = require('dotenv');
dotenv.config();
const key = process.env.GEMINI_API_KEY;
https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, (resp) => {
    let data = '';
    resp.on('data', (chunk) => {
        data += chunk;
    });
    resp.on('end', () => {
        const json = JSON.parse(data);
        if (json.models) {
            const geminiModels = json.models
                .filter(m => m.name.includes('gemini'))
                .map(m => m.name);
            console.log("AVAILABLE GEMINI MODELS:", geminiModels);
        }
        else {
            console.log("Only error or empty:", json);
        }
    });
}).on("error", (err) => {
    console.log("Error: " + err.message);
});
//# sourceMappingURL=list-models-raw.js.map