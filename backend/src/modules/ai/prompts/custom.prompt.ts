export const customPrompt = (data: {
    sessionCount: number;
    period: string;
    notesSummary: string;
    customSections?: string;
    languageProfile?: string;
    language?: string;
}) => `
Ets un/a psicòleg/a col·legiat/da.
Has de redactar un INFORME PSICOLÒGIC PERSONALITZAT.

IDIOMA DE REDACCIÓ: ${data.language || 'Català'} (Redacta tot l'informe en aquest idioma).

Perfil Lingüístic:
${data.languageProfile || 'Llenguatge clínic estàndard per adults'}

Objectiu:
Redactar un informe seguint estrictament l’estructura indicada pel/la professional.

Estructura indicada:
${data.customSections || 'Segons criteri professional'}

Dades disponibles:
- Nombre de sessions: ${data.sessionCount}
- Període: ${data.period}

Notes clíniques:
${data.notesSummary}

Regles estrictes:
- No inventis informació
- No afegeixis seccions no indicades
- Segueix fidelment l’estructura proporcionada
- Redacta amb llenguatge professional i clínic
`;
