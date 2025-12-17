"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Creating demo user...');
    const email = 'demo@demo.com';
    const password = 'password123';
    const professionalNumber = '12345';
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log('User already exists. Deleting...');
        await prisma.subscription.delete({ where: { userId: existing.id } }).catch(() => { });
        await prisma.user.delete({ where: { id: existing.id } });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            email,
            passwordHash: hashedPassword,
            role: client_1.UserRole.PSYCHOLOGIST,
            status: client_1.UserStatus.ACTIVE,
            verified: true,
            firstName: 'Demo',
            lastName: 'User',
            professionalNumber: professionalNumber,
            country: 'España',
            lastLogin: new Date(),
        }
    });
    console.log(`User created with ID: ${user.id}`);
    await prisma.subscription.create({
        data: {
            userId: user.id,
            stripeSubscriptionId: `sub_demo_${Date.now()}`,
            status: 'active',
            planType: 'pro',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
    });
    console.log('Subscription "pro" created.');
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=create_demo_user.js.map