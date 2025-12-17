"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const database_config_1 = require("./config/database.config");
const jwt_config_1 = require("./config/jwt.config");
const redis_config_1 = require("./config/redis.config");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const clients_module_1 = require("./modules/clients/clients.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const sessions_module_1 = require("./modules/sessions/sessions.module");
const reports_module_1 = require("./modules/reports/reports.module");
const ai_module_1 = require("./modules/ai/ai.module");
const payments_module_1 = require("./modules/payments/payments.module");
const admin_module_1 = require("./modules/admin/admin.module");
const audit_module_1 = require("./modules/audit/audit.module");
const prisma_module_1 = require("./common/prisma/prisma.module");
const monitoring_module_1 = require("./common/monitoring.module");
const encryption_module_1 = require("./modules/encryption/encryption.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [database_config_1.DatabaseConfig, jwt_config_1.JwtConfig, redis_config_1.RedisConfig],
                envFilePath: ['.env.local', '.env'],
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => [
                    {
                        name: 'default',
                        ttl: config.get('THROTTLE_TTL') || 60000,
                        limit: config.get('THROTTLE_LIMIT') || 100,
                    },
                    {
                        name: 'auth',
                        ttl: config.get('AUTH_THROTTLE_TTL') || 900000,
                        limit: config.get('AUTH_THROTTLE_LIMIT') || 5,
                    },
                ],
            }),
            prisma_module_1.PrismaModule,
            monitoring_module_1.MonitoringModule,
            encryption_module_1.EncryptionModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            payments_module_1.PaymentsModule,
            admin_module_1.AdminModule,
            clients_module_1.ClientsModule,
            dashboard_module_1.DashboardModule,
            sessions_module_1.SessionsModule,
            sessions_module_1.SessionsModule,
            reports_module_1.ReportsModule,
            ai_module_1.AiModule,
            audit_module_1.AuditModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map