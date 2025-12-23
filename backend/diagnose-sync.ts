
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

    console.log('--- DIAGNOSTIC START ---');

    // 1. Fetch last 5 sessions
    const sessions = await prisma.session.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            user: true,
            client: true
        }
    });

    console.log(`Found ${sessions.length} recent sessions:`);

    for (const session of sessions as any[]) {
        console.log(`\n[Session ID: ${session.id}]`);
        console.log(`  - Created At: ${session.createdAt.toISOString()}`);
        console.log(`  - Scheduled For: ${session.startTime.toISOString()}`);
        console.log(`  - Status: ${session.status}`);
        console.log(`  - Google Event ID: ${session.googleEventId || 'NULL (Not Synced)'}`);
        if (session.user) {
            console.log(`  - Professional (Owner): ${session.user.firstName} ${session.user.lastName} (${session.user.email})`);
            if (session.user.googleRefreshToken) {
                console.log(`  - ✅ Professional HAS Google Token`);
            } else {
                console.log(`  - ❌ Professional DOES NOT have Google Token (Sync impossible)`);
            }
        } else {
            console.log(`  - ❌ User/Professional NOT FOUND for this session`);
        }
    }

    // 2. Count total users with tokens
    const connectedUsers = await prisma.user.count({
        where: { googleRefreshToken: { not: null } }
    });
    console.log(`\nTotal users with Google Calendar connected: ${connectedUsers}`);

    console.log('--- DIAGNOSTIC END ---');

    await prisma.$disconnect();
}

run();
