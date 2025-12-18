"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const prompt_selector_1 = require("./prompt.selector");
const FORBIDDEN_WORDS_REGEX = /(ansietat|depressió|trastorn|diagnòstic|dsm|criteris|patologia|paciente sufre|debe|obligatorio|compleix criteris|hauries de|és recomanable que)/i;
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
const SESSION_ANALYSIS_PROMPT = `
Analitza el text exclusivament de manera descriptiva.
NO utilitzis: categories diagnòstiques, noms de trastorns, termes DSM.

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
const generative_ai_1 = require("@google/generative-ai");
let AiService = class AiService {
    constructor() {
        this.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }
    filterContent(text) {
        if (FORBIDDEN_WORDS_REGEX.test(text)) {
            return null;
        }
        return text;
    }
    async generateSessionAnalysis(sessionId, notes, isMinor = false) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const lowerNotes = notes.toLowerCase();
        const emotionalElements = [];
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
        if (emotionalElements.length === 0) {
            emotionalElements.push('To general del discurs aparentment estable.');
            emotionalElements.push('Narrativa centrada en aspectes funcionals o descriptius sense marcadors emocionals d’alta intensitat.');
        }
        const narrativeIndicators = [];
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
        if (narrativeIndicators.length === 0) {
            narrativeIndicators.push('Discurs fluid i coherent sense disrupcions significatives.');
            narrativeIndicators.push('Absència d’indicadors de risc imminent o bloquejos en aquest fragment.');
        }
        const orientativeObservations = [
            'com la persona descriu l’evolució d’aquestes sensacions en la línia temporal',
            'l’impacte subjectiu d’aquestes experiències en el seu funcionament diari'
        ];
        if (lowerNotes.includes('ansiedad')) {
            orientativeObservations.push('el context en què apareixen els pensaments anticipatoris');
        }
        if (lowerNotes.includes('familia') || lowerNotes.includes('padre') || lowerNotes.includes('madre')) {
            orientativeObservations.push('el paper del sistema familiar percebut en la narrativa actual');
        }
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
        const discurs_pacient = {
            resum_descriptiu: `Resum descriptiu orientatiu (Simulat): La sessió conté ${notes.length} caracters. El text sembla centrar-se en experiències personals.`,
            fragments_relevants: [
                "Fragment seleccionat per rellevància clínica potencial (Simulació)...",
                "Segon fragment destacat del discurs..."
            ]
        };
        const temes_emergents = [];
        const temes_descartats = [];
        if (isMinor) {
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
            if (lowerNotes.includes('cole') || lowerNotes.includes('escuela') || lowerNotes.includes('profe') || lowerNotes.includes('deberes')) {
                temes_emergents.push({ tema: "atencio_i_impulsivitat", descripcio: "Aspectes escolars/acadèmics", nivell: "emergent" });
            }
        }
        else {
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
        if (temes_emergents.length === 0) {
            temes_emergents.push({
                tema: "exploració general",
                descripcio: "Temes generals sense focus específic detectat",
                nivell: "observat"
            });
        }
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
            "ansietat_infantil": "Instrument orientatiu per explorar la manifestació d'ansietat en context evolutiu.",
            "estat_emocional": "Suggeriment per valorar l'estat emocional des d'una perspectiva adaptada a l'edat.",
            "atencio_i_impulsivitat": "Eina breu per recollir informació sobre atenció i conducta, sempre com a suport.",
            "habilitats_socials": "Opció per valorar competències relacionals en l'entorn del menor.",
            "conducta": "Escales d'observació conductual per complementar la informació de la sessió."
        };
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
        const footerTitle = "Aquest contingut té finalitat orientativa.";
        const footerBody = "La decisió clínica correspon exclusivament al professional.";
        const COMPLIANCE_METADATA = {
            title: "Justificació legal del sistema d’IA",
            version: "1.0",
            last_updated: "2025-12-16",
            scope: ["adult", "menors"],
            available_to_professional: true,
            content_hash: "7a9f8d6e4c2b1a3f5e9d0c8b6a4e2d1f3b5c7a9e0d2f4b6a8c0e2d4f6b8a0c2e"
        };
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
        const audit_minors = isMinor ? {
            minor_context: true,
            language_adapted: true,
            developmental_focus: true,
            non_diagnostic_language: true,
            tests_age_appropriate: true,
            guardian_decision_required: true
        } : undefined;
        this.validateAuditFlags(diagnostic_final);
        return {
            summary: `Resum descriptiu de la sessió ${sessionId}. S'han identificat temes relacionats amb l'experiència emocional expressada i els motius de consulta, segons el contingut verbalitzat durant la sessió. ${footerTitle} ${footerBody}`,
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
            disclaimer: "La IA no assigna, no prescriu ni interpreta proves psicològiques. La decisió clínica correspon exclusivament al professional.",
            audit_session,
            clinical_report_text,
            audit_minors
        };
    }
    validateAuditFlags(diagnostic_final) {
        const suggeriments = diagnostic_final?.tests_sugerits_final?.suggeriments || [];
        suggeriments.forEach((temaBlock) => {
            temaBlock.tests.forEach((test) => {
                if (!test.why_this_test_was_suggested) {
                    console.error(`AUDIT ERROR: Test ${test.codi} missing audit flag`);
                }
                else if (test.why_this_test_was_suggested.decisio_automatica !== false) {
                    console.error(`AUDIT ERROR: Test ${test.codi} has invalid decisio_automatica flag`);
                }
            });
        });
    }
    async getLiveSuggestions(context) {
        try {
            const prompt = `
CONTEXT ACTUAL (Text viu de la sessió):
"${context || '(Sessió iniciada, sense text encara)'}"

Genera suggeriments en temps real format JSON.
`;
            const model = this.genAI.getGenerativeModel({
                model: "gemini-flash-latest",
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
            }
            catch (e) {
                console.error("Error parsing live AI JSON", e);
                return { questions: [], considerations: [], indicators: [] };
            }
        }
        catch (error) {
            console.error("Error generating live suggestions:", error);
            return {
                questions: ['Com et sents ara mateix?', 'Pots explicar-m\'ho millor?'],
                considerations: ['Error de connexió amb IA'],
                indicators: []
            };
        }
    }
    async generateReportDraft(data) {
        const promptTemplate = (0, prompt_selector_1.getPromptByType)(data.reportType);
        const getLanguageBlock = (profile) => {
            switch (profile) {
                case 'INFANTIL': return 'Llenguatge adaptat a menors, prudent i evolutiu.';
                case 'ESCOLAR': return 'Llenguatge clar, educatiu i no clínic.';
                case 'ADULT':
                default: return 'Llenguatge clínic estàndard per adults.';
            }
        };
        const languageBlock = getLanguageBlock(data.languageProfile || 'ADULT');
        const prompt = promptTemplate({
            sessionCount: data.sessionCount,
            period: data.period,
            notesSummary: data.notesSummary,
            firstSessionNote: data.firstSessionNote || 'No disponible',
            customSections: data.sections.join('\n') || (data.additionalInstructions ? data.additionalInstructions : 'Estructura lliure'),
            languageProfile: languageBlock
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const now = new Date().toLocaleDateString('es-ES');
        const getSimulatedResponse = (type) => {
            const commonHeader = `
            <div class="report-container" style="font-family: 'Segoe UI', serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 3rem; border-bottom: 2px solid #333; padding-bottom: 1rem;">
                    <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">INFORME PROFESSIONAL PSICOLÒGIC</h1>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #666; text-transform: uppercase;">Document Confidencial</p>
                </div>
                <div style="margin-bottom: 2rem; background: #f8f9fa; padding: 1.5rem; border-radius: 4px;">
                    <h3 style="margin-top:0; margin-bottom: 1rem; border-bottom: 1px solid #ddd; font-size: 14px; text-transform: uppercase; color: #666;">Dades de Identificació</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <tr><td style="width: 35%; padding: 4px 0;"><strong>Tipus d’informe:</strong></td><td>${type}</td></tr>
                        <tr><td style="padding: 4px 0;"><strong>Pacient:</strong></td><td>${data.clientName}</td></tr>
                        <tr><td style="padding: 4px 0;"><strong>Data d'emissió:</strong></td><td>${now}</td></tr>
                        <tr><td style="padding: 4px 0;"><strong>Període avaluat:</strong></td><td>${data.period}</td></tr>
                         <tr><td style="padding: 4px 0;"><strong>Perfil Lingüístic:</strong></td><td>${data.languageProfile || 'ADULT'}</td></tr>
                    </table>
                </div>`;
            const commonFooter = `
                <div style="margin-top: 4rem; padding-top: 1rem; border-top: 1px solid #eee; font-size: 10px; color: #999; text-align: center;">
                    <p>Aquest informe ha estat redactat amb el suport d’una eina d’intel·ligència artificial i revisat per un/a professional col·legiat/da.</p>
                    <p style="margin-top: 5px;">PsychoAI Platform - Versió amb seguretat avançada</p>
                </div>
            </div>`;
            let bodyContent = '';
            switch (type) {
                case 'INITIAL_EVALUATION':
                    bodyContent = `
                    <h3>1. Motiu de consulta</h3>
                    <p>El pacient ${data.clientName} assisteix a consulta descrivint un malestar generalitzat relacionat amb... [Text generat per IA basat en: ${data.firstSessionNote || 'Notes inicials'}]</p>
                    
                    <h3>2. Antecedents rellevants</h3>
                    <p>No consten antecedents psiquiàtrics previs destacables, segons la informació recollida en les ${data.sessionCount} sessions realitzades.</p>
                    
                    <h3>3. Observacions clíniques inicials</h3>
                    <p>Durant les primeres entrevistes, s'observa uan actitud col·laboradora però amb indicadors d'ansietat...</p>
                    
                    <h3>4. Hipòtesis orientatives</h3>
                    <p>La simptomatologia suggeriria una reacció adaptativa a estressors recents, sense que es pugui establir un diagnòstic tancat en aquest moment.</p>
                    
                    <h3>5. Proposta d’intervenció</h3>
                    <p>S’aconsella iniciar un procés de psicoteràpia cognitiu-conductual focalitzat en...</p>
                    `;
                    break;
                case 'PROGRESS':
                    bodyContent = `
                    <h3>1. Context del procés terapèutic</h3>
                    <p>S'han realitzat un total de ${data.sessionCount} sessions durant el període ${data.period}.</p>
                    
                    <h3>2. Evolució clínica</h3>
                    <p>S'observa una progressiva disminució de la simptomatologia ansiosa reportada inicialment.</p>
                    
                    <h3>3. Canvis observats</h3>
                    <p>El pacient ha començat a implementar estratègies d'afrontament més funcionals...</p>
                    
                    <h3>4. Orientacions actuals</h3>
                    <p>Es recomana mantenir la periodicitat de les sessions per consolidar els canvis.</p>
                    `;
                    break;
                case 'DISCHARGE':
                    bodyContent = `
                    <h3>1. Motiu d’alta</h3>
                    <p>El pacient ha assolit els objectius terapèutics establerts a l'inici del tractament.</p>
                    
                    <h3>2. Resum del procés</h3>
                    <p>Des de l'inici (${data.firstSessionNote}), s'ha treballat en la regulació emocional...</p>
                    
                    <h3>3. Objectius assolits</h3>
                    <p>- Millora de la gestió de l'estrès.<br>- Reducció de la simptomatologia física.</p>
                    
                    <h3>4. Recomanacions finals</h3>
                    <p>Es suggereix mantenir hàbits saludables i sol·licitar visita de seguiment en 6 mesos si fos necessari.</p>
                    `;
                    break;
                case 'REFERRAL':
                    bodyContent = `
                    <h3>1. Motiu de derivació</h3>
                    <p>Es sol·licita valoració per part de servei especialitzat en psiquiatria.</p>
                    
                    <h3>2. Estat actual</h3>
                    <p>Persistència de simptomatologia tot i l'abordatge psicoterapèutic durant ${data.sessionCount} sessions.</p>
                    
                    <h3>3. Objectiu</h3>
                    <p>Valoració de necessitat de suport farmacològic complementari.</p>
                    `;
                    break;
                case 'LEGAL':
                    bodyContent = `
                    <div style="border: 1px solid #d63384; padding: 10px; margin-bottom: 20px; color: #d63384; font-size: 12px; font-weight: bold;">
                        MODE SAFE FORENSIC ACTIU: Llenguatge restrictiu aplicat.
                    </div>

                    <h3>1. Objecte de l’informe</h3>
                    <p>Valoració de l'estat psicològic actual a petició de part.</p>
                    
                    <h3>2. Metodologia</h3>
                    <p>Entrevistes clíniques i observació conductual durant ${data.sessionCount} sessions.</p>
                    
                    <h3>3. Fets observats</h3>
                    <p>Es constata una presentació personal adequada i un discurs coherent.</p>
                    
                    <h3>4. Manifestacions del/la pacient</h3>
                    <p>El pacient manifesta: "Em sento incapaç de tornar a la feina des dels fets".</p>
                    
                    <h3>5. Consideracions tècniques</h3>
                    <p>La simptomatologia observada és compatible amb quadres reactius, sense que es pugui determinar causalitat directa única amb la informació disponible.</p>
                    
                    <h3>6. Conclusions</h3>
                    <p>A data d'avui, el pacient presenta indicadors de malestar clínicament significatiu. No es detecten indicadors de simulació en l'exploració actual.</p>
                    `;
                    break;
                case 'INSURANCE':
                    bodyContent = `
                    <h3>1. Motiu de la intervenció</h3>
                    <p>Tractament psicològic per ansietat.</p>
                    
                    <h3>2. Dades del tractament</h3>
                    <p>Iniciat el ${data.period}. Nombre de sessions: ${data.sessionCount}.</p>
                    
                    <h3>3. Evolució</h3>
                    <p>Favorable. Es preveu la necessitat de 10 sessions addicionals.</p>
                    `;
                    break;
                default:
                    bodyContent = data.sections.map((sec, i) => `
                        <h3>${i + 1}. ${sec}</h3>
                        <p>[Contingut personalitzat per a la secció "${sec}"]</p>
                    `).join('');
            }
            return commonHeader + bodyContent + commonFooter;
        };
        const content = getSimulatedResponse(data.reportType);
        return content;
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AiService);
//# sourceMappingURL=ai.service.js.map