export declare enum PlanType {
    BASIC = "basic",
    PRO = "pro",
    PREMIUM = "premium"
}
export declare class CreateCheckoutSessionDto {
    plan: PlanType;
    customerId?: string;
    metadata?: Record<string, string>;
}
export declare class CreateCustomerDto {
    email: string;
    name: string;
    metadata?: Record<string, string>;
}
export declare class CreateSubscriptionDto {
    customerId: string;
    plan: PlanType;
}
export declare class UpdateSubscriptionDto {
    subscriptionId: string;
    newPlan: PlanType;
}
export declare class WebhookDto {
    signature: string;
    payload: any;
}
