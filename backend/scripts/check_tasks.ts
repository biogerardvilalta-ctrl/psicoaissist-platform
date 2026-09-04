
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tasks = await prisma.adminTask.findMany({
        where: { type: 'ONBOARDING_SETUP' },
        include: { user: true }
    });

    console.log('--- Found Tasks ---');
    console.log(JSON.stringify(tasks, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
