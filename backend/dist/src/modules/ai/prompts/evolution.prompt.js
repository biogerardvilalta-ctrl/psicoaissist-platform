"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evolutionPrompt = void 0;
const evolutionPrompt = (data) => `
Ets un/a psicòleg/a col·legiat/da.
Has de redactar un INFORME D’EVOLUCIÓ PSICOLÒGICA.

IDIOMA DE REDACCIÓ: ${data.language || 'Català'} (Redacta tot l'informe en aquest idioma).

Perfil Lingüístic:
${data.languageProfile || 'Llenguatge clínic estàndard per adults'}

Objectiu:
Descriure l’evolució del/la pacient al llarg del procés terapèutic.

Estructura obligatòria:
1. Context del procés terapèutic
2. Evolució clínica
3. Canvis observats
4. Resposta al tractament
5. Orientacions actuals

Dades del procés:
- Nombre de sessions: ${data.sessionCount}
- Període: ${data.period}

Notes clíniques:
${data.notesSummary}

Regles estrictes:
- No inventis informació
- Basa’t exclusivament en les observacions registrades
- Evita judicis categòrics
- Llenguatge evolutiu i clínic
- Redacta en tercera persona
`;
exports.evolutionPrompt = evolutionPrompt;
//# sourceMappingURL=evolution.prompt.js.map