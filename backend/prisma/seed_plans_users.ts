import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting plan users seed...');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const plans = [
        {
            email: 'basic@plan.com',
            firstName: 'Basic',
            lastName: 'User',
            planType: 'basic',
            role: UserRole.PSYCHOLOGIST,
            stripeCustomerSuffix: 'basic',
        },
        {
            email: 'pro@plan.com',
            firstName: 'Pro',
            lastName: 'User',
            planType: 'pro',
            role: UserRole.PSYCHOLOGIST,
            stripeCustomerSuffix: 'pro',
        },
        {
            email: 'premium@plan.com',
            firstName: 'Premium',
            lastName: 'User',
            planType: 'premium_plus',
            role: UserRole.PSYCHOLOGIST,
            stripeCustomerSuffix: 'premium',
        },
        {
            email: 'business@plan.com',
            firstName: 'Business',
            lastName: 'User',
            planType: 'business',
            role: UserRole.PSYCHOLOGIST, // Using PSYCHOLOGIST as base role
            stripeCustomerSuffix: 'business',
        },
    ];

    for (const p of plans) {
        console.log(`Processing ${p.email}...`);

        // Create or Update User
        const user = await prisma.user.upsert({
            where: { email: p.email },
            update: {
                passwordHash: hashedPassword,
                role: p.role,
                status: UserStatus.ACTIVE,
                verified: true,
                firstName: p.firstName,
                lastName: p.lastName,
            },
            create: {
                email: p.email,
                passwordHash: hashedPassword,
                role: p.role,
                status: UserStatus.ACTIVE,
                verified: true,
                firstName: p.firstName,
                lastName: p.lastName,
                country: 'España',
                stripeCustomerId: `cus_demo_${p.stripeCustomerSuffix}`,
                lastLogin: now,
            },
        });

        // Create or Update Subscription
        // Check if subscription exists
        const existingSub = await prisma.subscription.findUnique({
            where: { userId: user.id },
        });

        if (existingSub) {
            await prisma.subscription.update({
                where: { id: existingSub.id },
                data: {
                    planType: p.planType,
                    status: 'active',
                    currentPeriodStart: now,
                    currentPeriodEnd: thirtyDaysLater,
                    updatedAt: now,
                },
            });
            console.log(`Updated subscription for ${p.email}`);
        } else {
            await prisma.subscription.create({
                data: {
                    userId: user.id,
                    stripeSubscriptionId: `sub_demo_${p.stripeCustomerSuffix}_${Date.now()}`,
                    status: 'active',
                    planType: p.planType,
                    currentPeriodStart: now,
                    currentPeriodEnd: thirtyDaysLater,
                },
            });
            console.log(`Created subscription for ${p.email}`);
        }
    }

    console.log('✅ Plan users seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding plan users:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
