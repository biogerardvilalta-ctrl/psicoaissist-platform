"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_FEATURES = exports.PlanLimits = void 0;
var PlanLimits;
(function (PlanLimits) {
    PlanLimits[PlanLimits["BASIC_MAX_CLIENTS"] = 25] = "BASIC_MAX_CLIENTS";
    PlanLimits[PlanLimits["BASIC_TRANSCRIPTION_HOURS"] = 50] = "BASIC_TRANSCRIPTION_HOURS";
    PlanLimits[PlanLimits["BASIC_REPORTS"] = 100] = "BASIC_REPORTS";
    PlanLimits[PlanLimits["PRO_TRANSCRIPTION_HOURS"] = 200] = "PRO_TRANSCRIPTION_HOURS";
    PlanLimits[PlanLimits["UNLIMITED"] = -1] = "UNLIMITED";
})(PlanLimits || (exports.PlanLimits = PlanLimits = {}));
exports.PLAN_FEATURES = {
    basic: {
        maxClients: PlanLimits.BASIC_MAX_CLIENTS,
        transcriptionHours: PlanLimits.BASIC_TRANSCRIPTION_HOURS,
        reportsPerMonth: PlanLimits.BASIC_REPORTS,
        supportLevel: 'email',
    },
    pro: {
        maxClients: PlanLimits.UNLIMITED,
        transcriptionHours: PlanLimits.PRO_TRANSCRIPTION_HOURS,
        reportsPerMonth: PlanLimits.UNLIMITED,
        supportLevel: 'priority',
        advancedAnalytics: true,
        apiAccess: true,
    },
    premium: {
        maxClients: PlanLimits.UNLIMITED,
        transcriptionHours: PlanLimits.UNLIMITED,
        reportsPerMonth: PlanLimits.UNLIMITED,
        supportLevel: 'phone',
        advancedAnalytics: true,
        apiAccess: true,
        customBranding: true,
        ssoIntegration: true,
        prioritySupport: true,
    },
};
//# sourceMappingURL=plan-features.js.map