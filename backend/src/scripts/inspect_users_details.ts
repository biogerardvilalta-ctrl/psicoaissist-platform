
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const emails = ['ger@ger.com', 'business@plan.com', 'pro@plan.com', 'basic@plan.com', 'premium@plan.com'];

    for (const email of emails) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { subscription: true }
        });

        if (user) {
            console.log(`\nEmail: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`Status: ${user.status}`);
            console.log(`Agenda Manager Enabled: ${user.agendaManagerEnabled}`);
            console.log(`Subscription:`, user.subscription ? user.subscription.status : 'None');
        } else {
            console.log(`\nUser not found: ${email}`);
        }
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
