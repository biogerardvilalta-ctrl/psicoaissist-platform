
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
    const user = await prisma.user.findUnique({
        where: { email: 'premium@plan.com' },
        select: {
            id: true,
            email: true,
            simulatorUsageCount: true,
            simulatorWarningSent: true,
            subscription: true
        }
    });

    console.log(JSON.stringify(user, null, 2));
}

checkUser()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
