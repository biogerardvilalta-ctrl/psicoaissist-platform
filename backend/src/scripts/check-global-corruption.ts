
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkGlobalCorruption() {
    console.log('--- Checking Global client corruption (mock_key_id) ---');

    const count = await prisma.client.count({
        where: {
            encryptionKeyId: 'mock_key_id'
        }
    });

    console.log(`Found ${count} clients with 'mock_key_id'.`);

    if (count > 0) {
        const samples = await prisma.client.findMany({
            where: { encryptionKeyId: 'mock_key_id' },
            take: 5,
            select: { id: true, userId: true, createdAt: true }
        });
        console.log('Sample corrupted clients:', samples);
    }
}

checkGlobalCorruption()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
