const fs = require('fs');
const path = require('path');

const videoCallTranslations = {
    es: {
        status: {
            connecting: "Conectando...",
            joiningRoom: "Uniéndose a la sala...",
            connected: "Conectado. Participantes:",
            error: "Error:",
            disconnected: "Desconectado",
            mediaError: "Error al acceder a la cámara/micrófono"
        },
        waitingVideo: "Esperando video del profesional...",
        quality: {
            good: "Buena",
            fair: "Regular",
            bad: "Mala"
        }
    },
    ca: {
        status: {
            connecting: "Connectant...",
            joiningRoom: "Unint-se a la sala...",
            connected: "Connectat. Participants:",
            error: "Error:",
            disconnected: "Desconnectat",
            mediaError: "Error en accedir a la càmera/micròfon"
        },
        waitingVideo: "Esperant vídeo del professional...",
        quality: {
            good: "Bona",
            fair: "Regular",
            bad: "Dolenta"
        }
    },
    en: {
        status: {
            connecting: "Connecting...",
            joiningRoom: "Joining room...",
            connected: "Connected. Participants:",
            error: "Error:",
            disconnected: "Disconnected",
            mediaError: "Error accessing camera/microphone"
        },
        waitingVideo: "Waiting for professional's video...",
        quality: {
            good: "Good",
            fair: "Fair",
            bad: "Poor"
        }
    }
};

// Add translations to each language file
['es', 'ca', 'en'].forEach(lang => {
    const filePath = path.join(__dirname, 'messages', `${lang}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.VideoCall = videoCallTranslations[lang];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
    console.log(`Updated ${lang}.json with VideoCall translations`);
});

console.log('All translation files updated successfully!');
