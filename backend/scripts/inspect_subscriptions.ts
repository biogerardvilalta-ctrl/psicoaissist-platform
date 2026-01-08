import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            email: true,
            role: true,
            subscription: {
                select: {
                    planType: true,
                    status: true
                }
            }
        }
    });

    console.log('User Subscriptions:');
    console.table(users.map(u => ({
        email: u.email,
        role: u.role,
        plan: u.subscription?.planType || 'NONE',
        status: u.subscription?.status || 'NONE'
    })));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
