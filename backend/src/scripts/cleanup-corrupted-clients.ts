
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupCorruptedClients() {
    console.log('--- Cleaning up Corrupted Clients ---');

    // Find clients with 'mock_key_id'
    const corruptedClients = await prisma.client.findMany({
        where: {
            encryptionKeyId: 'mock_key_id'
        }
    });

    console.log(`Found ${corruptedClients.length} corrupted clients with mock_key_id.`);

    if (corruptedClients.length > 0) {
        console.log('Deleting corrupted clients...');
        const result = await prisma.client.deleteMany({
            where: {
                encryptionKeyId: 'mock_key_id'
            }
        });
        console.log(`Deleted ${result.count} clients.`);
    } else {
        console.log('No corrupted clients found.');
    }
}

cleanupCorruptedClients()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
