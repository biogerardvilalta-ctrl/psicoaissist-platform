import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { email: { contains: 'martinez', mode: 'insensitive' } },
                    { firstName: { contains: 'martinez', mode: 'insensitive' } },
                    { lastName: { contains: 'martinez', mode: 'insensitive' } },
                ]
            },
            include: { subscription: true }
        });

        if (users.length === 0) {
            console.log('No users found matching "martinez"');
            return;
        }

        // Pick the most likely one or list them
        const targetUser = users[0];
        console.log(`Found user: ${targetUser.email} (${targetUser.id})`);
        console.log(`Current Plan: ${targetUser.subscription?.planType || 'None'}`);
        console.log(`Current Status: ${targetUser.subscription?.status || 'None'}`);

        // Update or Create Subscription
        if (targetUser.subscription) {
            console.log(`Updating existing subscription for user ${targetUser.id}...`);
            await prisma.subscription.update({
                where: { userId: targetUser.id },
                data: {
                    planType: 'pro',
                    status: 'active',
                    currentPeriodEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 10)) // 10 years
                }
            });
        } else {
            console.log(`Creating new subscription for user ${targetUser.id}...`);
            const dummyStripeId = `sub_manual_${Date.now()}`;
            await prisma.subscription.create({
                data: {
                    userId: targetUser.id,
                    planType: 'pro',
                    status: 'active',
                    stripeSubscriptionId: dummyStripeId,
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 10))
                }
            });
        }

        console.log('✅ User updated to PRO plan successfully.');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
