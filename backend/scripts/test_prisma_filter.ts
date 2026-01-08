import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const plan = 'PRO'; // Testing uppercase input

    const where: any = {
        role: {
            notIn: ['ADMIN', 'SUPER_ADMIN']
        }
    };

    where.subscription = {
        planType: {
            equals: plan,
            mode: 'insensitive'
        },
        status: 'active',
    };

    console.log('Testing query with:', JSON.stringify(where, null, 2));

    const users = await prisma.user.findMany({
        where,
        select: { email: true, subscription: true }
    });

    console.log(`Found ${users.length} users:`);
    console.log(users);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
