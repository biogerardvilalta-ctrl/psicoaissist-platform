const fs = require('fs');
const path = require('path');

const locales = ['es', 'en', 'ca'];
const messagesDir = path.join(__dirname, 'messages');

const newKeys = {
    Legal: {
        Terms: {
            title: {
                es: "Términos y Condiciones de Uso",
                en: "Terms and Conditions of Use",
                ca: "Termes i Condicions d'Ús"
            },
            subtitle: {
                es: "Acuerdo de servicio para profesionales de la salud mental",
                en: "Service agreement for mental health professionals",
                ca: "Acord de servei per a professionals de la salut mental"
            },
            cardTitle: {
                es: "Relación Contractual",
                en: "Contractual Relationship",
                ca: "Relació Contractual"
            },
            sections: {
                nature: {
                    title: { es: "1. Naturaleza del Servicio", en: "1. Nature of Service", ca: "1. Naturalesa del Servei" },
                    text: {
                        es: "Esta aplicación es una <b>herramienta de apoyo a la decisión clínica</b> basada en Inteligencia Artificial. Su objetivo es asistir al profesional en la gestión de sesiones y la generación de borradores documentales.",
                        en: "This application is an Artificial Intelligence-based <b>clinical decision support tool</b>. Its goal is to assist the professional in session management and document draft generation.",
                        ca: "Aquesta aplicació és una <b>eina de suport a la decisió clínica</b> basada en Intel·ligència Artificial. El seu objectiu és assistir al professional en la gestió de sessions i la generació d'esborranys documentals."
                    },
                    warning: {
                        es: "La herramienta NO sustituye el criterio profesional, ni realiza diagnósticos automáticos, ni prescribe tratamientos médicos o farmacológicos.",
                        en: "The tool DOES NOT replace professional judgment, nor does it perform automated diagnoses, nor dictate medical or pharmacological treatments.",
                        ca: "L'eina NO substitueix el criteri professional, ni realitza diagnòstics automàtics, ni prescriu tractaments mèdics o farmacològics."
                    }
                },
                responsibility: {
                    title: { es: "2. Responsabilidad del Profesional", en: "2. Professional Responsibility", ca: "2. Responsabilitat del Professional" },
                    text: { es: "El usuario (profesional de la salud mental acreditado/a) reconoce y acepta que:", en: "The user (accredited mental health professional) acknowledges and accepts that:", ca: "L'usuari (professional de la salut mental acreditat/da) reconeix i accepta que:" },
                    list: {
                        1: { es: "Es el único responsable de verificar la información generada por la IA antes de utilizarla o incluirla en la historia clínica.", en: "They are solely responsible for verifying AI-generated information before using it or including it in clinical records.", ca: "És l'únic responsable de verificar la informació generada per la IA abans d'utilitzar-la o incloure-la a la història clínica." },
                        2: { es: "Es responsable de obtener el consentimiento informado de los pacientes para el uso de herramientas de apoyo a la sesión.", en: "They are responsible for obtaining informed consent from patients for the use of session support tools.", ca: "És responsable d'obtenir el consentiment informat dels pacients per a l'ús d'eines de suport a la sessió." },
                        3: { es: "Mantiene la responsabilidad final sobre cualquier decisión clínica tomada respecto a sus pacientes.", en: "They maintain final responsibility for any clinical decision made regarding their patients.", ca: "Manté la responsabilitat final sobre qualsevol decisió clínica presa respecte als seus pacients." }
                    }
                },
                ownership: {
                    title: { es: "3. Propiedad de los Datos", en: "3. Data Ownership", ca: "3. Propietat de les Dades" },
                    text: {
                        es: "Todos los datos clínicos, notas de sesión e información de los pacientes introducida en la plataforma son <b>propiedad exclusiva del profesional y/o del paciente</b>, según corresponda. La plataforma actúa como encargada del tratamiento, limitándose a custodiar y procesar la información según las instrucciones del usuario.",
                        en: "All clinical data, session notes, and patient information entered into the platform are the <b>exclusive property of the professional and/or the patient</b>, as applicable. The platform acts as a data processor, limited to safeguarding and processing information according to user instructions.",
                        ca: "Totes les dades clíniques, notes de sessió i informació dels pacients introduïda a la plataforma són <b>propietat exclusiva del professional i/o del pacient</b>, segons correspongui. La plataforma actua com a encarregada del tractament, limitant-se a custodiar i processar la informació segons les instruccions de l'usuari."
                    }
                },
                usage: {
                    title: { es: "4. Uso Aceptable", en: "4. Acceptable Use", ca: "4. Ús Acceptable" },
                    text: { es: "El usuario se compromete a hacer un uso ético de la plataforma, respetando el Código Deontológico de la profesión y la normativa vigente. Queda prohibido utilizar el sistema para fines ilícitos, discriminatorios o que atenten contra la dignidad de las personas.", en: "The user commits to ethical use of the platform, respecting the profession's Code of Ethics and current regulations. Using the system for illicit, discriminatory purposes or those that violate human dignity is prohibited.", ca: "L'usuari es compromet a fer un ús ètic de la plataforma, respectant el Codi Deontològic de la professió i la normativa vigent. Queda prohibit utilitzar el sistema per a fins il·lícits, discriminatoris o que atemptin contra la dignitat de les persones." }
                },
                ethics: {
                    title: { es: "5. Límites Éticos y Profesionales", en: "5. Ethical and Professional Limits", ca: "5. Límits Ètics i Professionals" },
                    intro: { es: "El uso de la plataforma está sujeto a los siguientes límites éticos inquebrantables, alineados con la normativa deontológica vigente:", en: "Platform use is subject to the following unbreakable ethical limits, aligned with current deontological regulations:", ca: "L'ús de la plataforma està subjecte als següents límits ètics inquebrantables, alineats amb la normativa deontològica vigent:" },
                    alerts: {
                        diagnosis: {
                            title: { es: "PROHIBICIÓN DE DIAGNÓSTICO AUTOMATIZADO", en: "AUTOMATED DIAGNOSIS PROHIBITION", ca: "PROHIBICIÓ DE DIAGNÒSTIC AUTOMATITZAT" },
                            text: { es: "Queda estrictamente prohibido utilizar las salidas de la IA como diagnósticos clínicos definitivos. La IA es una herramienta de apoyo orientativo; el diagnóstico es acto exclusivo del profesional humano.", en: "Using AI outputs as definitive clinical diagnoses is strictly prohibited. AI is a guidance support tool; diagnosis is an act exclusive to the human professional.", ca: "Queda estrictament prohibit utilitzar les sortides de la IA com a diagnòstics clínics definitius. La IA és una eina de suport orientatiu; el diagnòstic és acte exclusiu del professional humà." }
                        },
                        emergency: {
                            title: { es: "DEBER DE EMERGENCIA", en: "DUTY OF EMERGENCY", ca: "DEURE D'EMERGÈNCIA" },
                            text: { es: "La aplicación NO es un dispositivo de emergencia ni de intervención en crisis. En situaciones de riesgo inminente de suicidio o daño a terceros, el profesional debe actuar según los protocolos de emergencia convencionales, sin depender del procesamiento de la herramienta.", en: "The application IS NOT an emergency or crisis intervention device. In situations of imminent risk of suicide or harm to others, the professional must act according to conventional emergency protocols, without relying on tool processing.", ca: "L'aplicació NO és un dispositiu d'emergència ni d'intervenció en crisi. En situacions de risc imminent de suïcidi o dany a tercers, el professional ha d'actuar segons els protocols d'emergència convencionals, sense dependre del processament de l'eina." }
                        },
                        transparency: {
                            title: { es: "TRANSPARENCIA CON EL PACIENTE", en: "TRANSPARENCY WITH THE PATIENT", ca: "TRANSPARÈNCIA AMB EL PACIENT" },
                            text: { es: "Es obligación ética del profesional informar al paciente sobre el uso de herramientas tecnológicas de apoyo durante la sesión y garantizar que este uso no interfiere en la calidad de la alianza terapéutica.", en: "It is the professional's ethical obligation to inform the patient about the use of technological support tools during the session and guarantee that this use does not interfere with the quality of the therapeutic alliance.", ca: "És obligació ètica del professional informar el pacient sobre l'ús d'eines tecnològiques de suport durant la sessió i garantir que aquest ús no interfereix en la qualitat de l'aliança terapèutica." }
                        }
                    }
                },
                fairUse: {
                    title: { es: "6. Política de Uso Razonable (Fair Use Policy)", en: "6. Fair Use Policy", ca: "6. Política d'Ús Raonable (Fair Use Policy)" },
                    text: { es: "Para garantizar la estabilidad del sistema y la calidad del servicio para todos los usuarios, los planes con características 'Ilimitadas' están sujetos a los siguientes topes de seguridad mensual:", en: "To ensure system stability and service quality for all users, plans with 'Unlimited' features are subject to the following monthly security caps:", ca: "Per garantir l'estabilitat del sistema i la qualitat del servei per a tots els usuaris, els plans amb característiques 'Il·limitades' estan subjectes als següents topalls de seguretat mensual:" },
                    stats: {
                        activePatients: { label: { es: "Pacientes Activos", en: "Active Patients", ca: "Pacients Actius" }, unit: { es: "expedientes", en: "files", ca: "expedients" } },
                        transcription: { label: { es: "Transcripción IA", en: "AI Transcription", ca: "Transcripció IA" }, unit: { es: "horas/mes", en: "hours/mo", ca: "hores/mes" } },
                        reports: { label: { es: "Generación Informes", en: "Report Generation", ca: "Generació Informes" }, unit: { es: "informes/mes", en: "reports/mo", ca: "informes/mes" } },
                        simulator: { label: { es: "Simulador Clínico", en: "Clinical Simulator", ca: "Simulador Clínic" }, unit: { es: "casos/mes", en: "cases/mo", ca: "casos/mes" }, note: { es: "Máx 45 min/sesión", en: "Max 45 min/session", ca: "Màx 45 min/sessió" } }
                    },
                    warning: { es: "* El uso por encima de estos límites se considera abusivo y puede conllevar la suspensión temporal de la cuenta o contacto por parte de soporte.", en: "* Use exceeding these limits is considered abusive and may result in temporary account suspension or support contact.", ca: "* L'ús per sobre d'aquests límits es considera abusiu i pot comportar la suspensió temporal del compte o contacte per part de suport." }
                },
                plans: {
                    title: { es: "7. Planes de Suscripción y Características", en: "7. Subscription Plans and Features", ca: "7. Plans de Subscripció i Característiques" },
                    intro: { es: "A continuación se detallan los planes disponibles y sus características contractuales. Los precios pueden estar sujetos a impuestos aplicables.", en: "Below are the available plans and their contractual features. Prices may be subject to applicable taxes.", ca: "A continuació es detallen els plans disponibles i les seves característiques contractuals. Els preus poden estar subjectes a impostos aplicables." },
                    policy: { es: "<b>Política de Reinicio Mensual:</b> Todas las cuotas incluidas en los planes (minutos de transcripción, casos de simulador, etc.) se reinician automáticamente al inicio de cada ciclo de facturación mensual. <u>Los recursos no utilizados durante el mes en curso no son acumulables para el mes siguiente.</u>", en: "<b>Monthly Reset Policy:</b> All quotas included in plans (transcription minutes, simulator cases, etc.) reset automatically at the start of each billing cycle. <u>Unused resources during the current month do not roll over to the next month.</u>", ca: "<b>Política de Reinici Mensual:</b> Totes les quotes incloses als plans (minuts de transcripció, casos de simulador, etc.) es reinicien automàticament a l'inici de cada cicle de facturació mensual. <u>Els recursos no utilitzats durant el mes en curs no són acumulables per al mes següent.</u>" },
                    items: {
                        demo: { title: "Demo", subtitle: { es: "Gratuito / Limitada", en: "Free / Limited", ca: "Gratuït / Limitada" }, badge: { es: "Prueba 14 días", en: "14-day Trial", ca: "Prova 14 dies" }, includes: { title: { es: "Incluye:", en: "Includes:", ca: "Inclou:" }, list: [{ es: "3 Pacientes Activos máximo", en: "3 Active Patients max", ca: "3 Pacients Actius màxim" }, { es: "30 Minutos Transcripción + IA (Prueba)", en: "30 Min Transcription + AI (Trial)", ca: "30 Minuts Transcripció + IA (Prova)" }, { es: "5 Informes mensuales", en: "5 Reports monthly", ca: "5 Informes mensuals" }, { es: "Acceso básico a la plataforma", en: "Basic platform access", ca: "Accés bàsic a la plataforma" }] }, excludes: { title: { es: "Limitaciones:", en: "Limitations:", ca: "Limitacions:" }, list: [{ es: "Sin Simulador Clínico", en: "No Clinical Simulator", ca: "Sense Simulador Clínic" }, { es: "Caducidad automática a los 14 días", en: "Auto-expiry after 14 days", ca: "Caducitat automàtica als 14 dies" }, { es: "Sin sincronización de calendario", en: "No calendar sync", ca: "Sense sincronització de calendari" }, { es: "Sin soporte personalizado", en: "No personal support", ca: "Sense suport personalitzat" }] } },
                        basic: { title: "Basic", price: { es: "29€ / mes", en: "29€ / mo", ca: "29€ / mes" }, includes: { list: [{ es: "25 Pacientes Activos totales", en: "25 Total Active Patients", ca: "25 Pacients Actius totals" }, { es: "10 Horas Transcripción (Literal)", en: "10 Hours Transcription (Literal)", ca: "10 Hores Transcripció (Literal)" }, { es: "Almacenamiento 5GB", en: "5GB Storage", ca: "Emmagatzematge 5GB" }, { es: "Gestión de Citas Básica", en: "Basic Appointment Mgmt", ca: "Gestió de Cites Bàsica" }] }, excludes: { list: [{ es: "Análisis IA Avanzado", en: "Advanced AI Analysis", ca: "Anàlisi IA Avançat" }, { es: "Simulador Clínico", en: "Clinical Simulator", ca: "Simulador Clínic" }, { es: "Google Calendar Sync", en: "Google Calendar Sync", ca: "Google Calendar Sync" }, { es: "Soporte Prioritario", en: "Priority Support", ca: "Suport Prioritari" }] } },
                        pro: { title: "Pro", price: { es: "59€ / mes", en: "59€ / mo", ca: "59€ / mes" }, includes: { list: [{ es: "Pacientes Ilimitados", en: "Unlimited Patients", ca: "Pacients Il·limitats" }, { es: "15 Horas (900 min) IA Total", en: "15 Hours (900 min) Total AI", ca: "15 Hores (900 min) IA Total" }, { es: "Google Calendar Sync (Bidireccional)", en: "Google Calendar Sync (Bi-directional)", ca: "Google Calendar Sync (Bidireccional)" }, { es: "Análisis IA Avanzado (Insights)", en: "Advanced AI Analysis (Insights)", ca: "Anàlisi IA Avançat (Insights)" }, { es: "Almacenamiento 50GB", en: "50GB Storage", ca: "Emmagatzematge 50GB" }, { es: "Simulador (5 casos/mes)", en: "Simulator (5 cases/mo)", ca: "Simulador (5 casos/mes)" }] }, excludes: { list: [{ es: "Simulador Ilimitado", en: "Unlimited Simulator", ca: "Simulador Il·limitat" }, { es: "Branding Personalizado (Logo)", en: "Custom Branding (Logo)", ca: "Branding Personalitzat (Logo)" }, { es: "Videollamada de Soporte", en: "Support Video Call", ca: "Videotrucada de Suport" }] } },
                        premium: { title: "Premium", price: { es: "99€ / mes", en: "99€ / mo", ca: "99€ / mes" }, includes: { list: [{ es: "50 Horas (3.000 min) IA", en: "50 Hours (3,000 min) AI", ca: "50 Hores (3.000 min) IA" }, { es: "Simulador Ilimitado", en: "Unlimited Simulator", ca: "Simulador Il·limitat" }, { es: "Branding Personalizado", en: "Custom Branding", ca: "Branding Personalitzat" }, { es: "Soporte Prioritario + Videollamada", en: "Priority Support + Video Call", ca: "Suport Prioritari + Videotrucada" }, { es: "Almacenamiento 1TB", en: "1TB Storage", ca: "Emmagatzematge 1TB" }] }, excludes: { list: [{ es: "Gestión de Equipos (Multi-usuario)", en: "Team Management (Multi-user)", ca: "Gestió d'Equips (Multi-usuari)" }, { es: "API / Integración HIS", en: "API / HIS Integration", ca: "API / Integració HIS" }] } },
                        clinics: { title: { es: "Para Centros de Salud, Universidades y Hospitales", en: "For Health Centers, Universities and Hospitals", ca: "Per a Centres de Salut, Universitats i Hospitals" }, consult: { es: "Consultar", en: "Contact Us", ca: "Consultar" }, includes: [{ es: "Usuarios ilimitados", en: "Unlimited Users", ca: "Usuaris il·limitats" }, { es: "Simulador Clínico (casos/mes a medida)", en: "Clinical Simulator (custom cases/mo)", ca: "Simulador Clínic (casos/mes a mida)" }, { es: "API / HIS & Compliance", en: "API / HIS & Compliance", ca: "API / HIS & Compliance" }, { es: "SLA Garantizado", en: "Guaranteed SLA", ca: "SLA Garantit" }] }
                    },
                    extras: {
                        title: { es: "Servicios Adicionales (Extras)", en: "Additional Services (Extras)", ca: "Serveis Addicionals (Extras)" },
                        items: {
                            agenda: { title: "Agenda Manager", price: "15€ / mes", desc: { es: "Usuario administrativo adicional para gestión de citas. Sin acceso a historias clínicas.", en: "Additional administrative user for appointment management. No access to clinical records.", ca: "Usuari administratiu addicional per a gestió de cites. Sense accés a històries clíniques." } },
                            aiPack: { title: { es: "Pack Minutos IA", en: "AI Minutes Pack", ca: "Pack Minuts IA" }, price: "15€ / pack", desc: { es: "500 minutos adicionales de procesamiento IA. Pago único, no caducan mientras la suscripción esté activa.", en: "500 additional AI processing minutes. One-time payment, do not expire while subscription is active.", ca: "500 minuts addicionals de processament IA. Pagament únic, no caduquen mentre la subscripció estigui activa." } },
                            onboarding: { title: { es: "Onboarding Asistido", en: "Assisted Onboarding", ca: "Onboarding Assistit" }, price: { es: "50€ (pago único)", en: "50€ (one-time)", ca: "50€ (pagament únic)" }, desc: { es: "Sesión de 45 min con un especialista para configuración inicial e importación de datos.", en: "45 min session with a specialist for initial setup and data import.", ca: "Sessió de 45 min amb un especialista per a configuració inicial i importació de dades." } },
                            simPack: { title: { es: "Pack Simulador", en: "Simulator Pack", ca: "Pack Simulador" }, price: "15€ / pack", desc: { es: "Pack de 10 casos clínicos interactivos adicionales para práctica. Incluye feedback detallado de la IA.", en: "Pack of 10 additional interactive clinical cases for practice. Includes detailed AI feedback.", ca: "Pack de 10 casos clínics interactius addicionals per a pràctica. Inclou feedback detallat de la IA." } }
                        }
                    }
                },
                liability: {
                    title: { es: "8. Limitación de Responsabilidad", en: "8. Limitation of Liability", ca: "8. Limitació de Responsabilitat" },
                    text: { es: "La plataforma no se hace responsable de posibles errores en la transcripción o en las sugerencias de la IA, dado que se trata de una tecnología probabilística. La verificación humana es indispensable en todos los casos.", en: "The platform is not responsible for possible errors in transcription or AI suggestions, as it is a probabilistic technology. Human verification is indispensable in all cases.", ca: "La plataforma no es fa responsable de possibles errors en la transcripció o en els suggeriments de la IA, atès que es tracta d'una tecnologia probabilística. La verificació humana és indispensable en tots els casos." }
                },
                footer: {
                    text: { es: "Última actualización: Diciembre 2025", en: "Last update: December 2025", ca: "Última actualització: Desembre 2025" }
                }
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

        const localeKeys = { Legal: { Terms: {} } };

        // Helper to extract specific locale strings from newKeys structure
        const extractLocale = (source, target, loc) => {
            for (const key in source) {
                if (typeof source[key] === 'object' && !source[key][loc] && !Array.isArray(source[key])) {
                    target[key] = {};
                    extractLocale(source[key], target[key], loc);
                } else if (typeof source[key] === 'object' && source[key][loc]) {
                    target[key] = source[key][loc];
                } else if (Array.isArray(source[key])) {
                    // Handle arrays of localized objects
                    target[key] = source[key].map(item => {
                        if (typeof item === 'object' && item[loc]) return item[loc]; // Simple localized string
                        // Recursive for objects inside arrays? Not needed for this specific structure mostly
                        // But for our 'items' lists which are array of objects with locales, we need to map them.
                        // Wait, in my structure above: includes.list is array of objects {es, en, ca}.
                        if (item[loc]) return item[loc];
                        return item;
                    });
                }
            }
        };

        extractLocale(newKeys.Legal.Terms, localeKeys.Legal.Terms, locale);

        console.log(`Merging keys for ${locale}...`);
        deepMerge(content, localeKeys);

        fs.writeFileSync(filePath, JSON.stringify(content, null, 4));
        console.log(`Updated ${locale}.json`);

    } catch (error) {
        console.error(`Error updating ${locale}.json:`, error);
    }
});
