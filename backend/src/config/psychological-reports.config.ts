import { ReportType } from '@prisma/client';

export const PSYCHOLOGICAL_REPORTS = {
    [ReportType.INITIAL_EVALUATION]: { // Mapped from INITIAL_ASSESSMENT
        label: 'Informe d’avaluació inicial',
        sections: [
            'Motiu de consulta',
            'Demanda del/la pacient',
            'Antecedents rellevants',
            'Observacions clíniques inicials',
            'Hipòtesis orientatives',
            'Proposta d’intervenció'
        ],
        tone: 'clínic, descriptiu, prudent',
        useFirstSession: true,
        useAllSessions: false,
        legalSensitivity: 'low'
    },

    [ReportType.PROGRESS]: { // Mapped from EVOLUTION
        label: 'Informe d’evolució',
        sections: [
            'Context del procés terapèutic',
            'Evolució clínica',
            'Canvis observats',
            'Resposta al tractament',
            'Orientacions actuals'
        ],
        tone: 'clínic, evolutiu',
        useFirstSession: false,
        useAllSessions: true,
        legalSensitivity: 'low'
    },

    [ReportType.DISCHARGE]: {
        label: 'Informe d’alta clínica',
        sections: [
            'Motiu d’alta',
            'Resum del procés terapèutic',
            'Objectius assolits',
            'Estat actual',
            'Recomanacions'
        ],
        tone: 'professional, concloent',
        useFirstSession: true,
        useAllSessions: true,
        legalSensitivity: 'medium'
    },

    [ReportType.REFERRAL]: {
        label: 'Informe de derivació',
        sections: [
            'Motiu de derivació',
            'Breu història clínica',
            'Intervencions realitzades',
            'Estat actual',
            'Objectiu de la derivació'
        ],
        tone: 'clar, neutre, concís',
        useFirstSession: true,
        useAllSessions: false,
        legalSensitivity: 'medium'
    },

    [ReportType.LEGAL]: { // Mapped from FORENSIC
        label: 'Informe legal-forense',
        sections: [
            'Objecte de l’informe',
            'Metodologia',
            'Fets observats',
            'Manifestacions del/la pacient',
            'Consideracions tècniques',
            'Conclusions'
        ],
        tone: 'tècnic, condicional, no interpretatiu',
        useFirstSession: true,
        useAllSessions: true,
        legalSensitivity: 'high'
    },

    [ReportType.INSURANCE]: {
        label: 'Informe per a asseguradores',
        sections: [
            'Motiu de la intervenció',
            'Durada i freqüència',
            'Evolució general',
            'Situació actual',
            'Continuïtat del tractament'
        ],
        tone: 'funcional, objectiu',
        useFirstSession: true,
        useAllSessions: true,
        legalSensitivity: 'medium'
    },

    [ReportType.CUSTOM]: {
        label: 'Informe personalitzat',
        sections: [],
        tone: 'segons indicacions del professional',
        useFirstSession: false,
        useAllSessions: false,
        legalSensitivity: 'variable'
    }
};
