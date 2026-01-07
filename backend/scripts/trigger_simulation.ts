
import { PrismaClient } from '@prisma/client';
// Utilizing native fetch

async function main() {
    const prisma = new PrismaClient();
    const API_URL = 'http://localhost:3001/api/v1';

    const targetEmail = 'basic@plan.com';
    console.log(`🔍 Looking for user: ${targetEmail}...`);

    const user = await prisma.user.findUnique({
        where: { email: targetEmail }
    });

    if (!user) {
        console.error('❌ User not found!');
        process.exit(1);
    }

    console.log(`✅ Found user: ${user.id}`);
    console.log('⚡ Triggering simulation endpoint...');

    // Using native fetch
    const simRes = await fetch(`${API_URL}/payments/simulate-success`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id })
    });

    if (simRes.ok) {
        const simData = await simRes.json();
        console.log('✅ Simulation triggered successfully!');
        console.log('RESPONSE:', simData);
    } else {
        console.error('❌ Simulation trigger failed:', await simRes.text());
    }

    await prisma.$disconnect();
}

main().catch(err => console.error(err));
