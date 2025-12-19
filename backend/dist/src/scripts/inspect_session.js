"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const prisma_service_1 = require("../common/prisma/prisma.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const prisma = app.get(prisma_service_1.PrismaService);
    const sessionId = "cmjcn21ig00033yt48vwlddc3";
    console.log(`--- INSPECTING SESSION ${sessionId} ---`);
    const session = await prisma.session.findUnique({
        where: { id: sessionId }
    });
    if (!session) {
        console.log("Session not found");
    }
    else {
        console.log("Status:", session.status);
        console.log("Encrypted Transcription Length:", session.encryptedTranscription?.length || 0);
        console.log("AI Metadata:", JSON.stringify(session.aiMetadata, null, 2));
    }
    await app.close();
}
bootstrap();
//# sourceMappingURL=inspect_session.js.map