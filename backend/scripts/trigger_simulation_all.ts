
import { PrismaClient } from '@prisma/client';
// Utilizing native fetch

async function main() {
    const prisma = new PrismaClient();
    const API_URL = 'http://localhost:3001/api/v1';

    console.log('🔄 Fetching all users...');
    const users = await prisma.user.findMany({
        select: { id: true, email: true, firstName: true }
    });

    console.log(`📋 Found ${users.length} users. Triggering simulation for each...`);

    for (const user of users) {
        console.log(`👉 Triggering for ${user.firstName} (${user.email})...`);
        try {
            const res = await fetch(`${API_URL}/payments/simulate-success`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });

            if (res.ok) {
                console.log(`   ✅ Success!`);
            } else {
                console.log(`   ❌ Failed: ${res.status} ${res.statusText}`);
                console.log(`      ${await res.text()}`);
            }
        } catch (e) {
            console.log(`   ❌ Error: ${e.message}`);
        }
    }

    await prisma.$disconnect();
}

main();
