declare const _default: (() => {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
    successUrl: string;
    cancelUrl: string;
    plans: {
        basic: {
            priceId: string;
            amount: number;
            currency: string;
            interval: string;
            name: string;
            features: {
                maxClients: number;
                transcriptionHours: number;
                reportsPerMonth: number;
                supportLevel: string;
            };
        };
        pro: {
            priceId: string;
            amount: number;
            currency: string;
            interval: string;
            name: string;
            features: {
                maxClients: number;
                transcriptionHours: number;
                reportsPerMonth: number;
                supportLevel: string;
                advancedAnalytics: boolean;
                apiAccess: boolean;
            };
        };
        premium: {
            priceId: string;
            amount: number;
            currency: string;
            interval: string;
            name: string;
            features: {
                maxClients: number;
                transcriptionHours: number;
                reportsPerMonth: number;
                supportLevel: string;
                advancedAnalytics: boolean;
                apiAccess: boolean;
                customBranding: boolean;
                ssoIntegration: boolean;
                prioritySupport: boolean;
            };
        };
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
    successUrl: string;
    cancelUrl: string;
    plans: {
        basic: {
            priceId: string;
            amount: number;
            currency: string;
            interval: string;
            name: string;
            features: {
                maxClients: number;
                transcriptionHours: number;
                reportsPerMonth: number;
                supportLevel: string;
            };
        };
        pro: {
            priceId: string;
            amount: number;
            currency: string;
            interval: string;
            name: string;
            features: {
                maxClients: number;
                transcriptionHours: number;
                reportsPerMonth: number;
                supportLevel: string;
                advancedAnalytics: boolean;
                apiAccess: boolean;
            };
        };
        premium: {
            priceId: string;
            amount: number;
            currency: string;
            interval: string;
            name: string;
            features: {
                maxClients: number;
                transcriptionHours: number;
                reportsPerMonth: number;
                supportLevel: string;
                advancedAnalytics: boolean;
                apiAccess: boolean;
                customBranding: boolean;
                ssoIntegration: boolean;
                prioritySupport: boolean;
            };
        };
    };
}>;
export default _default;
