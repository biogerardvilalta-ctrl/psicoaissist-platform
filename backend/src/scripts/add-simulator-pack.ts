
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'pro@plan.com';
    const packSize = 5;

    console.log(`Searching for user: ${email}...`);
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.error(`User with email ${email} not found.`);
        process.exit(1);
    }

    console.log(`Current Extra Cases: ${user.extraSimulatorCases}`);
    console.log(`Adding ${packSize} extra cases...`);

    const updatedUser = await prisma.user.update({
        where: { email },
        data: {
            extraSimulatorCases: { increment: packSize },
        },
    });

    console.log(`Successfully added pack to user.`);
    console.log(`New Extra Cases Balance: ${updatedUser.extraSimulatorCases}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
