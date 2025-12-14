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
exports.JwtConfigService = exports.JwtConfig = void 0;
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const config_2 = require("@nestjs/config");
exports.JwtConfig = (0, config_1.registerAs)('jwt', () => ({
    secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'psychologist-app',
    audience: process.env.JWT_AUDIENCE || 'psychologist-app-users',
}));
let JwtConfigService = class JwtConfigService {
    constructor(configService) {
        this.configService = configService;
    }
    createJwtOptions() {
        return {
            secret: this.configService.get('JWT_SECRET'),
            signOptions: {
                expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
            },
        };
    }
};
exports.JwtConfigService = JwtConfigService;
exports.JwtConfigService = JwtConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_2.ConfigService])
], JwtConfigService);
//# sourceMappingURL=jwt.config.js.map