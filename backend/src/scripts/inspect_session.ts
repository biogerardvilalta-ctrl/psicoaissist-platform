
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../common/prisma/prisma.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const prisma = app.get(PrismaService);
    const sessionId = "cmjcn21ig00033yt48vwlddc3";

    console.log(`--- INSPECTING SESSION ${sessionId} ---`);

    const session = await prisma.session.findUnique({
        where: { id: sessionId }
    });

    if (!session) {
        console.log("Session not found");
    } else {
        console.log("Status:", session.status);
        console.log("Encrypted Transcription Length:", session.encryptedTranscription?.length || 0);
        console.log("AI Metadata:", JSON.stringify(session.aiMetadata, null, 2));
    }

    await app.close();
}

bootstrap();
