export declare function getPromptByType(reportType: string): (data: {
    sessionCount: number;
    period: string;
    notesSummary: string;
    firstSessionNote: string;
    languageProfile?: string;
    customSections?: string;
    language?: string;
}) => string;
