
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'premium@plan.com';
    console.log(`Updating usage for user: ${email}...`);

    try {
        const user = await prisma.user.update({
            where: { email },
            data: {
                transcriptionMinutesUsed: 2999,
            },
        });

        console.log(`Successfully updated user ${email}.`);
        console.log(`New transcriptionMinutesUsed: ${user.transcriptionMinutesUsed}`);
    } catch (error) {
        console.error(`Error updating user ${email}:`, error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
