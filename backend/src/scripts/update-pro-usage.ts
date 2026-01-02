
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'pro@plan.com';

    console.log(`Searching for user ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.error(`User ${email} not found.`);
        process.exit(1);
    }

    console.log(`User found: ${user.id}`);
    console.log(`Current stats - Simulator: ${user.simulatorUsageCount}, Transcription: ${user.transcriptionMinutesUsed}`);

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            simulatorUsageCount: 5,
            transcriptionMinutesUsed: 899,
        },
    });

    console.log(`Usage updated successfully.`);
    console.log(`New stats - Simulator: ${updatedUser.simulatorUsageCount}, Transcription: ${updatedUser.transcriptionMinutesUsed}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
