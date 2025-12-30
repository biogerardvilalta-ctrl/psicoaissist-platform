
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Deletion Verification ---');

    // 1. Get or Create a Test User (Psychologist Role)
    let user = await prisma.user.findFirst({
        where: { email: 'test_deletion@example.com' }
    });

    if (!user) {
        console.log('Creating test user...');
        user = await prisma.user.create({
            data: {
                email: 'test_deletion@example.com',
                passwordHash: 'dummy',
                role: 'PSYCHOLOGIST',
                firstName: 'Test',
                lastName: 'User'
            }
        });
    }
    console.log(`User ID: ${user.id}`);

    // 2. Create a Client
    console.log('Creating test client...');
    const client = await prisma.client.create({
        data: {
            user: { connect: { id: user.id } },
            encryptedPersonalData: Buffer.from('dummy'),
            encryptionKeyId: 'dummy_key',
            riskLevel: 'LOW',
            isActive: true,
            lastModifiedBy: user.id,
        }
    });

    console.log(`Client created. ID: ${client.id}`);

    // 3. Verify existence
    let check = await prisma.client.findUnique({ where: { id: client.id } });
    if (!check) throw new Error('Client creation failed');
    console.log('Client verified in DB.');

    // 4. Test "Soft Delete" (Archive)
    console.log('Testing Soft Delete (Archive)...');
    await prisma.client.update({
        where: { id: client.id },
        data: { isActive: false }
    });

    check = await prisma.client.findUnique({ where: { id: client.id } });
    if (!check) throw new Error('Client missing after soft delete?');
    if (check.isActive) throw new Error('Client still active after soft delete');
    console.log('Soft delete successful (isActive=false).');

    // 5. Test "Hard Delete" (Permanent)
    console.log('Testing Hard Delete...');
    await prisma.client.delete({
        where: { id: client.id }
    });

    check = await prisma.client.findUnique({ where: { id: client.id } });
    if (check) throw new Error('Client STILL EXISTS after delete!');

    console.log('Hard delete successful. Client is gone.');

    // Clean up user
    await prisma.user.delete({ where: { id: user.id } });
    console.log('Cleanup done.');
}

main()
    .catch(e => {
        console.error('ERROR:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
