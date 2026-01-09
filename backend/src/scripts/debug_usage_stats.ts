import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStats() {
    console.log('🔍 Checking User vs Session Stats...');

    // 1. Get Total from Users
    const userStats = await prisma.user.aggregate({
        _sum: {
            transcriptionMinutesUsed: true
        }
    });
    console.log(`\n👥 Total User.transcriptionMinutesUsed: ${userStats._sum.transcriptionMinutesUsed}`);

    // 2. Get Total from Sessions (All Time)
    const allSessions = await prisma.session.findMany({
        where: {
            encryptedTranscription: { not: null } // Just check for existence
        },
        select: {
            duration: true,
            encryptedTranscription: true
        }
    });

    // Filter manually to be sure about null check
    const transcribedSessions = allSessions.filter(s => s.encryptedTranscription !== null);
    const totalDurationSeconds = transcribedSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalDurationMinutes = totalDurationSeconds / 60;

    console.log(`\n📅 Total Session Duration (Transcribed): ${totalDurationMinutes.toFixed(2)} minutes`);
    console.log(`   Count: ${transcribedSessions.length}`);

    // 3. Check for specific sessions that might be missing 'encryptedTranscription' but have duration?
    // Maybe the `encryptedTranscription` check is too strict if we store it differently?
    // Let's check sessions with duration > 0
    const allSessionsWithDuration = await prisma.session.findMany({
        where: {
            duration: { gt: 0 }
        },
        select: {
            id: true,
            duration: true,
            encryptedTranscription: true
        }
    });

    const totalAllDurationMinutes = allSessionsWithDuration.reduce((acc, s) => acc + (s.duration || 0), 0) / 60;
    console.log(`\n⏱️ Total Session Duration (All > 0): ${totalAllDurationMinutes.toFixed(2)} minutes`);
    console.log(`   Count: ${allSessionsWithDuration.length}`);

    // Check how many have duration but NO transcription
    const durationNoTrans = allSessionsWithDuration.filter(s => s.encryptedTranscription === null);
    console.log(`   Sessions with Duration but NO Transcription: ${durationNoTrans.length}`);

    // 4. Check top users
    console.log('\n🏆 Top 5 Users by Transcription Usage:');
    const topUsers = await prisma.user.findMany({
        orderBy: { transcriptionMinutesUsed: 'desc' },
        take: 5,
        select: { email: true, transcriptionMinutesUsed: true }
    });
    console.table(topUsers);
}

checkStats()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
