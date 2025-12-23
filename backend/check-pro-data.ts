import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targetProId = 'cmjihih8p0001o22b2mdlhehl';

    const pro = await prisma.user.findUnique({ where: { id: targetProId } });
    if (!pro) {
        console.log('Professional not found!');
        return;
    }

    const sessionCount = await prisma.session.count({ where: { userId: targetProId } });
    const clientCount = await prisma.client.count({ where: { userId: targetProId } });

    console.log(`Professional: ${pro.firstName} ${pro.lastName} (${pro.email})`);
    console.log(`\n--- Data Stats ---`);
    console.log(`Sessions: ${sessionCount}`);
    console.log(`Clients:  ${clientCount}`);

    // Detail check
    const sessions = await prisma.session.findMany({
        where: { userId: targetProId },
        select: { startTime: true, status: true }
    });
    console.log('\n--- Session Dates ---');
    sessions.forEach(s => console.log(`${s.startTime.toISOString()} [${s.status}]`));

    const clients = await prisma.client.findMany({
        where: { userId: targetProId },
        select: { isActive: true, id: true } // Removed firstName as it might be encrypted/missing on schema
    });
    console.log('\n--- Clients ---');
    clients.forEach(c => console.log(`${c.id}: ${c.isActive ? 'Active' : 'Inactive'}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
