"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const prisma_service_1 = require("../common/prisma/prisma.service");
const encryption_service_1 = require("../modules/encryption/encryption.service");
const reminders_service_1 = require("../modules/reminders/reminders.service");
const client_1 = require("@prisma/client");
async function bootstrap() {
    console.log('--- Starting Manual Reminder Test ---');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const prisma = app.get(prisma_service_1.PrismaService);
    const encryption = app.get(encryption_service_1.EncryptionService);
    const remindersService = app.get(reminders_service_1.RemindersService);
    let user = await prisma.user.findFirst({ where: { email: 'dr.martinez@ejemplo.com' } });
    if (!user) {
        user = await prisma.user.findFirst({ where: { email: 'admin@psychoai.com' } });
    }
    if (!user) {
        throw new Error('User not found');
    }
    console.log(`✅ User found: ${user.email} (${user.id})`);
    await prisma.user.update({
        where: { id: user.id },
        data: { enableReminders: true }
    });
    console.log('✅ User reminders enabled.');
    const clientData = {
        firstName: 'Ger',
        lastName: 'Vil',
        email: 'biogerardvilalta@gmail.com',
        phone: '+34658792906',
    };
    const encrypted = await encryption.encryptData(clientData, user.id);
    const packedData = Buffer.concat([
        Buffer.from(encrypted.iv, 'base64'),
        Buffer.from(encrypted.tag, 'base64'),
        encrypted.encryptedData
    ]);
    const client = await prisma.client.create({
        data: {
            userId: user.id,
            encryptedPersonalData: packedData,
            encryptionKeyId: encrypted.keyId,
            tags: ['test-manual'],
            riskLevel: 'LOW',
            sendEmailReminders: true,
            sendWhatsappReminders: true,
            lastModifiedBy: user.id
        }
    });
    console.log(`✅ Client created: ${client.id} (Ger Vil)`);
    const now = new Date();
    const sessionDate = new Date(now);
    sessionDate.setDate(sessionDate.getDate() + 1);
    sessionDate.setHours(15, 0, 0, 0);
    const session = await prisma.session.create({
        data: {
            userId: user.id,
            clientId: client.id,
            startTime: sessionDate,
            endTime: new Date(sessionDate.getTime() + 60 * 60 * 1000),
            status: client_1.SessionStatus.SCHEDULED,
            sessionType: client_1.SessionType.INDIVIDUAL,
            reminderSent: false,
        }
    });
    console.log(`✅ Session created: ${session.id} for ${sessionDate.toISOString()}`);
    console.log('🚀 Triggering Reminders Cron logic...');
    await remindersService.handleCron();
    console.log('--- Test Completed ---');
    await app.close();
}
bootstrap().catch(err => {
    console.error('Error during test:', err);
    process.exit(1);
});
//# sourceMappingURL=test-reminder.js.map