
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'basic@plan.com';

    const user = await prisma.user.update({
        where: { email },
        data: {
            agendaManagerEnabled: false
        }
    });

    console.log(`Updated user ${email}: agendaManagerEnabled = ${user.agendaManagerEnabled}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
