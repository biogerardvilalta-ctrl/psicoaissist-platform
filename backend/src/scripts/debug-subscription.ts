
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'basic@plan.com';
    const user = await prisma.user.findUnique({
        where: { email },
        include: { subscription: true },
    });

    if (!user) {
        console.log(`User ${email} not found`);
        return;
    }

    console.log('User found:', user.id);
    if (user.subscription) {
        console.log('Subscription:', JSON.stringify(user.subscription, null, 2));

        const start = new Date(user.subscription.currentPeriodStart);
        const end = new Date(user.subscription.currentPeriodEnd);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        console.log(`Duration in days: ${diffDays}`);
        console.log(`Is > 32 days? ${diffDays > 32}`);
    } else {
        console.log('No subscription found for user');
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
