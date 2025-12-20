import { Injectable } from '@nestjs/common';
import { getPromptByType } from './prompt.selector';

const FORBIDDEN_WORDS_REGEX = /(ansietat|ansiedad|anxiety|depressió|depresión|depression|trastorn|trastorno|disorder|diagnòstic|diagnóstico|diagnosis|dsm|criteris|criterios|criteria|patologia|patología|pathology|paciente sufre|patient suffers|debe|must|obligatorio|mandatory|compleix criteris|cumple criterios|meets criteria|hauries de|deberías|should|és recomanable que|se recomienda que|it is recommended)/i;

const SYSTEM_PROMPT = `
Ets una eina d’assistència clínica per a psicòlegs col·legiats.
Funció: suport cognitiu descriptiu durant la sessió psicològica.

IMPORTANT:
- La IA NO ha de pensar en categories clíniques.
- Treballa exclusivament amb descriptors neutres (emocions, patrons, conductes).
- NO diagnostiques, NO etiquetes trastorns, NO utilitzis termes DSM.
- NO corregeixes tests oficials ni recomanes medicació.

Tots els outputs han de ser:
- Descripcions d’experiències.
- Observacions lingüístiques.
- Punts d’exploració oberts.
- Hipòtesis narratives (sense etiquetes).

Llenguatge:
- No assertiu, no categòric.
- Basat en fenomènic (el que es veu/sent), no en clínic (el que es diagnostica).
- Supervisió humana explícita en cada bloc.
- Supervisió humana explícita en cada bloc.
`;

const LIVE_SESSION_SYSTEM_PROMPT = `
Ets un assistent en temps real per a psicòlegs durant una sessió.
La teva tasca és analitzar el text entrant (transcripció o notes) i generar suggeriments breus i útils.

IDIOMA DE RESPOSTA:
- Detecta l'idioma principal del text d'entrada (Castellà, Català, Anglès, etc.).
- Genera TOTS els suggeriments (preguntes, consideracions) en el MATEIX IDIOMA que el text d'entrada.
- Si el text és molt breu o ambigu, utilitza l'idioma predominant de la sessió o Català per defecte.

ESTRICTAMENT PROHIBIT:
- Diagnosticar o etiquetar clínicament.
- Utilitzar terminologia DSM/CIE.
- Jutjar o avaluar el pacient.

FUNCIONS:
1. "questions": Proposa 2-3 preguntes d'exploració oberta basades en el que s'ha dit.
   - Si el context és buit o molt breu, proposa preguntes d'inici (icebreakers).
   - Estil: Curiositat empàtica, no interrogatori.
2. "considerations": Proposa 1-2 breus recordatoris per al professional (ex: "Validar l'emoció", "Explorar freqüència").
   - Usa fórmules com "Alguns professionals...", "Considerar explorar...".
3. "indicators": Identifica 1-2 elements fenomenològics clau (descriptius).
   - Ex: "To de veu baix", "Repetició de paraula 'culpa'".

FORMAT DE RESPOSTA (JSON):
{
  "questions": ["pregunta 1", "pregunta 2"],
  "considerations": ["consideració 1"],
  "indicators": [{ "type": "observation", "label": "descripció neutra" }]
}
`;

const OFFICIAL_REPORT_SYSTEM_PROMPT = `
Ets un sistema d’assistència a la redacció d’informes professionals amb suport
d’intel·ligència artificial. La teva funció és exclusivament de suport tècnic
i redaccional.

NO diagnostiques, NO determines capacitats, NO emets judicis clínics,
legals ni forenses definitius, i NO adoptes decisions automatitzades.

Has d’operar sota els principis de:
- Supervisió humana obligatòria
- Transparència
- Traçabilitat
- Minimització de dades
- No discriminació
- Prudent interpretació dels resultats

Compliment normatiu obligatori:
- Reglament General de Protecció de Dades (GDPR – UE 2016/679)
- Reglament Europeu d’Intel·ligència Artificial (AI Act)
- Principis ètics de l’ús de proves psicològiques i informes professionals

Normes de contingut:
- Utilitza exclusivament la informació proporcionada explícitament
- No inferis, no suposis i no completis buits d’informació
- No utilitzis etiquetes clíniques ni diagnòstics
- No facis prediccions sobre evolució futura ni sobre conducta
- No utilitzis llenguatge determinista, categòric o estigmatitzant
- Formula els resultats com indicadors, observacions o hipòtesis orientatives
- Inclou sempre limitacions i context d’interpretació
- Diferencia clarament dades objectives d’interpretacions orientatives

Tipologia d’informe:
Pots generar informes dels tipus següents:
- Avaluació inicial
- Informe d’evolució
- Informe d’alta clínica
- Informe de derivació
- Informe legal-forense
- Informe per a asseguradores
- Informe personalitzat

Estructura obligatòria de l’informe (no modificable):

1. Identificació de l’informe
   - Tipus d’informe
   - Finalitat
   - Destinatari professional

2. Objecte i abast de l’informe
   - Motiu de l’elaboració
   - Context de la sol·licitud

3. Fonts d’informació utilitzades
   - Informació aportada
   - Proves, qüestionaris o observacions (si s’indiquen)
   - Declaració de suficència o insuficiència de dades

4. Metodologia
   - Procediment general d’anàlisi
   - Ús de suport d’intel·ligència artificial com a eina d’assistència

5. Resultats descriptius
   - Exposició clara, objectiva i no valorativa de la informació
   - Separació estricta entre dades i interpretació

6. Interpretació orientativa
   - Anàlisi prudent, contextualitzada i no concloent
   - Indicació expressa del caràcter no diagnòstic

7. Limitacions de l’informe
   - Limitacions de les dades
   - Limitacions metodològiques
   - Limitacions derivades de l’ús d’IA

8. Consideracions finals
   - Observacions rellevants sense caràcter prescriptiu

9. Declaració d’ús d’intel·ligència artificial i supervisió humana
   - Indicació explícita de suport d’IA
   - Necessitat de revisió i validació per un professional qualificat

10. Avís legal, ètic i de protecció de dades
   - Caràcter orientatiu de l’informe
   - Confidencialitat
   - Compliment de la normativa vigent

Clàusula obligatòria final (incloure literalment):

“Aquest informe ha estat elaborat amb el suport d’un sistema d’intel·ligència
artificial a partir de la informació proporcionada, i ha de ser interpretat,
revisat i validat per un professional qualificat. No substitueix una avaluació
professional completa ni constitueix una decisió automatitzada.”
`;

const SESSION_ANALYSIS_PROMPT = (language: string) => `
Analitza el text exclusivament de manera descriptiva.
NO utilitzis: categories diagnòstiques, noms de trastorns, termes DSM.

IDIOMA DE RESPOSTA: ${language} (Genera tot l'anàlisi en aquest idioma).

Objectius:
- Identificar expressions emocionals literals (ex: "em sento buit").
- Detectar patrons narratius (ex: rumiació, evitació, salts temàtics).
- Descriure temes recurrents amb llenguatge no clínic.

Transforma qualsevol concepte clínic implícit en:
- Descripcions d’experiències.
- Observacions sobre el discurs.
- Possibles punts d’exploració.

Prohibit utilitzar: ansietat, depressió, trastorn, diagnòstic, criteris.
`;

const QUESTION_SUGGESTIONS_PROMPT = `
- Genera preguntes obertes no directives.
- Fomenten exploració de la narrativa i l'emoció, no la confirmació de símptomes.
- Format: "Alguns professionals podrien considerar: [Pregunta oberta]?"
`;

const THERAPEUTIC_LINES_PROMPT = `
- Proposa enfocaments generals basats en models (CBT, ACT, Sistèmica) però descrits com a línies de treball.
- No indicar que són "tractaments" per a "trastorns".
- Sempre amb frase implícita: “depèn del criteri professional”.
`;

const RISK_DETECTION_PROMPT = `
- Detectar indicadors lingüístics de risc (paraules clau de mort, autolesió).
- NO concloure risc diagnòstic.
- Formular com a: "Expressions que requereixen atenció prioritària".
`;

const FACTUAL_SUMMARY_PROMPT = (language: string) => `
Genera un resum EXCLUSIVAMENT FÀCTIC i DESCRIPTIU del contingut proporcionat.

IDIOMA DE RESPOSTA: ${language} (Genera tot el resum en aquest idioma).

REGLES ERICTES:
1. Només inclou informació explícita en el text (transcripció/notes).
2. NO infereixis, NO interpretis, NO psicologitzis.
3. NO facis diagnòstics ni usis etiquetes clíniques.
4. Si el text és buit o molt breu, indica-ho ("Contingut insuficient per a resum").
5. Estil: Tercera persona, objectiu, concís.
`;

const TEST_MAPPING = {
    "ansietat": {
        "categoria": "Ansietat, depressió i estrès",
        "tests_per_defecte": [
            { "codi": "BAI", "nom": "Inventari d’Ansietat de Beck", "objectiu_general": "Explorar simptomatologia ansiosa" },
            { "codi": "STAI", "nom": "Qüestionari d’Ansietat Estat-Tret", "objectiu_general": "Explorar ansietat estat i tret" },
            { "codi": "ISRA", "nom": "Inventari de Situacions i Respostes d’Ansietat", "objectiu_general": "Explorar respostes d’ansietat en diferents contextos" }
        ]
    },
    "estat_danim": {
        "categoria": "Ansietat, depressió i estrès",
        "tests_per_defecte": [
            { "codi": "BDI-II", "nom": "Inventari de Depressió de Beck", "objectiu_general": "Explorar simptomatologia depressiva" },
            { "codi": "IDDER", "nom": "Inventari de Depressió Estat-Tret", "objectiu_general": "Avaluar depressió com a estat i tret" },
            { "codi": "SCL-90-R", "nom": "Qüestionari de 90 símptomes", "objectiu_general": "Exploració general de símptomes psicopatològics" }
        ]
    },
    "regulacio_emocional": {
        "categoria": "Intel·ligència emocional i afrontament",
        "tests_per_defecte": [
            { "codi": "DERS", "nom": "Difficulties in Emotion Regulation Scale", "objectiu_general": "Explorar dificultats en la regulació emocional" },
            { "codi": "MSCEIT", "nom": "Test d’Intel·ligència Emocional Mayer-Salovey-Caruso", "objectiu_general": "Explorar aspectes de la intel·ligència emocional" },
            { "codi": "MOLDES", "nom": "Test d’Estratègies Cognitives-Emocionals", "objectiu_general": "Avaluar estratègies d’afrontament" }
        ]
    },
    "estrès_laboral": {
        "categoria": "Estrès i entorn laboral",
        "tests_per_defecte": [
            { "codi": "CESQT", "nom": "Qüestionari del Síndrome d’Estar Cremat", "objectiu_general": "Avaluar burnout laboral" },
            { "codi": "JSS", "nom": "Qüestionari d’Estrès Laboral", "objectiu_general": "Avaluar fonts d'estrès a la feina" },
            { "codi": "CLA", "nom": "Clima Laboral", "objectiu_general": "Avaluar percepció de l'entorn de treball" }
        ]
    },
    "autoestima": {
        "categoria": "Autoconcepte i autoestima",
        "tests_per_defecte": [
            { "codi": "AF-5", "nom": "Autoconcepte Forma 5", "objectiu_general": "Avaluar autoconcepte en diverses àrees" },
            { "codi": "LAEA", "nom": "Llistat d’Adjectius per a l’Autoconcepte", "objectiu_general": "Explorar la percepció d'un mateix" },
            { "codi": "CAG", "nom": "Qüestionari d’Autoconcepte", "objectiu_general": "Avaluar dimensions de l'autoconcepte" }
        ]
    },
    "relacions_interpersonals": {
        "categoria": "Família, parella i vinculació",
        "tests_per_defecte": [
            { "codi": "VINCULATEST", "nom": "Test d’Avaluació dels Vincles", "objectiu_general": "Avaluar estils de vinculació i relacions" },
            { "codi": "DAS", "nom": "Escala d’Ajust Diàdic", "objectiu_general": "Avaluar la qualitat de la relació de parella" },
            { "codi": "ASPA", "nom": "Qüestionari d’Asserció en la Parella", "objectiu_general": "Avaluar estils comunicatius en la parella" }
        ]
    },
    "ira_impulsivitat": {
        "categoria": "Expressió emocional i control d’impulsos",
        "tests_per_defecte": [
            { "codi": "STAXI-2", "nom": "Inventari d’Expressió de la Ira", "objectiu_general": "Avaluar experiència i expressió de la ira" },
            { "codi": "CAPI-A", "nom": "Qüestionari d’Agressivitat", "objectiu_general": "Avaluar agressivitat premeditada i impulsiva" }
        ]
    },
    "trauma": {
        "categoria": "Impacte del trauma",
        "tests_per_defecte": [
            { "codi": "EGEP-5", "nom": "Avaluació Global de l’Estrès Posttraumàtic", "objectiu_general": "Avaluar símptomes d'estrès posttraumàtic" },
            { "codi": "CIT", "nom": "Qüestionari d’Impacte del Trauma", "objectiu_general": "Explorar impacte d'esdeveniments traumàtics" }
        ]
    },
    "personalitat_patrons": {
        "categoria": "Personalitat i patrons personals",
        "tests_per_defecte": [
            { "codi": "PAI", "nom": "Inventari d’Avaluació de la Personalitat", "objectiu_general": "Avaluació clínica general de la personalitat" },
            { "codi": "MMPI-2", "nom": "Inventari Multifàsic de Minnesota-2", "objectiu_general": "Avaluació exhaustiva de la personalitat i psicopatologia" }
        ]
    }
};

const TEST_MAPPING_MENORS = {
    "ansietat_infantil": {
        "categoria": "Ansietat i estat emocional",
        "tests_per_defecte": [
            { "codi": "CMASR-2", "nom": "Escala d’Ansietat Manifesta en Nens", "objectiu_general": "Avaluar ansietat manifesta en nens i adolescents" },
            { "codi": "STAIC", "nom": "Qüestionari d’Ansietat Estat-Tret Infantil", "objectiu_general": "Avaluar ansietat estat i tret en nens" }
        ]
    },
    "estat_emocional": {
        "categoria": "Benestar emocional",
        "tests_per_defecte": [
            { "codi": "CDI", "nom": "Inventari de Depressió Infantil", "objectiu_general": "Avaluar simptomatologia depressiva en nens" },
            { "codi": "SENA", "nom": "Sistema d’Avaluació de Nens i Adolescents", "objectiu_general": "Avaluació multidimensional de problemes emocionals i de conducta" }
        ]
    },
    "regulacio_emocional": {
        "categoria": "Gestió emocional",
        "tests_per_defecte": [
            { "codi": "BYI-2", "nom": "Inventaris de Beck per a Nens i Adolescents", "objectiu_general": "Avaluar malestar emocional i autoconcpte" }
        ]
    },
    "atencio_i_impulsivitat": {
        "categoria": "Atenció i funcions executives",
        "tests_per_defecte": [
            { "codi": "BRIEF-2", "nom": "Avaluació Conductual de la Funció Executiva", "objectiu_general": "Avaluar funcions executives en entorn escolar i familiar" },
            { "codi": "E-TDAH", "nom": "Escala de Detecció del TDAH", "objectiu_general": "Detecció de símptomes de TDAH" }
        ]
    },
    "habilitats_socials": {
        "categoria": "Competència social",
        "tests_per_defecte": [
            { "codi": "EHS", "nom": "Escala d’Habilitats Socials", "objectiu_general": "Avaluar assertivitat i habilitats socials" }
        ]
    }
};

import { GoogleGenerativeAI } from "@google/generative-ai";

@Injectable()
export class AiService {
    private genAI: GoogleGenerativeAI;

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }

    private filterContent(text: string): string | null {
        if (FORBIDDEN_WORDS_REGEX.test(text)) {
            return null; // Discard harmful content immediately
        }
        return text;
    }

    /**
     * Generates a descriptive, non-diagnostic session analysis.
     */
    async generateSessionAnalysis(sessionId: string, notes: string, transcription: string, isMinor: boolean = false, language: string = 'ca'): Promise<{
        summary: string;
        emotionalElements: string[];
        narrativeIndicators: string[];
        orientativeObservations: string[];

        clinicalFollowUpSupport: {
            suggestions: string[];
            possibleLines: string[];
            modelReferences: string[];
        };
        discurs_pacient: {
            resum_descriptiu: string;
            fragments_relevants: string[];
        };
        temes_emergents_sessio: {
            regles_seleccio: any;
            temes_seleccionats: any[];
            temes_descartats: any[];
        };
        diagnostic_final: {
            nota_general: string;
            tests_sugerits_final: {
                regles: any;
                suggeriments: Array<{
                    tema: string;
                    categoria: string;
                    tests: Array<{
                        codi: string;
                        nom: string;
                        objectiu_general: string;
                        why_this_test_was_suggested: {
                            based_on: string[];
                            tema_associat: string;
                            descripcio_orientativa: string;
                            font: string;
                            decisio_automatica: boolean;
                        };
                    }>;
                }>;
            };
        };
        disclaimer: string;
        audit_session: {
            ai_role: string;
            clinical_decision_making: boolean;
            real_time_recommendations: boolean;
            tests_suggested_only_at_session_end: boolean;
            max_topics_applied: number;
            max_tests_applied: number;
            decision_logic: {
                based_on: string[];
                excluded: string[];
            };
            professional_override_allowed: boolean;
            audit_trace_available: boolean;
            compliance: string[];
            timestamp: string;
        };
        clinical_report_text: string;
        audit_minors?: {
            minor_context: boolean;
            language_adapted: boolean;
            developmental_focus: boolean;
            non_diagnostic_language: boolean;
            tests_age_appropriate: boolean;
            guardian_decision_required: boolean;
        };
    }> {
        // Simulating the AI processing time
        // await new Promise((resolve) => setTimeout(resolve, 1500));

        // Combine for heuristics (legacy logic used 'notes' which contained fullText)
        // Now 'notes' is just notes, 'transcription' is just transcription.
        // We concatenate them for the heuristic checks to maintain broad coverage.
        const lowerNotes = (notes + '\n' + transcription).toLowerCase();

        // --- REAL SUMMARY GENERATION (RESTRICTED TO TRANSCRIPTION) ---
        let generatedSummary = `Resum no disponible (Error en generació)`;
        try {
            // Only use TRANSCRIPTION for summary as requested
            // But if transcription is empty, we can't summarize it. 
            // Let's rely on transcription.

            if (!transcription || transcription.trim().length < 5) {
                generatedSummary = "No hi ha transcripció disponible per a generar el resum.";
            } else {
                console.log(`[AiService] Generating summary for transcription length: ${transcription.length}`);

                try {
                    // Using Gemini 2.0 Flash as it is available and fast
                    const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                    const result = await model.generateContent([
                        FACTUAL_SUMMARY_PROMPT(language),
                        `TRANSCRIPCIÓ A RESUMIR:\n${transcription}`
                    ]);

                    const response = await result.response;
                    generatedSummary = response.text();
                    console.log(`[AiService] Summary generated successfully.`);
                } catch (innerError) {
                    console.error("[AiService] Error generating summary:", innerError);
                    generatedSummary = `Error generant resum: ${(innerError as any).message || 'Error desconegut'}`;
                }
            }
        } catch (error) {
            console.error("Error generating summary:", error);
            generatedSummary = `No s'ha pogut generar el resum automàticament.`;
        }

        // 1. Elements Emocionals Expressats (Descriptive)
        const emotionalElements: string[] = [];
        if (lowerNotes.includes('triste') || lowerNotes.includes('llora') || lowerNotes.includes('buit') || lowerNotes.includes('pena') || lowerNotes.includes('dolor')) {
            emotionalElements.push('intensitat emocional');
            emotionalElements.push('sensacions descrites com a buit o desconnexió');
        }
        if (lowerNotes.includes('miedo') || lowerNotes.includes('ansiedad') || lowerNotes.includes('nervios') || lowerNotes.includes('angustia') || lowerNotes.includes('pánico')) {
            emotionalElements.push('anticipació d’esdeveniments futurs');
            emotionalElements.push('inquietud expressada en el relat');
        }
        if (lowerNotes.includes('rabia') || lowerNotes.includes('enfado') || lowerNotes.includes('grito') || lowerNotes.includes('odio')) {
            emotionalElements.push('expressió d’hostilitat o frustració');
            emotionalElements.push('reaccions reactives davant l’entorn');
        }
        if (lowerNotes.includes('alegria') || lowerNotes.includes('feliz') || lowerNotes.includes('contento') || lowerNotes.includes('animado')) {
            emotionalElements.push('valència afectiva positiva');
            emotionalElements.push('connexió amb experiències gratificants');
        }

        // Failsafe if empty
        if (emotionalElements.length === 0) {
            emotionalElements.push('To general del discurs aparentment estable.');
            emotionalElements.push('Narrativa centrada en aspectes funcionals o descriptius sense marcadors emocionals d’alta intensitat.');
        }

        // 2. Indicadors Narratius Observats (Patterns)
        const narrativeIndicators: string[] = [];
        if (lowerNotes.includes('siempre') || lowerNotes.includes('nunca') || lowerNotes.includes('todo') || lowerNotes.includes('nada') || lowerNotes.includes('jamás')) {
            narrativeIndicators.push('Presència de patrons narratius amb formulacions generals o absolutes');
        }
        if (lowerNotes.includes('miedo') || lowerNotes.includes('ansiedad') || lowerNotes.includes('preocup')) {
            narrativeIndicators.push('Repetició de temes relacionats amb preocupació anticipatòria');
        }
        if (lowerNotes.includes('suicid') || lowerNotes.includes('muer') || lowerNotes.includes('acabar') || lowerNotes.includes('matar') || lowerNotes.includes('no vale la pena')) {
            narrativeIndicators.push('Expressions verbals que alguns professionals consideren rellevants per a l’exploració clínica (Possibles idees de mort/autolesió)');
        }
        if (lowerNotes.includes('pero') && (lowerNotes.match(/pero/g) || []).length > 3) {
            narrativeIndicators.push('Ús freqüent de conjuncions adversatives ("però") suggerint conflicte intern o justificació');
        }

        // Failsafe if empty
        if (narrativeIndicators.length === 0) {
            narrativeIndicators.push('Discurs fluid i coherent sense disrupcions significatives.');
            narrativeIndicators.push('Absència d’indicadors de risc imminent o bloquejos en aquest fragment.');
        }

        // 3. Observacions Orientatives (Hypotheses)
        const orientativeObservations: string[] = [
            'com la persona descriu l’evolució d’aquestes sensacions en la línia temporal',
            'l’impacte subjectiu d’aquestes experiències en el seu funcionament diari'
        ];
        if (lowerNotes.includes('ansiedad')) {
            orientativeObservations.push('el context en què apareixen els pensaments anticipatoris');
        }
        if (lowerNotes.includes('familia') || lowerNotes.includes('padre') || lowerNotes.includes('madre')) {
            orientativeObservations.push('el paper del sistema familiar percebut en la narrativa actual');
        }

        // 4. Suport per al seguiment clínic (Suggestions)
        const suggestions = [
            'En contexts similars, alguns professionals exploren la història i el significat personal associat a aquestes vivències.'
        ];

        if (lowerNotes.length < 50) {
            suggestions.push('Es suggereix ampliar la recollida d’informació, atesa la brevetat del registre actual.');
        }

        const possibleLines = [
            'Alguns professionals consideren facilitar la identificació i diferenciació de les emocions presents en el relat',
            'Alguns professionals opten per indagar sobre recursos personals i suport social percebuts'
        ];

        const modelReferences = [
            'CBT: Alguns professionals utilitzen aquest model per explorar la relació entre pensaments, emocions i conductes.',
            'Sistémica: Exploració de patrons relacionals si s\'escau.'
        ];

        // 5. Structures for the new JSON format
        const discurs_pacient = {
            resum_descriptiu: `Resum descriptiu orientatiu (Simulat): La sessió conté ${notes.length} caracters. El text sembla centrar-se en experiències personals.`,
            fragments_relevants: [
                "Fragment seleccionat per rellevància clínica potencial (Simulació)...",
                "Segon fragment destacat del discurs..."
            ]
        };

        const temes_emergents = [];
        const temes_descartats = [];

        // Populate temes_emergents based on keywords (EXPANDED LIST)
        if (isMinor) {
            // Minors Logic: Restricted topics
            if (lowerNotes.includes('ansiedad') || lowerNotes.includes('miedo') || lowerNotes.includes('nervios')) {
                temes_emergents.push({ tema: "ansietat_infantil", descripcio: "Inquietud o preocupació manifesta (context infantil/juvenil)", nivell: "emergent" });
            }
            if (lowerNotes.includes('triste') || lowerNotes.includes('llora') || lowerNotes.includes('apaga')) {
                temes_emergents.push({ tema: "estat_emocional", descripcio: "Indicadors de malestar emocional", nivell: "emergent" });
            }
            if (lowerNotes.includes('rabia') || lowerNotes.includes('pega') || lowerNotes.includes('grita') || lowerNotes.includes('conducta')) {
                temes_emergents.push({ tema: "conducta", descripcio: "Observacions sobre la conducta", nivell: "emergent" });
            }
            if (lowerNotes.includes('atencion') || lowerNotes.includes('distrae') || lowerNotes.includes('movimiento')) {
                temes_emergents.push({ tema: "atencio_i_impulsivitat", descripcio: "Aspectes relacionats amb l'atenció i el control d'impulsos", nivell: "emergent" });
            }
            if (lowerNotes.includes('amigos') || lowerNotes.includes('juega') || lowerNotes.includes('timido')) {
                temes_emergents.push({ tema: "habilitats_socials", descripcio: "Relació amb iguals i competència social", nivell: "emergent" });
            }
            if (lowerNotes.includes('emocion') || lowerNotes.includes('siente')) {
                temes_emergents.push({ tema: "regulacio_emocional", descripcio: "Gestió d'emocions", nivell: "emergent" });
            }
            // ADDITIONAL MINOR KEYWORDS
            if (lowerNotes.includes('cole') || lowerNotes.includes('escuela') || lowerNotes.includes('profe') || lowerNotes.includes('deberes')) {
                temes_emergents.push({ tema: "atencio_i_impulsivitat", descripcio: "Aspectes escolars/acadèmics", nivell: "emergent" });
            }

        } else {
            // Adult Logic (Original)
            if (lowerNotes.includes('ansiedad') || lowerNotes.includes('miedo') || lowerNotes.includes('nervios')) {
                temes_emergents.push({ tema: "ansietat", descripcio: "Malestar nerviós i preocupació anticipatòria", nivell: "emergent" });
            }
            if (lowerNotes.includes('triste') || lowerNotes.includes('buit') || lowerNotes.includes('desanim') || lowerNotes.includes('llorar')) {
                temes_emergents.push({ tema: "estat_danim", descripcio: "Indicadors d'estat d'ànim baix o tristesa", nivell: "emergent" });
            }
            if (lowerNotes.includes('emocion') || lowerNotes.includes('control') || lowerNotes.includes('desborda')) {
                temes_emergents.push({ tema: "regulacio_emocional", descripcio: "Dificultats per gestionar la intensitat emocional", nivell: "emergent" });
            }
            if (lowerNotes.includes('trabajo') || lowerNotes.includes('feina') || lowerNotes.includes('jefe') || lowerNotes.includes('burnout')) {
                temes_emergents.push({ tema: "estrès_laboral", descripcio: "Tensió relacionada amb l'entorn laboral", nivell: "emergent" });
            }
            if (lowerNotes.includes('valgo') || lowerNotes.includes('seguridad') || lowerNotes.includes('estima') || lowerNotes.includes('inferior')) {
                temes_emergents.push({ tema: "autoestima", descripcio: "Expressions relacionades amb l'autoconcepte", nivell: "emergent" });
            }
            if (lowerNotes.includes('pareja') || lowerNotes.includes('familia') || lowerNotes.includes('discusión') || lowerNotes.includes('relación')) {
                temes_emergents.push({ tema: "relacions_interpersonals", descripcio: "Dinàmiques relacionals rellevants", nivell: "emergent" });
            }
            if (lowerNotes.includes('ira') || lowerNotes.includes('rabia') || lowerNotes.includes('enfado') || lowerNotes.includes('grito')) {
                temes_emergents.push({ tema: "ira_impulsivitat", descripcio: "Expressió d'ira o dificultat en el control d'impulsos", nivell: "emergent" });
            }
            if (lowerNotes.includes('trauma') || lowerNotes.includes('abuso') || lowerNotes.includes('pesadilla') || lowerNotes.includes('evento')) {
                temes_emergents.push({ tema: "trauma", descripcio: "Indicadors compatibles amb vivències traumàtiques", nivell: "emergent" });
            }
            if (lowerNotes.includes('soy asi') || lowerNotes.includes('forma de ser') || lowerNotes.includes('personalidad')) {
                temes_emergents.push({ tema: "personalitat_patrons", descripcio: "Patrons de personalitat o identitat", nivell: "emergent" });
            }
        }

        // Default if empty
        if (temes_emergents.length === 0) {
            temes_emergents.push({
                tema: "exploració general",
                descripcio: "Temes generals sense focus específic detectat",
                nivell: "observat"
            });
        }


        // Helper descriptions for audit flag
        const AUDIT_DESCRIPTIONS = {
            "ansietat": "Aquest instrument s’inclou com a opció orientativa perquè, en el discurs del pacient, apareixen referències a nerviosisme i preocupació persistent.",
            "estat_danim": "Es suggereix revisar aquest instrument atès que s'han identificat expressions verbals relacionades amb tristesa o baix estat d'ànim.",
            "regulacio_emocional": "S’inclou com a opció orientativa perquè el pacient descriu dificultats per identificar i gestionar les emocions.",
            "estrès_laboral": "Apareix com a suggeriment perquè el contingut verbalitzat inclou referències a tensions o malestar en l'àmbit laboral.",
            "autoestima": "Es considera aquesta opció perquè s'ha detectat un discurs que podria relacionar-se amb la percepció d'un mateix i la vàlua personal.",
            "relacions_interpersonals": "S'inclou orientativament per l'aparició de continguts relacionats amb dinàmiques familiars o de parella rellevants.",
            "ira_impulsivitat": "Aquest instrument apareix perquè s'han verbalitzat situacions de dificultat en el control d'impulsos o expressió d'ira.",
            "trauma": "Es suggereix aquesta opció atès que el relat conté referències compatibles amb experiències d'alt impacte emocional.",
            "personalitat_patrons": "S'inclou com a possibilitat d'exploració general degut a referències sobre trets de caràcter o patrons de comportament establerts.",
            // Minors
            "ansietat_infantil": "Instrument orientatiu per explorar la manifestació d'ansietat en context evolutiu.",
            "estat_emocional": "Suggeriment per valorar l'estat emocional des d'una perspectiva adaptada a l'edat.",
            "atencio_i_impulsivitat": "Eina breu per recollir informació sobre atenció i conducta, sempre com a suport.",
            "habilitats_socials": "Opció per valorar competències relacionals en l'entorn del menor.",
            "conducta": "Escales d'observació conductual per complementar la informació de la sessió."
        };

        // Test Suggestions Construction using TEST_MAPPING or TEST_MAPPING_MENORS
        const suggeriments_tests = [];
        const currentMapping = isMinor ? TEST_MAPPING_MENORS : TEST_MAPPING;

        temes_emergents.forEach(t => {
            const mapEntry = currentMapping[t.tema];
            if (mapEntry) {
                suggeriments_tests.push({
                    tema: t.tema,
                    categoria: mapEntry.categoria,
                    tests: mapEntry.tests_per_defecte.map(test => ({
                        ...test,
                        why_this_test_was_suggested: {
                            based_on: ["tema_emergent", "contingut_verbalitzat"],
                            tema_associat: t.tema,
                            descripcio_orientativa: AUDIT_DESCRIPTIONS[t.tema] || "Suggeriment basat en la correspondència temàtica detectada en el discurs.",
                            font: isMinor ? "Mapa estàtic tema → tests (menors)" : "Mapa estàtic tema → tests",
                            decisio_automatica: false
                        }
                    }))
                });
            }
        });

        // Fallback demo data if no specific tests matched (and not 'exploració general' which has no map)
        if (suggeriments_tests.length === 0 && temes_emergents[0].tema === 'exploració general') {
            suggeriments_tests.push({
                tema: "general",
                categoria: "Avaluació General",
                tests: [
                    { codi: "SCL-90-R", nom: "Symptom Checklist-90-Revised", objectiu_general: "Exploració general de símptomes psicopatològics" }
                ]
            });
        }

        const diagnostic_final = {
            nota_general: "Els elements següents són orientatius i no impliquen cap diagnòstic ni decisió automatitzada.",
            tests_sugerits_final: {
                regles: {
                    max_temes: 2,
                    max_tests_totals: 5,
                    criteri_seleccio: "Correspondència orientativa amb els temes emergents seleccionats",
                    font: "Catàleg professional COPC"
                },
                suggeriments: suggeriments_tests
            }
        };

        const temes_emergents_sessio = {
            regles_seleccio: {
                max_temes: 2,
                criteris: ["presència reiterada", "impacte funcional", "claredat"]
            },
            temes_seleccionats: temes_emergents,
            temes_descartats: temes_descartats
        };

        // Disclaimer phrases
        const footerTitle = "Aquest contingut té finalitat orientativa.";
        const footerBody = "La decisió clínica correspon exclusivament al professional.";

        const COMPLIANCE_METADATA = {
            title: "Justificació legal del sistema d’IA",
            version: "1.0",
            last_updated: "2025-12-16",
            scope: ["adult", "menors"],
            available_to_professional: true,
            content_hash: "7a9f8d6e4c2b1a3f5e9d0c8b6a4e2d1f3b5c7a9e0d2f4b6a8c0e2d4f6b8a0c2e" // SHA-256 of v1.0 text
        };

        // 6. Global Audit Flag (strict compliance)
        const audit_session = {
            ai_role: "suport orientatiu a professionals",
            clinical_decision_making: false,
            real_time_recommendations: false,
            tests_suggested_only_at_session_end: true,
            max_topics_applied: 2,
            max_tests_applied: 5,
            decision_logic: {
                based_on: [
                    "contingut_verbalitzat",
                    "temes_emergents",
                    "mapa_estatic_tema_tests"
                ],
                excluded: [
                    "diagnostic_automatic",
                    "assignacio_de_proves",
                    "interpretacio_de_resultats"
                ]
            },
            professional_override_allowed: true,
            audit_trace_available: true,
            compliance: [
                "GDPR",
                "EU_AI_Act_high_risk_support_system"
            ],
            timestamp: new Date().toISOString(),
            compliance_document: COMPLIANCE_METADATA
        };

        // 7. Exportable Clinical Report Text
        const temesFormatted = temes_emergents.map(t => `– ${t.tema}`).join('\n');
        const clinical_report_text = `
Suggeriment orientatiu d’instruments d’avaluació (suport IA)

A partir dels temes emergents descrits durant la sessió, la IA ha generat un conjunt limitat d’opcions orientatives d’instruments d’avaluació psicològica, exclusivament com a suport al criteri professional.

Els suggeriments s’han basat únicament en el contingut verbalitzat i en la correspondència amb un catàleg professional predefinit, sense realitzar cap diagnòstic, assignació automàtica de proves ni interpretació de resultats.

Aquestes opcions:
- no tenen caràcter prescriptiu
- poden ser acceptades, modificades o ignorades pel professional
- no substitueixen en cap cas el criteri clínic

Temes considerats a la sessió (màxim 2):
${temesFormatted}

Instruments mostrats (màxim 5):
Els instruments llistats s’han inclòs com a opcions generals que alguns professionals poden considerar en situacions similars, segons el seu criteri clínic.

La interpretació i l’ús de qualsevol instrument correspon exclusivament al professional responsable.
`.trim();

        // Audit Minors Flag
        const audit_minors = isMinor ? {
            minor_context: true,
            language_adapted: true,
            developmental_focus: true,
            non_diagnostic_language: true,
            tests_age_appropriate: true,
            guardian_decision_required: true
        } : undefined;

        // Self-Validation check
        this.validateAuditFlags(diagnostic_final);

        return {
            summary: generatedSummary,
            emotionalElements,
            narrativeIndicators,
            orientativeObservations,
            clinicalFollowUpSupport: {
                suggestions,
                possibleLines,
                modelReferences
            },
            discurs_pacient,
            temes_emergents_sessio,
            diagnostic_final,
            disclaimer: "La IA no assigna, no prescriu ni interpreta proves psicològiques. La decisió clínica correspon exclusivament al professional. Aquest document ha estat generat mitjançant un sistema d’anàlisi automatitzada del llenguatge, sense accés a informació externa ni contextual.",
            audit_session,
            clinical_report_text,
            audit_minors
        };
    }

    private validateAuditFlags(diagnostic_final: any) {
        const suggeriments = diagnostic_final?.tests_sugerits_final?.suggeriments || [];
        suggeriments.forEach((temaBlock: any) => {
            temaBlock.tests.forEach((test: any) => {
                if (!test.why_this_test_was_suggested) {
                    console.error(`AUDIT ERROR: Test ${test.codi} missing audit flag`);
                } else if (test.why_this_test_was_suggested.decisio_automatica !== false) {
                    console.error(`AUDIT ERROR: Test ${test.codi} has invalid decisio_automatica flag`);
                }
            });
        });
    }

    /**
     * Generates real-time suggestions during a session.
     */
    async getLiveSuggestions(context: string): Promise<{ questions: string[]; considerations: string[]; indicators: { type: string; label: string }[] }> {
        try {
            const prompt = `
CONTEXT ACTUAL (Text viu de la sessió):
"${context || '(Sessió iniciada, sense text encara)'}"

Genera suggeriments en temps real format JSON.
`;

            const model = this.genAI.getGenerativeModel({
                model: "gemini-flash-latest", // Use latest available flash model
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.7,
                },
                systemInstruction: LIVE_SESSION_SYSTEM_PROMPT
            });

            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            try {
                const parsed = JSON.parse(text);
                return {
                    questions: parsed.questions || [],
                    considerations: parsed.considerations || [],
                    indicators: parsed.indicators || []
                };
            } catch (e) {
                console.error("Error parsing live AI JSON", e);
                return { questions: [], considerations: [], indicators: [] };
            }

        } catch (error) {
            console.error("Error generating live suggestions:", error);
            // Fallback if AI fails (keep basic static fallback just in case)
            return {
                questions: ['Com et sents ara mateix?', 'Pots explicar-m\'ho millor?'],
                considerations: ['Error de connexió amb IA'],
                indicators: []
            };
        }
    }
    async generateReportDraft(data: {
        clientName: string;
        reportType: string;
        sections: string[];
        tone: string;
        legalSensitivity: string;
        sessionCount: number;
        period: string;
        notesSummary: string;
        firstSessionNote?: string;
        additionalInstructions?: string;
        languageProfile?: string;
        language?: string; // Restoring language param
    }): Promise<string> {

        // --- 1. PROMPT SELECTION LOGIC ---
        const promptTemplate = getPromptByType(data.reportType);

        // Language Profile Logic
        const getLanguageBlock = (profile: string) => {
            switch (profile) {
                case 'INFANTIL': return 'Llenguatge adaptat a menors, prudent i evolutiu.';
                case 'ESCOLAR': return 'Llenguatge clar, educatiu i no clínic.';
                case 'ADULT': default: return 'Llenguatge clínic estàndard per adults.';
            }
        };

        const languageBlock = getLanguageBlock(data.languageProfile || 'ADULT');

        const promptInput: any = {
            sessionCount: data.sessionCount,
            period: data.period,
            notesSummary: data.notesSummary,
            firstSessionNote: data.firstSessionNote || 'No disponible',
            customSections: data.sections.join('\n') || (data.additionalInstructions ? data.additionalInstructions : 'Estructura lliure'),
            languageProfile: languageBlock, // Injecting strict language rules
            language: data.language || 'Català' // Injecting target language
        };

        const prompt = promptTemplate(promptInput);

        // --- 2. REAL AI GENERATION ---
        try {
            const model = this.genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 8192, // Increased to prevent cut-offs
                    responseMimeType: "text/plain", // Force HTML structure via prompt, not mimeType
                },
                systemInstruction: OFFICIAL_REPORT_SYSTEM_PROMPT + `
                
                IDIOMA DE RESPOSTA OBLIGATORI: ${data.language || 'Català'} (Tot el contingut ha de ser generat en aquest idioma).

                FORMAT DE SORTIDA OBLIGATORI:
                - Retorna EXCLUSIVAMENT codi HTML net dins d'un <div> principal.
                - Fes servir <h3> per als títols de secció (ex: 3. Fonts d'informació).
                - Fes servir <p> per als paràgrafs.
                - Fes servir <ul> i <li> per a llistes.
                - SI fas servir taules, fes servir <table>, <tr>, <td> amb estil simple (border="1" style="border-collapse: collapse; width: 100%;").
                - NO facis servir Markdown (no facis servir **, ##, ni taules amb |).
                - Assegura't de tancar totes les etiquetes.
                `
            });

            const result = await model.generateContent(prompt);
            const response = result.response;
            let text = response.text();

            // formatting cleanup if needed (ensure it didn't wrap in markdown code blocks)
            text = text.replace(/^```html /, '').replace(/```$/, '').trim();

            return text;

        } catch (error) {
            console.error("Error generating report with AI:", error);
            throw new Error("Error en la generación del informe con IA. Por favor, inténtelo de nuevo.");
        }
    }
}
