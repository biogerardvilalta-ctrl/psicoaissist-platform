
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'dr.martinez@ejemplo.com';

    console.log(`Looking for user with email: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.error(`User with email ${email} not found.`);
        return;
    }

    console.log(`Found user: ${user.id} (${user.firstName} ${user.lastName})`);
    console.log('Starting data cleanup...');

    // 1. Delete Reports
    const deletedReports = await prisma.report.deleteMany({
        where: { userId: user.id },
    });
    console.log(`Deleted ${deletedReports.count} reports.`);

    // 2. Delete Sessions
    const deletedSessions = await prisma.session.deleteMany({
        where: { userId: user.id },
    });
    console.log(`Deleted ${deletedSessions.count} sessions.`);

    // 3. Delete Clients (Cascade should handle related Consents, but let's be safe and rely on cascade for those or manual if needed)
    // Note: Consents are related to Clients, and Client has onDelete: Cascade for User relation? 
    // Wait, Client has `userId` relation. 
    // Let's delete Clients directly.
    const deletedClients = await prisma.client.deleteMany({
        where: { userId: user.id },
    });
    console.log(`Deleted ${deletedClients.count} clients.`);

    // 4. Delete Encryption Keys (User specific)
    const deletedKeys = await prisma.encryptionKey.deleteMany({
        where: { userId: user.id },
    });
    console.log(`Deleted ${deletedKeys.count} encryption keys.`);

    // 5. Delete Audit Logs
    const deletedLogs = await prisma.auditLog.deleteMany({
        where: { userId: user.id },
    });
    console.log(`Deleted ${deletedLogs.count} audit logs.`);

    // 6. Delete Subscriptions? Maybe keep subscription logic or delete it? 
    // The user request was "vacies la base de datos... que no contenga nada" implies empty of content (patients, sessions).
    // Usually we might want to keep the subscription status if they paid, but "nothing" implies a fresh start.
    // Let's delete subscription too for a full "reset".
    const deletedSubs = await prisma.subscription.deleteMany({
        where: { userId: user.id },
    });
    console.log(`Deleted ${deletedSubs.count} subscriptions.`);

    console.log('Data reset complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
