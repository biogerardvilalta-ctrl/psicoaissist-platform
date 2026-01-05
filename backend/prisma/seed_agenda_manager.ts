import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting agenda manager seed...');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const now = new Date();

    // 1. Create/Update the Agenda Manager User
    console.log('Creating Agenda Manager: ger@ger.com');
    const agendaManager = await prisma.user.upsert({
        where: { email: 'ger@ger.com' },
        update: {
            role: UserRole.AGENDA_MANAGER,
            status: UserStatus.ACTIVE,
            verified: true,
            firstName: 'Ger',
            lastName: 'Manager',
        },
        create: {
            email: 'ger@ger.com',
            passwordHash: hashedPassword,
            role: UserRole.AGENDA_MANAGER,
            status: UserStatus.ACTIVE,
            verified: true,
            firstName: 'Ger',
            lastName: 'Manager',
            country: 'España',
        },
    });

    // 2. Define the professionals to manage
    const professionals = [
        { email: 'basic@plan.com', role: UserRole.PSYCHOLOGIST_BASIC, planType: 'basic', firstName: 'Basic' },
        { email: 'pro@plan.com', role: UserRole.PSYCHOLOGIST_PRO, planType: 'pro', firstName: 'Pro' },
        { email: 'premium@plan.com', role: UserRole.PSYCHOLOGIST_PREMIUM, planType: 'premium', firstName: 'Premium' },
    ];

    for (const pro of professionals) {
        console.log(`Ensuring professional exists: ${pro.email}`);

        const user = await prisma.user.upsert({
            where: { email: pro.email },
            update: {
                // Determine logic for updates if needed, primarily ensuring existance here
                role: pro.role, // Enforce role for this task context? Or just ensure existence. 
                // Let's safe update minimal fields to not break existing custom data if any, 
                // but for test env usually safe to enforce.
            },
            create: {
                email: pro.email,
                passwordHash: hashedPassword,
                role: pro.role,
                status: UserStatus.ACTIVE,
                verified: true,
                firstName: pro.firstName,
                lastName: 'User',
                country: 'España',
                // Add basic sub if newly created so they aren't broken
                subscription: {
                    create: {
                        stripeSubscriptionId: `sub_seed_${pro.planType}_${Date.now()}`,
                        status: 'active',
                        planType: pro.planType,
                        currentPeriodStart: now,
                        currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
                    }
                }
            },
        });

        console.log(`Linking ${pro.email} to Agenda Manager ${agendaManager.email}`);

        // Link them
        await prisma.user.update({
            where: { id: agendaManager.id },
            data: {
                managedProfessionals: {
                    connect: { id: user.id }
                }
            }
        });
    }

    console.log('✅ Agenda Manager seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding agenda manager:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
