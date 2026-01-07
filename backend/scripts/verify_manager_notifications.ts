
import { PrismaClient, SessionStatus } from '@prisma/client';
// Utilizing native fetch

async function main() {
    const prisma = new PrismaClient();
    const API_URL = 'http://localhost:3344/api/v1';

    const managerEmail = 'ger@ger.com';
    const proEmail = 'premium@plan.com';
    const cleanPassword = 'password123';

    console.log(`🔍 Preparing verification for Manager: ${managerEmail} and Pro: ${proEmail}`);

    // 1. Get Users
    const manager = await prisma.user.findUnique({ where: { email: managerEmail } });
    const pro = await prisma.user.findUnique({ where: { email: proEmail } });

    if (!manager || !pro) {
        console.error('❌ Users not found!');
        process.exit(1);
    }

    // 2. Ensure Link
    const isLinked = await prisma.user.findFirst({
        where: {
            id: manager.id,
            managedProfessionals: { some: { id: pro.id } }
        }
    });

    if (!isLinked) {
        console.log('🔗 Linking users...');
        await prisma.user.update({
            where: { id: manager.id },
            data: { managedProfessionals: { connect: { id: pro.id } } }
        });
    }

    // 3. Login as Manager
    console.log('🔑 Logging in as Manager...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: managerEmail, password: cleanPassword })
    });

    if (!loginRes.ok) {
        console.error('❌ Manager login failed');
        process.exit(1);
    }

    const { tokens } = await loginRes.json() as any;
    const token = tokens.accessToken;

    // 4. Create Session (As Manager for Pro)
    console.log('📅 Manager creating session for Pro...');
    const client = await prisma.client.findFirst({ where: { userId: pro.id } });
    if (!client) {
        console.error('❌ Pro has no clients to verify with.');
        process.exit(1);
    }

    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 24); // Tomorrow
    startTime.setMinutes(0, 0, 0);
    startTime.setMilliseconds(0);

    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

    console.log(`🧹 Cleaning up conflicts between ${startTime.toISOString()} and ${endTime.toISOString()}...`);
    // CLEANUP: Delete any overlapping sessions
    await prisma.session.deleteMany({
        where: {
            userId: pro.id,
            startTime: { lt: endTime },
            endTime: { gt: startTime }
        }
    });


    const createRes = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            professionalId: pro.id,
            clientId: client.id,
            startTime: startTime.toISOString(),
            sessionType: 'INDIVIDUAL',
            notes: 'Sesión creada por Ger'
        })
    });

    if (!createRes.ok) {
        console.error('❌ Failed to create session:', await createRes.text());
        process.exit(1);
    }

    const session = await createRes.json() as any;
    console.log(`✅ Session created (ID: ${session.id}). Notification should sent to Pro.`);

    // 5. Update Session (As Manager)
    console.log('✏️ Manager updating session...');
    const updateRes = await fetch(`${API_URL}/sessions/${session.id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            notes: 'Nota actualizada por Ger'
        })
    });

    if (updateRes.ok) {
        console.log(`✅ Session updated. Notification should sent to Pro.`);
    } else {
        console.error('❌ Update failed:', await updateRes.text());
    }

    // 6. Test Constraint: Complete Session (Manually in DB to simulate Pro action)
    console.log('🔄 Setting session to COMPLETED (db override)...');
    await prisma.session.update({
        where: { id: session.id },
        data: { status: SessionStatus.COMPLETED }
    });

    // 7. Try Delete Completed Session (As Manager) - Should Fail
    console.log('🗑️ Manager trying to delete COMPLETED session (Expect Fail)...');
    const deleteRes = await fetch(`${API_URL}/sessions/${session.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (deleteRes.status === 403) {
        console.log(`✅ CORRECT: Delete blocked with 403 Forbidden.`);
    } else if (deleteRes.ok) {
        console.error(`❌ FAILED: Delete was allowed!`);
    } else {
        console.log(`❓ Unexpected status: ${deleteRes.status}`);
    }

    await prisma.$disconnect();
}

main().catch(console.error);
