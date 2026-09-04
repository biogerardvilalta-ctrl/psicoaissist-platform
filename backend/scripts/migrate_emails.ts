
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Starting user migration to PsychoAI...');

    // 1. Update Admin Email
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
                // Also update last name if it was the old brand
                lastName: oldAdmin.lastName === 'PsycoAI' ? 'PsychoAI' : oldAdmin.lastName
            }
        });
        console.log(`✅ Admin updated! Login with: ${newAdminEmail} / ${adminPassword}`);
    } else if (newAdmin) {
        console.log(`User ${newAdminEmail} already exists. Resetting password just in case...`);
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await prisma.user.update({
            where: { email: newAdminEmail },
            data: { passwordHash: hashedPassword }
        });
        console.log(`✅ Admin password reset! Login with: ${newAdminEmail} / ${adminPassword}`);
    } else {
        console.log('⚠️ No admin user found (neither old nor new). You might need to run the seed script.');
    }

    // 2. Search for any other psychoai.com or psycoai.com users to update?
    // For now, let's focus on the reported issue (Admin).

}

main()
    .catch(e => {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
