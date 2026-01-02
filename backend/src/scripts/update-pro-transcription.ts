
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
    console.log(`Current Transcription: ${user.transcriptionMinutesUsed}`);

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            transcriptionMinutesUsed: 899,
        },
    });

    console.log(`Transcription minutes updated successfully to: ${updatedUser.transcriptionMinutesUsed}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
