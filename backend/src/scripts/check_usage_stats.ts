
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectUsage() {
    console.log('Inspecting usage stats...');

    const users = await prisma.user.findMany({
        select: {
            email: true,
            transcriptionMinutesUsed: true,
            simulatorUsageCount: true,
        },
        where: {
            OR: [
                { transcriptionMinutesUsed: { gt: 0 } },
                { simulatorUsageCount: { gt: 0 } }
            ]
        }
    });

    console.log('Users with non-zero usage:', users);

    const aggregate = await prisma.user.aggregate({
        _sum: {
            transcriptionMinutesUsed: true,
            simulatorUsageCount: true
        }
    });

    console.log('Aggregation result:', aggregate);
}

inspectUsage()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
