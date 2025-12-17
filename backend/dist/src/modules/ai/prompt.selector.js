"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPromptByType = getPromptByType;
const client_1 = require("@prisma/client");
const prompts_1 = require("./prompts");
function getPromptByType(reportType) {
    switch (reportType) {
        case client_1.ReportType.INITIAL_EVALUATION:
            return prompts_1.initialPrompt;
        case client_1.ReportType.PROGRESS:
            return prompts_1.evolutionPrompt;
        case client_1.ReportType.DISCHARGE:
            return prompts_1.dischargePrompt;
        case client_1.ReportType.REFERRAL:
            return prompts_1.referralPrompt;
        case client_1.ReportType.LEGAL:
            return prompts_1.forensicPrompt;
        case client_1.ReportType.INSURANCE:
            return prompts_1.insurancePrompt;
        case client_1.ReportType.CUSTOM:
        default:
            return prompts_1.customPrompt;
    }
}
//# sourceMappingURL=prompt.selector.js.map