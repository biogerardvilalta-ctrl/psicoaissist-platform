const fs = require('fs');
const path = require('path');

const commonTranslations = {
    es: {
        error: "Error",
        success: "Éxito",
        warning: "Advertencia",
        info: "Información",
        loading: "Cargando...",
        loadError: "No se pudo cargar la información.",
        loadDraftError: "No se pudo cargar el borrador.",
        loadSessionsError: "No se pudieron cargar las sesiones del paciente."
    },
    ca: {
        error: "Error",
        success: "Èxit",
        warning: "Advertència",
        info: "Informació",
        loading: "Carregant...",
        loadError: "No s'ha pogut carregar la informació.",
        loadDraftError: "No s'ha pogut carregar l'esborrany.",
        loadSessionsError: "No s'han pogut carregar les sessions del pacient."
    },
    en: {
        error: "Error",
        success: "Success",
        warning: "Warning",
        info: "Information",
        loading: "Loading...",
        loadError: "Could not load information.",
        loadDraftError: "Could not load draft.",
        loadSessionsError: "Could not load patient sessions."
    }
};

// Add translations to each language file
['es', 'ca', 'en'].forEach(lang => {
    const filePath = path.join(__dirname, 'messages', `${lang}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.Common = commonTranslations[lang];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
    console.log(`Updated ${lang}.json with Common translations`);
});

console.log('All translation files updated successfully!');
