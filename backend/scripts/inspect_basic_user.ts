
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'basic@plan.com';
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            subscription: true,
            agendaManagers: true, // Correct relation name
            managedProfessionals: true, // Correct inverse relation
        }
    });

    if (!user) {
        console.log(`User ${email} not found`);
        return;
    }

    console.log('User Data:', JSON.stringify(user, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
