import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const managers = await prisma.user.findMany({
        where: { role: 'AGENDA_MANAGER' },
        include: { managedProfessionals: true }
    });

    console.log('--- Agenda Managers ---');
    managers.forEach(m => {
        console.log(`ID: ${m.id} | Email: ${m.email} | Linked Pros: ${m.managedProfessionals.length}`);
        m.managedProfessionals.forEach(p => console.log(`  - Pro: ${p.firstName} ${p.lastName} (${p.email})`));
    });

    const pros = await prisma.user.findMany({
        where: { role: 'PSYCHOLOGIST' },
        take: 5
    });

    console.log('\n--- Available Professionals (Top 5) ---');
    pros.forEach(p => {
        console.log(`ID: ${p.id} | Email: ${p.email} | Name: ${p.firstName} ${p.lastName}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
