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
var RemindersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const encryption_service_1 = require("../encryption/encryption.service");
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
let RemindersService = RemindersService_1 = class RemindersService {
    constructor(prisma, emailService, encryption) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.encryption = encryption;
        this.logger = new common_1.Logger(RemindersService_1.name);
    }
    async handleCron() {
        this.logger.debug('Checking for upcoming sessions to remind...');
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const sessions = await this.prisma.session.findMany({
            where: {
                status: client_1.SessionStatus.SCHEDULED,
                reminderSent: false,
                startTime: {
                    gte: now,
                    lte: tomorrow
                }
            },
            include: {
                user: true,
                client: true
            }
        });
        this.logger.debug(`Found ${sessions.length} sessions to remind.`);
        for (const session of sessions) {
            try {
                if (!session.user.enableReminders) {
                    continue;
                }
                let clientName = 'Paciente';
                let clientEmail = '';
                let clientPhone = '';
                if (session.client.encryptedPersonalData && session.client.encryptionKeyId) {
                    try {
                        const unpacked = this.unpackClientData(session.client.encryptedPersonalData, session.client.encryptionKeyId);
                        const result = await this.encryption.decryptData(unpacked);
                        if (result.success && result.data) {
                            clientName = `${result.data.firstName} ${result.data.lastName}`;
                            clientEmail = result.data.email;
                            clientPhone = result.data.phone;
                        }
                    }
                    catch (e) {
                        this.logger.error(`Failed to decrypt client for session ${session.id}`, e);
                    }
                }
                const dateStr = (0, date_fns_1.format)(session.startTime, "EEEE d 'de' MMMM", { locale: locale_1.es });
                const timeStr = (0, date_fns_1.format)(session.startTime, "HH:mm");
                await this.emailService.sendSessionReminder(session.user.email, {
                    clientName,
                    date: dateStr,
                    time: timeStr,
                    type: session.sessionType
                });
                if (session.client.sendEmailReminders && clientEmail) {
                    this.logger.log(`📧 Sending Reminder Email to Client ${clientName} (${clientEmail})`);
                }
                if (session.client.sendWhatsappReminders && clientPhone) {
                    this.logger.log(`📱 Sending Whatsapp Reminder to Client ${clientName} (${clientPhone})`);
                }
                await this.prisma.session.update({
                    where: { id: session.id },
                    data: { reminderSent: true }
                });
                this.logger.log(`Reminder processed for session ${session.id}`);
            }
            catch (error) {
                this.logger.error(`Failed to process reminder for session ${session.id}`, error);
            }
        }
    }
    unpackClientData(buffer, keyId) {
        const iv = buffer.subarray(0, 16).toString('base64');
        const tag = buffer.subarray(16, 32).toString('base64');
        const encryptedData = buffer.subarray(32);
        return { iv, tag, encryptedData, keyId };
    }
};
exports.RemindersService = RemindersService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RemindersService.prototype, "handleCron", null);
exports.RemindersService = RemindersService = RemindersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        encryption_service_1.EncryptionService])
], RemindersService);
//# sourceMappingURL=reminders.service.js.map