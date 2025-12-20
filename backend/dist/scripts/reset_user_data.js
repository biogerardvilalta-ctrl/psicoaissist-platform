"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
    const deletedReports = await prisma.report.deleteMany({
        where: { userId: user.id },
    });
    console.log(`Deleted ${deletedReports.count} reports.`);
    const deletedSessions = await prisma.session.deleteMany({
        where: { userId: user.id },
    });
    console.log(`Deleted ${deletedSessions.count} sessions.`);
    const deletedClients = await prisma.client.deleteMany({
        where: { userId: user.id },
    });
    console.log(`Deleted ${deletedClients.count} clients.`);
    const deletedKeys = await prisma.encryptionKey.deleteMany({
        where: { userId: user.id },
    });
    console.log(`Deleted ${deletedKeys.count} encryption keys.`);
    const deletedLogs = await prisma.auditLog.deleteMany({
        where: { userId: user.id },
    });
    console.log(`Deleted ${deletedLogs.count} audit logs.`);
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
//# sourceMappingURL=reset_user_data.js.map