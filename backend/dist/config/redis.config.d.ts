export declare const RedisConfig: (() => {
    host: string;
    port: number;
    password: string;
    db: number;
    keyPrefix: string;
    retryAttempts: number;
    retryDelay: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
    password: string;
    db: number;
    keyPrefix: string;
    retryAttempts: number;
    retryDelay: number;
}>;
