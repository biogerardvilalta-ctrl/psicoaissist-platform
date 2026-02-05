const fs = require('fs');
const path = require('path');

const consentModalTranslations = {
    es: {
        title: "Consentimiento Informado",
        description: "Antes de iniciar la sesión con {clientName}, confirma lo siguiente:",
        clinicalToolTitle: "Herramienta de Soporte Clínico",
        clinicalToolDescription: "Esta herramienta ofrece soporte orientativo exclusivamente para profesionales de la psicología. No realiza diagnósticos ni sustituye el criterio clínico.",
        consentLabel: "Confirmo que he informado al paciente sobre el uso de esta herramienta de soporte y el procesamiento de datos conforme a GDPR.",
        audioDeleteNote: "Los datos de audio se eliminarán automáticamente después del procesamiento.",
        minorLabel: "El paciente es MENOR de edad.",
        minorNote: "Al marcar esta opción, la IA adaptará el análisis a un contexto infanto-juvenil y aplicará filtros de seguridad adicionales.",
        secureServer: "Servidor Seguro EU",
        cancel: "Cancelar",
        startSession: "Iniciar Sesión"
    },
    ca: {
        title: "Consentiment Informat",
        description: "Abans d'iniciar la sessió amb {clientName}, confirma el següent:",
        clinicalToolTitle: "Eina de Suport Clínic",
        clinicalToolDescription: "Aquesta eina ofereix suport orientatiu exclusivament per a professionals de la psicologia. No realitza diagnòstics ni substitueix el criteri clínic.",
        consentLabel: "Confirmo que he informat al pacient sobre l'ús d'aquesta eina de suport i el processament de dades conforme a GDPR.",
        audioDeleteNote: "Les dades d'àudio s'eliminaran automàticament després del processament.",
        minorLabel: "El pacient és MENOR d'edat.",
        minorNote: "En marcar aquesta opció, l'IA adaptarà l'anàlisi a un context infanto-juvenil i aplicarà filtres de seguretat addicionals.",
        secureServer: "Servidor Segur EU",
        cancel: "Cancel·lar",
        startSession: "Iniciar Sessió"
    },
    en: {
        title: "Informed Consent",
        description: "Before starting the session with {clientName}, confirm the following:",
        clinicalToolTitle: "Clinical Support Tool",
        clinicalToolDescription: "This tool offers guidance support exclusively for psychology professionals. It does not make diagnoses or replace clinical judgment.",
        consentLabel: "I confirm that I have informed the patient about the use of this support tool and data processing in accordance with GDPR.",
        audioDeleteNote: "Audio data will be automatically deleted after processing.",
        minorLabel: "The patient is a MINOR.",
        minorNote: "By checking this option, the AI will adapt the analysis to a child-adolescent context and apply additional security filters.",
        secureServer: "Secure EU Server",
        cancel: "Cancel",
        startSession: "Start Session"
    }
};

// Add translations to each language file
['es', 'ca', 'en'].forEach(lang => {
    const filePath = path.join(__dirname, 'messages', `${lang}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.ConsentModal = consentModalTranslations[lang];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
    console.log(`Updated ${lang}.json with ConsentModal translations`);
});

console.log('All translation files updated successfully!');
