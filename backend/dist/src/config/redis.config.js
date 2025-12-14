"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisConfig = void 0;
const config_1 = require("@nestjs/config");
exports.RedisConfig = (0, config_1.registerAs)('redis', () => ({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB) || 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'psychologist-app:',
    retryAttempts: parseInt(process.env.REDIS_RETRY_ATTEMPTS) || 3,
    retryDelay: parseInt(process.env.REDIS_RETRY_DELAY) || 1000,
}));
//# sourceMappingURL=redis.config.js.map