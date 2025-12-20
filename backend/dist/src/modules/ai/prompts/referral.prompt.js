"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralPrompt = void 0;
const referralPrompt = (data) => `
Ets un/a psicòleg/a col·legiat/da.
Has de redactar un INFORME DE DERIVACIÓ A UN/A ALTRE/A PROFESSIONAL.

IDIOMA DE REDACCIÓ: ${data.language || 'Català'} (Redacta tot l'informe en aquest idioma).

Perfil Lingüístic:
${data.languageProfile || 'Llenguatge clínic estàndard per adults'}

Objectiu:
Facilitar informació rellevant per a la continuïtat assistencial.

Estructura obligatòria:
1. Motiu de derivació
2. Breu història clínica
3. Intervencions realitzades
4. Estat actual
5. Objectiu de la derivació

Dades del procés:
- Nombre de sessions: ${data.sessionCount}
- Període: ${data.period}

Notes clíniques:
${data.notesSummary}

Regles estrictes:
- Sigues clar/a i concís/a
- No facis interpretacions innecessàries
- Evita judicis de valor
- Utilitza llenguatge professional i neutre
- Redacta en tercera persona
`;
exports.referralPrompt = referralPrompt;
//# sourceMappingURL=referral.prompt.js.map