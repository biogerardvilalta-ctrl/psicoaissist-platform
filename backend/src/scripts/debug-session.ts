
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../common/prisma/prisma.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const prisma = app.get(PrismaService);
    const userId = "cmj936enn00007m2jt8rvxmqb";

    console.log(`--- INSPECTING SESSIONS FOR USER ${userId} ---`);

    // Look for sessions in 2026
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

        // If length is 0, that's the problem!
    }

    await app.close();
}

bootstrap();
