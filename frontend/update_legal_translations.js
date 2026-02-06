const fs = require('fs');
const path = require('path');

const files = {
    es: 'messages/es.json',
    en: 'messages/en.json',
    ca: 'messages/ca.json'
};

const legalData = {
    es: {
        Cookies: {
            title: "Política de Cookies",
            subtitle: "Información sobre el uso de cookies y tecnologías similares",
            sections: {
                what: {
                    title: "1. ¿Qué son las cookies?",
                    text: "Una cookie es un pequeño archivo de texto que se almacena en su navegador cuando visita casi cualquier página web. Su utilidad es que la web sea capaz de recordar su visita cuando vuelva a navegar por esa página."
                },
                used: {
                    title: "2. Cookies que utiliza este sitio web",
                    text: "Esta aplicación utiliza exclusivamente <b>cookies técnicas y de sesión</b> necesarias para el funcionamiento del servicio.",
                    types: {
                        auth: { title: "Cookies de autenticación", text: "Se utilizan para identificar al usuario una vez ha iniciado sesión, permitiendo el acceso a las áreas privadas y asegurando que la sesión se mantiene activa de manera segura." },
                        pref: { title: "Cookies de preferencias", text: "Almacenan preferencias de la interfaz de usuario (como el idioma o el tamaño de la fuente) para personalizar su experiencia." },
                        sec: { title: "Cookies de seguridad", text: "Ayudan a prevenir ataques de seguridad y proteger los datos del usuario contra accesos no autorizados." }
                    }
                },
                third: {
                    title: "3. Cookies de terceros",
                    text: "Actualmente, <b>no utilizamos cookies publicitarias ni de seguimiento</b> de terceros (como Google Analytics o Facebook Pixel) dentro del área privada de la aplicación. La privacidad del profesional y del paciente es prioritaria."
                },
                deactivate: {
                    title: "4. ¿Cómo desactivar las cookies?",
                    text: "Puede restringir, bloquear o borrar las cookies del navegador en cualquier momento. Consulte la ayuda de su navegador para saber cómo hacerlo. Tenga en cuenta que desactivar las cookies técnicas podría impedir el correcto funcionamiento de la aplicación."
                }
            },
            cardTitle: "Uso de Cookies"
        },
        GDPR: {
            title: "Política de Privacidad y RGPD",
            subtitle: "Compromiso con la protección de datos personales y sensibles",
            cardTitle: "Tratamiento de Datos Personales",
            update: "Última actualización: 12 de diciembre de 2025",
            sections: {
                controller: {
                    title: "1. Responsable del Tratamiento",
                    text: "El responsable del tratamiento de los datos es <b>PsicoAIssist</b>. Nos comprometemos a tratar los datos de los pacientes y profesionales con la máxima confidencialidad, de acuerdo con el Reglamento (UE) 2016/679 (RGPD)."
                },
                info: {
                    title: "2. Información que Recopilamos",
                    sub1: { title: "2.1 Datos Personales", text: "Recopilamos información que usted nos proporciona directamente, incluyendo:", list: ["Nombre completo y información de contacto", "Número de colegiado profesional", "Especialidad médica", "Información de facturación y pago"] },
                    sub2: { title: "2.2 Datos Clínicos", text: "Los datos clínicos de pacientes se procesan bajo estrictas medidas de seguridad:", list: ["Transcripciones de sesiones (encriptadas efímeramente)", "Notas clínicas", "Informes generados", "Archivos de audio (opcional, encriptados)"] }
                },
                purpose: {
                    title: "3. Finalidad del Tratamiento",
                    text: "Utilizamos la información recopilada para:",
                    list: [
                        "Proporcionar servicios de transcripción e IA (generar informes, análisis).",
                        "Gestionar el historial clínico y la agenda del profesional.",
                        "Procesar pagos y gestionar suscripciones.",
                        "Proporcionar soporte técnico y mejorar nuestros algoritmos (con datos anonimizados)."
                    ],
                    note: "<b>No utilizamos los datos para fines publicitarios ni los cedemos a terceros</b> sin consentimiento explícito, excepto por obligación legal o proveedores de servicio bajo contrato de confidencialidad."
                },
                legal: {
                    title: "4. Base Legal del Tratamiento",
                    text: "Tratamos los datos bajo las siguientes bases legales del RGPD:",
                    list: [
                        "<b>Consentimiento:</b> Para funcionalidades opcionales.",
                        "<b>Ejecución contractual:</b> Para proporcionar nuestros servicios.",
                        "<b>Interés legítimo:</b> Para mejorar la calidad del servicio.",
                        "<b>Cumplimiento legal:</b> Para obligaciones regulatorias y fiscales."
                    ]
                },
                security: {
                    title: "5. Minimización y Seguridad (Protección de Datos)",
                    list: [
                        "<b>Minimización:</b> Las transcripciones de audio se procesan de manera efímera siempre que es posible.",
                        "<b>Encriptación:</b> AES-256 para datos en reposo y TLS 1.3 para datos en tránsito. Claves rotadas periódicamente.",
                        "<b>Control de Acceso:</b> Autenticación de dos factores, acceso basado en roles y logs de auditoría completos."
                    ],
                    alertTitle: "Nota Importante sobre IA",
                    alertText: "A pesar de las medidas de seguridad, recordamos que ningún sistema es invulnerable. El uso de inteligencia artificial implica el procesamiento de datos en servidores seguros. Garantizamos que no se utilizan datos de los pacientes para el entrenamiento de modelos públicos."
                },
                sharing: {
                    title: "6. Compartir Información",
                    text: "<b>No vendemos, alquilamos o compartimos</b> sus datos personales con terceros, excepto:",
                    list: ["Proveedores de servicios necesarios (bajo estrictos acuerdos de confidencialidad).", "Cuando sea requerido por ley.", "Con su consentimiento explícito."]
                },
                rights: {
                    title: "7. Derechos de los Interesados",
                    text: "Tanto profesionales como pacientes tienen derecho a:",
                    list: [
                        "<b>Acceso:</b> Obtener copias de sus datos.",
                        "<b>Rectificación:</b> Corregir datos inexactos.",
                        "<b>Supresión:</b> Solicitar la eliminación de sus datos (Derecho al olvido).",
                        "<b>Limitación:</b> Restringir el tratamiento.",
                        "<b>Oposición:</b> Oponerse al tratamiento.",
                        "<b>Portabilidad:</b> Recibir sus datos en formato estructurado."
                    ]
                },
                retention: {
                    title: "8. Retención de Datos",
                    list: [
                        "<b>Datos de cuenta:</b> Mientras se mantenga la cuenta activa. En caso de solicitar la baja, los datos se mantendrán bloqueados durante 30 días (periodo de gracia) antes de ser anonimizados permanentemente.",
                        "<b>Datos clínicos:</b> Según las regulaciones médicas aplicables.",
                        "<b>Datos de facturación:</b> 7 años (requisito fiscal).",
                        "<b>Logs de auditoría:</b> 3 años."
                    ]
                },
                transfers: {
                    title: "9. Transferencias Internacionales",
                    text: "Todos los datos se procesan y almacenan en servidores ubicados en la Unión Europea. No realizamos transferencias internacionales de datos fuera del Espacio Económico Europeo (EEE) sin las garantías adecuadas del RGPD."
                },
                contact: {
                    title: "10. Contacto",
                    text: "Para ejercer sus derechos o realizar consultas sobre privacidad:",
                    dpoTitle: "Delegado de Protección de Datos (DPO)",
                    email: "Email: suport@psicoaissist.com"
                },
                authority: {
                    title: "11. Autoridad de Control",
                    text: "Tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) si considera que el tratamiento de sus datos personales no cumple con la normativa vigente."
                }
            }
        }
    },
    en: {
        Cookies: {
            title: "Cookie Policy",
            subtitle: "Information about the use of cookies and similar technologies",
            sections: {
                what: {
                    title: "1. What are cookies?",
                    text: "A cookie is a small text file that is stored in your browser when you visit almost any webpage. Its utility is for the web to be able to remember your visit when you browse that page again."
                },
                used: {
                    title: "2. Cookies used by this website",
                    text: "This application exclusively uses <b>technical and session cookies</b> necessary for the operation of the service.",
                    types: {
                        auth: { title: "Authentication Cookies", text: "Used to identify the user once logged in, allowing access to private areas and ensuring the session remains active securely." },
                        pref: { title: "Preference Cookies", text: "Store user interface preferences (such as language or font size) to personalize your experience." },
                        sec: { title: "Security Cookies", text: "Help prevent security attacks and protect user data against unauthorized access." }
                    }
                },
                third: {
                    title: "3. Third-party Cookies",
                    text: "Currently, <b>we do not use advertising or tracking cookies</b> from third parties (such as Google Analytics or Facebook Pixel) within the private area of the application. The privacy of the professional and patient is a priority."
                },
                deactivate: {
                    title: "4. How to deactivate cookies?",
                    text: "You can restrict, block, or delete browser cookies at any time. Consult your browser's help to know how to do it. Please note that deactivating technical cookies could prevent the correct functioning of the application."
                }
            },
            cardTitle: "Use of Cookies"
        },
        GDPR: {
            title: "Privacy Policy and GDPR",
            subtitle: "Commitment to the protection of personal and sensitive data",
            cardTitle: "Personal Data Processing",
            update: "Last updated: December 12, 2025",
            sections: {
                controller: {
                    title: "1. Data Controller",
                    text: "The data controller is <b>PsicoAIssist</b>. We are committed to treating patient and professional data with maximum confidentiality, in accordance with Regulation (EU) 2016/679 (GDPR)."
                },
                info: {
                    title: "2. Information We Collect",
                    sub1: { title: "2.1 Personal Data", text: "We collect information that you provide directly to us, including:", list: ["Full name and contact information", "Professional license number", "Medical specialty", "Billing and payment information"] },
                    sub2: { title: "2.2 Clinical Data", text: "Patient clinical data is processed under strict security measures:", list: ["Session transcripts (ephemerally encrypted)", "Clinical notes", "Generated reports", "Audio files (optional, encrypted)"] }
                },
                purpose: {
                    title: "3. Purpose of Processing",
                    text: "We use the collected information to:",
                    list: [
                        "Provide transcription and AI services (generate reports, analysis).",
                        "Manage clinical history and professional agenda.",
                        "Process payments and manage subscriptions.",
                        "Provide technical support and improve our algorithms (with anonymized data)."
                    ],
                    note: "<b>We do not use data for advertising purposes nor do we cede it to third parties</b> without explicit consent, except for legal obligation or service providers under confidentiality agreement."
                },
                legal: {
                    title: "4. Legal Basis of Processing",
                    text: "We process data under the following GDPR legal bases:",
                    list: [
                        "<b>Consent:</b> For optional functionalities.",
                        "<b>Contractual execution:</b> To provide our services.",
                        "<b>Legitimate interest:</b> To improve service quality.",
                        "<b>Legal compliance:</b> For regulatory and fiscal obligations."
                    ]
                },
                security: {
                    title: "5. Minimization and Security (Data Protection)",
                    list: [
                        "<b>Minimization:</b> Audio transcripts are processed ephemerally whenever possible.",
                        "<b>Encryption:</b> AES-256 for data at rest and TLS 1.3 for data in transit. Keys rotated periodically.",
                        "<b>Access Control:</b> Two-factor authentication, role-based access, and complete audit logs."
                    ],
                    alertTitle: "Important Note on AI",
                    alertText: "Despite security measures, we remind you that no system is invulnerable. The use of artificial intelligence implies data processing on secure servers. We guarantee that patient data is not used for training public models."
                },
                sharing: {
                    title: "6. Sharing Information",
                    text: "<b>We do not sell, rent, or share</b> your personal data with third parties, except:",
                    list: ["Necessary service providers (under strict confidentiality agreements).", "When required by law.", "With your explicit consent."]
                },
                rights: {
                    title: "7. Rights of Data Subjects",
                    text: "Both professionals and patients have the right to:",
                    list: [
                        "<b>Access:</b> Obtain copies of their data.",
                        "<b>Rectification:</b> Correct inaccurate data.",
                        "<b>Erasure:</b> Request deletion of their data (Right to be forgotten).",
                        "<b>Limitation:</b> Restrict processing.",
                        "<b>Opposition:</b> Object to processing.",
                        "<b>Portability:</b> Receive their data in structured format."
                    ]
                },
                retention: {
                    title: "8. Data Retention",
                    list: [
                        "<b>Account data:</b> As long as the account remains active. In case of cancellation request, data will be kept blocked for 30 days (grace period) before being permanently anonymized.",
                        "<b>Clinical data:</b> According to applicable medical regulations.",
                        "<b>Billing data:</b> 7 years (fiscal requirement).",
                        "<b>Audit logs:</b> 3 years."
                    ]
                },
                transfers: {
                    title: "9. International Transfers",
                    text: "All data is processed and stored on servers located within the European Union. We do not perform international data transfers outside the European Economic Area (EEA) without adequate GDPR guarantees."
                },
                contact: {
                    title: "10. Contact",
                    text: "To exercise your rights or make privacy inquiries:",
                    dpoTitle: "Data Protection Officer (DPO)",
                    email: "Email: suport@psicoaissist.com"
                },
                authority: {
                    title: "11. Control Authority",
                    text: "You have the right to file a complaint with the Data Protection Authority if you consider that the processing of your personal data does not comply with current regulations."
                }
            }
        }
    },
    ca: {
        Cookies: {
            title: "Política de Cookies",
            subtitle: "Informació sobre l'ús de cookies i tecnologies similars",
            sections: {
                what: {
                    title: "1. Què són les cookies?",
                    text: "Una cookie és un petit fitxer de text que s'emmagatzema al vostre navegador quan visiteu gairebé qualsevol pàgina web. La seva utilitat és que la web sigui capaç de recordar la vostra visita quan torneu a navegar per aquesta pàgina."
                },
                used: {
                    title: "2. Cookies que utilitza aquest lloc web",
                    text: "Aquesta aplicació utilitza exclusivament <b>cookies tècniques i de sessió</b> necessàries pel funcionament del servei.",
                    types: {
                        auth: { title: "Cookies d'autenticació", text: "S'utilitzen per identificar l'usuari un cop ha iniciat sessió, permetent l'accés a les àrees privades i assegurant que la sessió es manté activa de manera segura." },
                        pref: { title: "Cookies de preferències", text: "Emmagatzemen preferències de la interfície d'usuari (com l'idioma o la mida de la font) per personalitzar la vostra experiència." },
                        sec: { title: "Cookies de seguretat", text: "Ajuden a prevenir atacs de seguretat i protegir les dades de l'usuari contra accessos no autoritzats." }
                    }
                },
                third: {
                    title: "3. Cookies de tercers",
                    text: "Actualment, <b>no utilitzem cookies publicitàries ni de seguiment</b> de tercers (com Google Analytics o Facebook Pixel) dins de l'àrea privada de l'aplicació. La privacitat del professional i del pacient és prioritària."
                },
                deactivate: {
                    title: "4. Com desactivar les cookies?",
                    text: "Podeu restringir, bloquejar o esborrar les cookies del navegador en qualsevol moment. Consulteu l'ajuda del vostre navegador per saber com fer-ho. Tingueu en compte que desactivar les cookies tècniques podria impedir el correcte funcionament de l'aplicació."
                }
            },
            cardTitle: "Ús de Cookies"
        },
        GDPR: {
            title: "Política de Privacitat i RGPD",
            subtitle: "Compromís amb la protecció de dades personals i sensibles",
            cardTitle: "Tractament de Dades Personals",
            update: "Última actualització: 12 de desembre de 2025",
            sections: {
                controller: {
                    title: "1. Responsable del Tractament",
                    text: "El responsable del tractament de les dades és <b>PsicoAIssist</b>. Ens comprometem a tractar les dades dels pacients i professionals amb la màxima confidencialitat, d'acord amb el Reglament (UE) 2016/679 (RGPD)."
                },
                info: {
                    title: "2. Informació que Recopilem",
                    sub1: { title: "2.1 Dades Personals", text: "Recopilem informació que vós ens proporcioneu directament, incloent:", list: ["Nom complet i informació de contacte", "Número de col·legiat professional", "Especialitat mèdica", "Informació de facturació i pagament"] },
                    sub2: { title: "2.2 Dades Clíniques", text: "Les dades clíniques de pacients es processen sota estrictes mesures de seguretat:", list: ["Transcripcions de sessions (xifrades efímerament)", "Notes clíniques", "Informes generats", "Arxius d'àudio (opcional, xifrats)"] }
                },
                purpose: {
                    title: "3. Finalitat del Tractament",
                    text: "Utilitzem la informació recopilada per a:",
                    list: [
                        "Proporcionar serveis de transcripció i IA (generar informes, anàlisi).",
                        "Gestionar l'historial clínic i l'agenda del professional.",
                        "Processar pagaments i gestionar subscripcions.",
                        "Proporcionar suport tècnic i millorar els nostres algorismes (amb dades anonimitzades)."
                    ],
                    note: "<b>No utilitzem les dades per a fins publicitaris ni les cedim a tercers</b> sense consentiment explícit, excepte per obligació legal o proveïdors de servei sota contracte de confidencialitat."
                },
                legal: {
                    title: "4. Base Legal del Tractament",
                    text: "Tractem les dades sota les següents bases legals del RGPD:",
                    list: [
                        "<b>Consentiment:</b> Per a funcionalitats opcionals.",
                        "<b>Execució contractual:</b> Per proporcionar els nostres serveis.",
                        "<b>Interès legítim:</b> Per millorar la qualitat del servei.",
                        "<b>Compliment legal:</b> Per a obligacions regulatòries i fiscals."
                    ]
                },
                security: {
                    title: "5. Minimització i Seguretat (Protecció de Dades)",
                    list: [
                        "<b>Minimització:</b> Les transcripcions d'àudio es processen de manera efímera sempre que és possible.",
                        "<b>Xifratge:</b> AES-256 per a dades en repòs i TLS 1.3 per a dades en trànsit. Claus rotades periòdicament.",
                        "<b>Control d'Accés:</b> Autenticació de dos factors, accés basat en rols i logs d'auditoria complets."
                    ],
                    alertTitle: "Nota Important sobre IA",
                    alertText: "Malgrat les mesures de seguretat, recordem que cap sistema és invulnerable. L'ús d'intel·ligència artificial implica el processament de dades en servidors segurs. Garantim que no s'utilitzen dades dels pacients per a l'entrenament de models públics."
                },
                sharing: {
                    title: "6. Compartir Informació",
                    text: "<b>No venem, lloguem o compartim</b> les vostres dades personals amb tercers, excepte:",
                    list: ["Proveïdors de serveis necessaris (sota estrictes acords de confidencialitat).", "Quan sigui requerit per llei.", "Amb el vostre consentiment explícit."]
                },
                rights: {
                    title: "7. Drets dels Interessats",
                    text: "Tant professionals com pacients tenen dret a:",
                    list: [
                        "<b>Accés:</b> Obtenir còpies de les seves dades.",
                        "<b>Rectificació:</b> Corregir dades inexactes.",
                        "<b>Supressió:</b> Sol·licitar l'eliminació de les seves dades (Dret a l'oblit).",
                        "<b>Limitació:</b> Restringir el tractament.",
                        "<b>Oposició:</b> Oposar-se al tractament.",
                        "<b>Portabilitat:</b> Rebre les seves dades en format estructurat."
                    ]
                },
                retention: {
                    title: "8. Retenció de Dades",
                    list: [
                        "<b>Dades de compte:</b> Mentre es mantingui el compte actiu. En cas de sol·licitar la baixa, les dades es mantindran bloquejades durant 30 dies (període de gràcia) abans de ser anonimitzades permanentment.",
                        "<b>Dades clíniques:</b> Segons les regulacions mèdiques aplicables.",
                        "<b>Dades de facturació:</b> 7 anys (requisit fiscal).",
                        "<b>Logs d'auditoria:</b> 3 anys."
                    ]
                },
                transfers: {
                    title: "9. Transferències Internacionals",
                    text: "Totes les dades es processen i emmagatzemen en servidors ubicats a la Unió Europea. No realitzem transferències internacionals de dades fora de l'Espai Econòmic Europeu (EEE) sense les garanties adequades del RGPD."
                },
                contact: {
                    title: "10. Contacte",
                    text: "Per exercir els vostres drets o realitzar consultes sobre privacitat:",
                    dpoTitle: "Delegat de Protecció de Dades (DPO)",
                    email: "Email: suport@psicoaissist.com"
                },
                authority: {
                    title: "11. Autoritat de Control",
                    text: "Teniu dret a presentar una reclamació davant l'Agència Espanyola de Protecció de Dades (AEPD) si considereu que el tractament de les vostres dades personals no compleix amb la normativa vigent."
                }
            }
        }
    }
};

Object.keys(files).forEach(lang => {
    try {
        const filePath = path.resolve(files[lang]);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Ensure Legal key exists
        content.Legal = content.Legal || {};

        // Merge Cookies and GDPR if present in data
        if (legalData[lang].Cookies) {
            content.Legal.Cookies = legalData[lang].Cookies;
        }
        if (legalData[lang].GDPR) {
            content.Legal.GDPR = legalData[lang].GDPR;
        }


        fs.writeFileSync(filePath, JSON.stringify(content, null, 4));
        console.log(`Updated ${lang} with Legal.Cookies and Legal.GDPR`);
    } catch (e) {
        console.error(`Error updating ${lang}:`, e);
    }
});
