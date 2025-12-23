
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'ger@ger.com';
    console.log(`Checking user: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            managedProfessionals: true,
            createdUsers: true,
            createdBy: true,
        }
    });

    if (!user) {
        console.log('User NOT FOUND');
    } else {
        console.log('User FOUND:');
        console.log(`ID: ${user.id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Status: ${user.status}`);
        console.log(`PasswordHash Length: ${user.passwordHash?.length}`);
        console.log(`Created By: ${user.createdById}`);
        console.log(`Managed Professionals: ${user.managedProfessionals.length}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
