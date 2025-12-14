"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const config_1 = require("@nestjs/config");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    constructor(configService) {
        super({
            datasources: {
                db: {
                    url: configService.get('DATABASE_URL'),
                },
            },
            log: configService.get('NODE_ENV') === 'development'
                ? ['query', 'info', 'warn', 'error']
                : ['warn', 'error'],
        });
        this.configService = configService;
    }
    async onModuleInit() {
        await this.$connect();
        this.$use(async (params, next) => {
            if (params.action === 'delete') {
                if (params.model === 'User' || params.model === 'Client') {
                    params.action = 'update';
                    params.args['data'] = { isActive: false };
                }
            }
            if (params.action === 'findMany') {
                if (params.model === 'User' || params.model === 'Client') {
                    if (params.args.where) {
                        if (params.args.where.isActive === undefined) {
                            params.args.where.isActive = true;
                        }
                    }
                    else {
                        params.args.where = { isActive: true };
                    }
                }
            }
            return next(params);
        });
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
    async cleanDatabase() {
        if (this.configService.get('NODE_ENV') === 'test') {
            const tablenames = await this.$queryRaw `SELECT tablename FROM pg_tables WHERE schemaname='public'`;
            const tables = tablenames
                .map(({ tablename }) => tablename)
                .filter((name) => name !== '_prisma_migrations')
                .map((name) => `"public"."${name}"`)
                .join(', ');
            try {
                await this.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
            }
            catch (error) {
                console.log({ error });
            }
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map