import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Enabling Agenda Manager feature for test users...');

    const emails = ['basic@plan.com', 'pro@plan.com', 'premium@plan.com'];

    const result = await prisma.user.updateMany({
        where: { email: { in: emails } },
        data: { agendaManagerEnabled: true }
    });

    console.log(`✅ Updated ${result.count} users.`);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
