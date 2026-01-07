
import { PrismaClient } from '@prisma/client';
// Utilizing native fetch

async function main() {
    const prisma = new PrismaClient();
    const API_URL = 'http://localhost:3001/api/v1';

    const email = 'basic@plan.com';
    const password = 'password123';

    console.log(`🔄 Authenticating as ${email}...`);

    // 1. Login to get token
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!loginRes.ok) {
        console.error('❌ Login failed:', await loginRes.text());
        process.exit(1);
    }

    const loginData: any = await loginRes.json();
    const token = loginData.tokens?.accessToken;
    const userId = loginData.user.id;

    console.log(`✅ Login successful for ${userId}. Token obtained.`);

    // 2. Trigger Simulation
    console.log('⚡ Triggering simulation endpoint...');
    const simRes = await fetch(`${API_URL}/payments/simulate-success`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
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
