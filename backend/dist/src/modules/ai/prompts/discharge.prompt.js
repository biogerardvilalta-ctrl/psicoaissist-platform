"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dischargePrompt = void 0;
const dischargePrompt = (data) => `
Ets un/a psicòleg/a col·legiat/da.
Has de redactar un INFORME D’ALTA CLÍNICA.

Perfil Lingüístic:
${data.languageProfile || 'Llenguatge clínic estàndard per adults'}

Objectiu:
Tancar el procés terapèutic descrivint el recorregut, els resultats i l’estat actual.

Estructura obligatòria:
1. Motiu d’alta
2. Resum del procés terapèutic
3. Objectius assolits
4. Estat actual
5. Recomanacions

Dades del procés:
- Nombre de sessions: ${data.sessionCount}
- Període: ${data.period}

Context inicial:
${data.firstSessionNote}

Notes clíniques:
${data.notesSummary}

Regles estrictes:
- No inventis informació
- Mantén un to concloent però prudent
- No facis afirmacions absolutes
- Redacta en tercera persona
- Llenguatge professional
`;
exports.dischargePrompt = dischargePrompt;
//# sourceMappingURL=discharge.prompt.js.map