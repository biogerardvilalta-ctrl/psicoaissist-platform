const fs = require('fs');
const path = require('path');

const locales = ['es', 'en', 'ca'];
const messagesDir = path.join(__dirname, 'messages');

const newKeys = {
    Dashboard: {
        HelpWidget: {
            placeholder: {
                es: "Pregunta algo...",
                en: "Ask something...",
                ca: "Pregunta alguna cosa..."
            },
            title: {
                es: "Asistente PsicoAIssist",
                en: "PsicoAIssist Assistant",
                ca: "Assistent PsicoAIssist"
            },
            welcome: {
                es: "¡Hola! Soy tu asistente de PsicoAIssist. ¿En qué puedo ayudarte hoy?",
                en: "Hello! I am your PsicoAIssist assistant. How can I help you today?",
                ca: "Hola! Sóc el teu assistent de PsicoAIssist. En què et puc ajudar avui?"
            },
            error: {
                es: "Lo siento, tuve un problema de conexión. Inténtalo de nuevo.",
                en: "Sorry, I had a connection problem. Please try again.",
                ca: "Ho sento, he tingut un problema de connexió. Torna-ho a provar."
            },
            disclaimer: {
                es: "La IA puede cometer errores. Verifica la info importante.",
                en: "AI can make mistakes. Verify important info.",
                ca: "La IA pot cometre errors. Verifica la informació important."
            },
            openLabel: {
                es: "Abrir asistente de ayuda",
                en: "Open help assistant",
                ca: "Obrir assistent d'ajuda"
            }
        },
        AiAssistant: {
            title: {
                es: "Asistente IA",
                en: "AI Assistant",
                ca: "Assistent IA"
            },
            limitReached: {
                es: "Límite alcanzado",
                en: "Limit reached",
                ca: "Límit assolit"
            },
            status: {
                live: {
                    es: "En vivo",
                    en: "Live",
                    ca: "En viu"
                },
                offline: {
                    es: "Desconectado",
                    en: "Offline",
                    ca: "Desconnectat"
                }
            },
            plan: {
                basic: {
                    es: "Plan Básico",
                    en: "Basic Plan",
                    ca: "Pla Bàsic"
                }
            },
            subtitle: {
                es: "Análisis en tiempo real • 100% Privado",
                en: "Real-time analysis • 100% Private",
                ca: "Anàlisi en temps real • 100% Privat"
            },
            limitWarning: {
                es: "Has consumido tus minutos de IA. La asistencia en vivo se ha detenido, pero puedes seguir tomando notas.",
                en: "You have used up your AI minutes. Live assistance has stopped, but you can continue taking notes.",
                ca: "Has consumit els teus minuts d'IA. L'assistència en viu s'ha aturat, però pots seguir prenent notes."
            },
            sections: {
                observations: {
                    es: "Observaciones",
                    en: "Observations",
                    ca: "Observacions"
                },
                questions: {
                    es: "Preguntas Sugeridas",
                    en: "Suggested Questions",
                    ca: "Preguntes Suggerides"
                },
                considerations: {
                    es: "Consideraciones",
                    en: "Considerations",
                    ca: "Consideracions"
                }
            },
            listening: {
                title: {
                    es: "Escuchando la sesión...",
                    en: "Listening to session...",
                    ca: "Escoltant la sessió..."
                },
                subtitle: {
                    es: "Habla o escribe para recibir sugerencias",
                    en: "Speak or type to receive suggestions",
                    ca: "Parla o escriu per rebre suggeriments"
                }
            },
            actions: {
                addToNotes: {
                    es: "Añadir a notas",
                    en: "Add to notes",
                    ca: "Afegir a notes"
                },
                newSuggestions: {
                    es: "Nuevas sugerencias disponibles",
                    en: "New suggestions available",
                    ca: "Noves suggerències disponibles"
                }
            },
            footer: {
                es: "Asistencia IA © 2025 • PsicoAIssist",
                en: "AI Assistance © 2025 • PsicoAIssist",
                ca: "Assistència IA © 2025 • PsicoAIssist"
            }
        }
    }
};

function deepMerge(target, source) {
    for (const key in source) {
        if (source[key] instanceof Object && key in target) {
            Object.assign(source[key], deepMerge(target[key], source[key]));
        }
    }
    Object.assign(target || {}, source);
    return target;
}

locales.forEach(locale => {
    const filePath = path.join(messagesDir, `${locale}.json`);

    try {
        let content = {};
        if (fs.existsSync(filePath)) {
            content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        const localeKeys = { Dashboard: { HelpWidget: {}, AiAssistant: {} } };

        // Helper to extract specific locale strings from newKeys structure
        const extractLocale = (source, target, loc) => {
            for (const key in source) {
                if (typeof source[key] === 'object' && !source[key][loc] && !source[key]['es']) {
                    target[key] = {};
                    extractLocale(source[key], target[key], loc);
                } else if (typeof source[key] === 'object' && source[key][loc]) {
                    target[key] = source[key][loc];
                }
            }
        };

        // Extract HelpWidget keys
        extractLocale(newKeys.Dashboard.HelpWidget, localeKeys.Dashboard.HelpWidget, locale);
        // Extract AiAssistant keys
        extractLocale(newKeys.Dashboard.AiAssistant, localeKeys.Dashboard.AiAssistant, locale);

        console.log(`Merging keys for ${locale}...`);
        deepMerge(content, localeKeys);

        fs.writeFileSync(filePath, JSON.stringify(content, null, 4));
        console.log(`Updated ${locale}.json`);

    } catch (error) {
        console.error(`Error updating ${locale}.json:`, error);
    }
});
