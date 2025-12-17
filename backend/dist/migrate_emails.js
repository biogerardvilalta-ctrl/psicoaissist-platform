"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🔄 Starting user migration to PsychoAI...');
    const oldAdminEmail = 'admin@psycoai.com';
    const newAdminEmail = 'admin@psychoai.com';
    const adminPassword = 'admin123';
    const oldAdmin = await prisma.user.findUnique({ where: { email: oldAdminEmail } });
    const newAdmin = await prisma.user.findUnique({ where: { email: newAdminEmail } });
    if (oldAdmin) {
        console.log(`Found user with old email: ${oldAdminEmail}. Updating to ${newAdminEmail}...`);
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await prisma.user.update({
            where: { email: oldAdminEmail },
            data: {
                email: newAdminEmail,
                passwordHash: hashedPassword,
                lastName: oldAdmin.lastName === 'PsycoAI' ? 'PsychoAI' : oldAdmin.lastName
            }
        });
        console.log(`✅ Admin updated! Login with: ${newAdminEmail} / ${adminPassword}`);
    }
    else if (newAdmin) {
        console.log(`User ${newAdminEmail} already exists. Resetting password just in case...`);
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await prisma.user.update({
            where: { email: newAdminEmail },
            data: { passwordHash: hashedPassword }
        });
        console.log(`✅ Admin password reset! Login with: ${newAdminEmail} / ${adminPassword}`);
    }
    else {
        console.log('⚠️ No admin user found (neither old nor new). You might need to run the seed script.');
    }
}
main()
    .catch(e => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
})
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=migrate_emails.js.map