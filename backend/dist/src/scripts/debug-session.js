"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const prisma_service_1 = require("../common/prisma/prisma.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const prisma = app.get(prisma_service_1.PrismaService);
    const userId = "cmj936enn00007m2jt8rvxmqb";
    console.log(`--- INSPECTING SESSIONS FOR USER ${userId} ---`);
    const sessions = await prisma.session.findMany({
        where: {
            userId,
            startTime: {
                gte: new Date('2026-01-01'),
                lt: new Date('2027-01-01')
            }
        },
        orderBy: { startTime: 'asc' }
    });
    console.log(`Found ${sessions.length} sessions in 2026.`);
    for (const s of sessions) {
        console.log(`\nID: ${s.id}`);
        console.log(`Date: ${s.startTime}`);
        console.log(`Encrypted Notes Length: ${s.encryptedNotes?.length || 0}`);
        console.log(`Encrypted Transcription Length: ${s.encryptedTranscription?.length || 0}`);
    }
    await app.close();
}
bootstrap();
//# sourceMappingURL=debug-session.js.map