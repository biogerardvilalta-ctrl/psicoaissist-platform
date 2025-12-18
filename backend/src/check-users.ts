
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking available users...");
    const users = await prisma.user.findMany({
        select: { id: true, email: true, role: true, firstName: true }
    });

    if (users.length === 0) {
        console.log("No users found in database.");
    } else {
        console.table(users);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
