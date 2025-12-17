import { ReportType } from '@prisma/client';
import {
    initialPrompt,
    evolutionPrompt,
    dischargePrompt,
    referralPrompt,
    forensicPrompt,
    insurancePrompt,
    customPrompt
} from './prompts';

export function getPromptByType(reportType: string) {
    switch (reportType) {
        case ReportType.INITIAL_EVALUATION:
            return initialPrompt;
        case ReportType.PROGRESS:
            return evolutionPrompt;
        case ReportType.DISCHARGE:
            return dischargePrompt;
        case ReportType.REFERRAL:
            return referralPrompt;
        case ReportType.LEGAL:
            return forensicPrompt;
        case ReportType.INSURANCE:
            return insurancePrompt;
        case ReportType.CUSTOM:
        default:
            return customPrompt;
    }
}
