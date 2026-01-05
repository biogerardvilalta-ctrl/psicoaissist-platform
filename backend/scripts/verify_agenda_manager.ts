import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Verifying Agenda Manager Setup...');
    let success = true;

    // 1. Verify Agenda Manager User
    const agendaManager = await prisma.user.findUnique({
        where: { email: 'ger@ger.com' },
        include: { managedProfessionals: true }
    });

    if (!agendaManager) {
        console.error('❌ User ger@ger.com not found!');
        success = false;
    } else {
        console.log('✅ User ger@ger.com found.');
        if (agendaManager.role !== 'AGENDA_MANAGER') {
            console.error(`❌ Incorrect role for ger@ger.com. Expected AGENDA_MANAGER, got ${agendaManager.role}`);
            success = false;
        } else {
            console.log('✅ Role is AGENDA_MANAGER.');
        }

        const expectedEmails = ['basic@plan.com', 'pro@plan.com', 'premium@plan.com'];
        const managedEmails = agendaManager.managedProfessionals.map(u => u.email).sort();

        console.log(`\n📋 Managed Professionals: ${managedEmails.join(', ')}`);

        const allFound = expectedEmails.every(email => managedEmails.includes(email));
        if (allFound && managedEmails.length === 3) {
            console.log('✅ All expected professionals are managed.');
        } else {
            console.error(`❌ Mismatch in managed professionals. Expected: ${expectedEmails.join(', ')}`);
            success = false;
        }
    }

    // 2. Verify from the professional's side
    console.log('\nChecking professionals side...');
    const users = await prisma.user.findMany({
        where: { email: { in: ['basic@plan.com', 'pro@plan.com', 'premium@plan.com'] } },
        include: { agendaManagers: true }
    });

    for (const u of users) {
        const hasManager = u.agendaManagers.some(m => m.email === 'ger@ger.com');
        if (hasManager) {
            console.log(`✅ User ${u.email} has ger@ger.com as manager.`);
        } else {
            console.error(`❌ User ${u.email} does NOT have ger@ger.com as manager.`);
            success = false;
        }
    }

    if (success) {
        console.log('\n✨ VERIFICATION PASSED!');
    } else {
        console.log('\n💥 VERIFICATION FAILED!');
        process.exit(1);
    }
}

main()
    .catch((e) => {
        console.error('❌ Error verifying:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
