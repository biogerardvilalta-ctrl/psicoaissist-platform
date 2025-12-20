export const initialPrompt = (data: {
    sessionCount: number;
    period: string;
    notesSummary: string;
    firstSessionNote: string;
    languageProfile?: string;
    customSections?: string;
    language?: string;
}) => `
Ets un/a psicòleg/a col·legiat/da.
Has de redactar un INFORME D’AVALUACIÓ PSICOLÒGICA INICIAL.

IDIOMA DE REDACCIÓ: ${data.language || 'Català'} (Redacta tot l'informe en aquest idioma).

Perfil Lingüístic:
${data.languageProfile || 'Llenguatge clínic estàndard per adults'}

Objectiu:
Descriure el motiu de consulta i les primeres observacions clíniques, sense establir diagnòstics tancats.

Estructura obligatòria:
1. Motiu de consulta
2. Demanda del/la pacient
3. Antecedents rellevants
4. Observacions clíniques inicials
5. Hipòtesis orientatives
6. Proposta d’intervenció

Dades disponibles:
- Nombre de sessions: ${data.sessionCount}
- Període: ${data.period}

Context de la primera sessió (per al motiu de consulta):
${data.firstSessionNote}

Notes clíniques acumulades:
${data.notesSummary}

Regles estrictes:
- No inventis informació
- No formulis diagnòstics clínics categòrics
- Utilitza llenguatge prudent i descriptiu
- Redacta en tercera persona
- Mantén un to professional i clínic
`;
