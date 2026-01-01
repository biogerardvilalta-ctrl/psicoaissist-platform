
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listProUsersAndClients() {
    console.log('--- Listing Users with Pro/Pro+ Plans ---');

    const users = await prisma.user.findMany({
        where: {
            subscription: {
                is: {
                    planType: {
                        in: ['pro', 'PRO', 'Pro', 'premium', 'PREMIUM', 'premium_plus']
                    }
                }
            }
        },
        include: {
            subscription: true,
            clients: {
                select: {
                    id: true,
                    isActive: true,
                    riskLevel: true,
                    encryptionKeyId: true,
                }
            },
            encryptionKeys: {
                select: {
                    id: true,
                    isActive: true,
                    // createdAt: true // Optional
                }
            }
        }
    });

    for (const user of users) {
        console.log(`User: ${user.email} (${user.subscription?.planType})`);
        const activeClients = user.clients.filter(c => c.isActive);
        const userKeyIds = new Set(user.encryptionKeys.map(k => k.id));

        console.log(`  Total Clients: ${user.clients.length}`);
        console.log(`  Active Clients: ${activeClients.length}`);
        console.log(`  Total Encryption Keys: ${user.encryptionKeys.length}`);

        if (activeClients.length > 0) {
            console.log('  Active Clients Analysis:');

            let validCount = 0;
            let invalidCount = 0;

            activeClients.forEach(c => {
                const hasValidKey = userKeyIds.has(c.encryptionKeyId);
                if (hasValidKey) {
                    validCount++;
                    // console.log(`    [OK] Client ${c.id} - Key ${c.encryptionKeyId} FOUND`);
                } else {
                    invalidCount++;
                    console.log(`    [ERROR] Client ${c.id} - Key ${c.encryptionKeyId} NOT FOUND for user`);
                }
            });

            console.log(`  Summary: ${validCount} Decryptable, ${invalidCount} Non-Decryptable (Missing Key)`);
        }
        console.log('-----------------------------------');
    }
}

listProUsersAndClients()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
