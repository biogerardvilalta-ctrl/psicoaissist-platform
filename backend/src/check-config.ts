
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst();
    if (user) {
        console.log('User ID:', user.id);
        console.log('Schedule Config:', JSON.stringify(user.scheduleConfig, null, 2));
    } else {
        console.log('No user found');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
