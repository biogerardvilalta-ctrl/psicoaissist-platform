
import { PrismaService } from './src/common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

class MockConfigService extends ConfigService {
    get(key: string) {
        return process.env[key];
    }
}

async function run() {
    const config = new MockConfigService();
    const prisma = new PrismaService(config);

    console.log('Fetching latest session...');
    const session = await prisma.session.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { id: true, createdAt: true, googleEventId: true, userId: true }
    });

    if (session) {
        console.log('Latest Session:', session);

        // Check user tokens too
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { email: true, googleRefreshToken: true }
        });
        console.log('User associated:', user?.email, 'Has Token:', !!user?.googleRefreshToken);
    } else {
        console.log('No sessions found.');
    }

    await prisma.$disconnect();
}

run();
