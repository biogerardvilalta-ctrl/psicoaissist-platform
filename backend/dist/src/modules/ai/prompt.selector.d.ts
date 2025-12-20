export declare function getPromptByType(reportType: string): (data: {
    sessionCount: number;
    period: string;
    notesSummary: string;
    customSections?: string;
    languageProfile?: string;
    language?: string;
}) => string;
