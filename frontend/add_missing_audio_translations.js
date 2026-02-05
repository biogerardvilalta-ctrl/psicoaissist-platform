const fs = require('fs');
const path = require('path');

// Add missing translations
['es', 'ca', 'en'].forEach(lang => {
    const filePath = path.join(__dirname, 'messages', `${lang}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Add missing keys
    if (lang === 'es') {
        data.AudioRecorder.stop = "Detener";
        data.AudioRecorder.transcribingAndAnalyzing = "Transcribiendo y analizando...";
        data.AudioRecorder.permissionError = "No se pudo acceder al micrófono. Por favor verifica los permisos.";
    } else if (lang === 'ca') {
        data.AudioRecorder.stop = "Aturar";
        data.AudioRecorder.transcribingAndAnalyzing = "Transcrivint i analitzant...";
        data.AudioRecorder.permissionError = "No s'ha pogut accedir al micròfon. Si us plau, verifica els permisos.";
    } else if (lang === 'en') {
        data.AudioRecorder.stop = "Stop";
        data.AudioRecorder.transcribingAndAnalyzing = "Transcribing and analyzing...";
        data.AudioRecorder.permissionError = "Could not access microphone. Please check permissions.";
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
    console.log(`Updated ${lang}.json with missing AudioRecorder translations`);
});

console.log('All translation files updated successfully!');
