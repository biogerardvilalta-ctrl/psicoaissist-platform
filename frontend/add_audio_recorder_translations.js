const fs = require('fs');
const path = require('path');

const audioRecorderTranslations = {
    es: {
        readyToRecord: "Listo para grabar",
        readyToRecordWithControls: "Lista para grabar (Usa controles arriba)",
        recordSession: "Grabar Sesión",
        processing: "Procesando..."
    },
    ca: {
        readyToRecord: "Llest per gravar",
        readyToRecordWithControls: "Llesta per gravar (Usa controls a dalt)",
        recordSession: "Gravar Sessió",
        processing: "Processant..."
    },
    en: {
        readyToRecord: "Ready to record",
        readyToRecordWithControls: "Ready to record (Use controls above)",
        recordSession: "Record Session",
        processing: "Processing..."
    }
};

// Add translations to each language file
['es', 'ca', 'en'].forEach(lang => {
    const filePath = path.join(__dirname, 'messages', `${lang}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.AudioRecorder = audioRecorderTranslations[lang];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
    console.log(`Updated ${lang}.json with AudioRecorder translations`);
});

console.log('All translation files updated successfully!');
