const fs = require('fs');
const path = require('path');

const professionalVideoCallTranslations = {
    es: {
        loading: "Cargando sesión...",
        sessionExpired: "Sesión Caducada",
        loginButton: "Iniciar Sesión",
        videoconf: "Videoconf.",
        startSession: "Iniciar Sesión",
        finishSession: "Finalizar",
        record: "Grabar",
        recording: "GRABANDO",
        stop: "Detener",
        waitingAudio: "Esperando audio...",
        waitingVideo: "Esperando vídeo del paciente...",
        connectionGood: "Conexión: Buena",
        connectionFair: "Conexión: Regular",
        connectionBad: "Conexión: Mala",
        transcriptionTab: "Transcripción",
        notesTab: "Notas Privadas",
        transcriptionPlaceholder: "La transcripción aparecerá aquí...",
        notesPlaceholder: "Escribe tus notas clínicas aquí...",
        autoSaved: "Guardado automático",
        private: "Privado",
        status: {
            connecting: "Conectando...",
            joiningRoom: "Uniéndose a la sala como Profesional...",
            online: "En linea. Peers:",
            patientConnected: "Paciente conectado",
            error: "Error:",
            disconnected: "Desconectado",
            mediaError: "Error accediendo a cámara/micrófono"
        },
        toasts: {
            sessionStarted: "Sesión Iniciada",
            sessionStartedDesc: "El cronómetro ha comenzado.",
            sessionEnded: "Sesión Finalizada",
            sessionEndedDesc: "Informe de IA generándose...",
            error: "Error",
            errorLoadSession: "No se pudo cargar la sesión",
            errorStartSession: "No se pudo iniciar la sesión",
            errorEndSession: "No se pudo finalizar la sesión"
        },
        confirmEnd: "¿Finalizar sesión y volver al detalle?"
    },
    ca: {
        loading: "Carregant sessió...",
        sessionExpired: "Sessió Caducada",
        loginButton: "Iniciar Sessió",
        videoconf: "Videoconf.",
        startSession: "Iniciar Sessió",
        finishSession: "Finalitzar",
        record: "Gravar",
        recording: "GRAVANT",
        stop: "Aturar",
        waitingAudio: "Esperant àudio...",
        waitingVideo: "Esperant vídeo del pacient...",
        connectionGood: "Connexió: Bona",
        connectionFair: "Connexió: Regular",
        connectionBad: "Connexió: Dolenta",
        transcriptionTab: "Transcripció",
        notesTab: "Notes Privades",
        transcriptionPlaceholder: "La transcripció apareixerà aquí...",
        notesPlaceholder: "Escriu les teves notes clíniques aquí...",
        autoSaved: "Desat automàtic",
        private: "Privat",
        status: {
            connecting: "Connectant...",
            joiningRoom: "Unint-se a la sala com a Professional...",
            online: "En línia. Participants:",
            patientConnected: "Pacient connectat",
            error: "Error:",
            disconnected: "Desconnectat",
            mediaError: "Error accedint a càmera/micròfon"
        },
        toasts: {
            sessionStarted: "Sessió Iniciada",
            sessionStartedDesc: "El cronòmetre ha començat.",
            sessionEnded: "Sessió Finalitzada",
            sessionEndedDesc: "Informe d'IA generant-se...",
            error: "Error",
            errorLoadSession: "No s'ha pogut carregar la sessió",
            errorStartSession: "No s'ha pogut iniciar la sessió",
            errorEndSession: "No s'ha pogut finalitzar la sessió"
        },
        confirmEnd: "Finalitzar sessió i tornar al detall?"
    },
    en: {
        loading: "Loading session...",
        sessionExpired: "Session Expired",
        loginButton: "Log In",
        videoconf: "Video Call",
        startSession: "Start Session",
        finishSession: "Finish",
        record: "Record",
        recording: "RECORDING",
        stop: "Stop",
        waitingAudio: "Waiting for audio...",
        waitingVideo: "Waiting for patient's video...",
        connectionGood: "Connection: Good",
        connectionFair: "Connection: Fair",
        connectionBad: "Connection: Poor",
        transcriptionTab: "Transcription",
        notesTab: "Private Notes",
        transcriptionPlaceholder: "Transcription will appear here...",
        notesPlaceholder: "Write your clinical notes here...",
        autoSaved: "Auto-saved",
        private: "Private",
        status: {
            connecting: "Connecting...",
            joiningRoom: "Joining room as Professional...",
            online: "Online. Peers:",
            patientConnected: "Patient connected",
            error: "Error:",
            disconnected: "Disconnected",
            mediaError: "Error accessing camera/microphone"
        },
        toasts: {
            sessionStarted: "Session Started",
            sessionStartedDesc: "Timer has started.",
            sessionEnded: "Session Ended",
            sessionEndedDesc: "AI report generating...",
            error: "Error",
            errorLoadSession: "Could not load session",
            errorStartSession: "Could not start session",
            errorEndSession: "Could not end session"
        },
        confirmEnd: "End session and return to details?"
    }
};

// Add translations to each language file
['es', 'ca', 'en'].forEach(lang => {
    const filePath = path.join(__dirname, 'messages', `${lang}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.ProfessionalVideoCall = professionalVideoCallTranslations[lang];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
    console.log(`Updated ${lang}.json with ProfessionalVideoCall translations`);
});

console.log('All translation files updated successfully!');
