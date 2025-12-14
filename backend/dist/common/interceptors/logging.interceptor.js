"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let LoggingInterceptor = class LoggingInterceptor {
    constructor() {
        this.logger = new common_1.Logger('HTTP');
    }
    intercept(context, next) {
        if (context.getType() === 'http') {
            const now = Date.now();
            const httpContext = context.switchToHttp();
            const request = httpContext.getRequest();
            const response = httpContext.getResponse();
            const { method, url, headers, body, ip, user } = request;
            this.logger.log({
                message: 'Incoming Request',
                method,
                url,
                ip,
                userAgent: headers['user-agent'],
                userId: user?.id || 'anonymous',
                timestamp: new Date().toISOString(),
                requestId: headers['x-request-id'] || 'no-id',
                body: this.sanitizeBody(body, method),
            });
            return next
                .handle()
                .pipe((0, operators_1.tap)(() => {
                const duration = Date.now() - now;
                this.logger.log({
                    message: 'Request Completed',
                    method,
                    url,
                    statusCode: response.statusCode,
                    duration: `${duration}ms`,
                    userId: user?.id || 'anonymous',
                    timestamp: new Date().toISOString(),
                });
            }), (0, operators_1.catchError)((error) => {
                const duration = Date.now() - now;
                this.logger.error({
                    message: 'Request Failed',
                    method,
                    url,
                    statusCode: response.statusCode,
                    duration: `${duration}ms`,
                    error: error.message,
                    stack: error.stack,
                    userId: user?.id || 'anonymous',
                    timestamp: new Date().toISOString(),
                });
                throw error;
            }));
        }
        return next.handle();
    }
    sanitizeBody(body, method) {
        if (!body || method === 'GET')
            return undefined;
        const sanitized = { ...body };
        if (sanitized.password)
            sanitized.password = '[REDACTED]';
        if (sanitized.refreshToken)
            sanitized.refreshToken = '[REDACTED]';
        if (sanitized.currentPassword)
            sanitized.currentPassword = '[REDACTED]';
        if (sanitized.newPassword)
            sanitized.newPassword = '[REDACTED]';
        return sanitized;
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map