
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Modify this to match the user ID you are testing with. 
    // Since I just seeded, I'll fetch the first psychologist.
    const user = await prisma.user.findFirst({ where: { role: 'PSYCHOLOGIST' } });
    if (!user) {
        console.log("No psychologist found");
        return;
    }

    console.log(`Checking stats for user: ${user.email} (${user.id})`);

    const completedSessions = await prisma.session.findMany({
        where: { userId: user.id, status: 'COMPLETED' },
        select: {
            id: true,
            startTime: true,
            endTime: true,
            duration: true,
        }
    });

    console.log(`Found ${completedSessions.length} completed sessions.`);

    let totalCalculatedMinutes = 0;

    for (const s of completedSessions) {
        let mins = 0;
        if (s.duration && s.duration > 0) {
            mins = s.duration;
            console.log(`Session ${s.id}: Duration found in DB: ${mins} mins`);
        } else if (s.startTime && s.endTime) {
            const diffMs = new Date(s.endTime).getTime() - new Date(s.startTime).getTime();
            mins = Math.round(diffMs / 60000);
            console.log(`Session ${s.id}: Duration calculated from dates: ${mins} mins`);
        } else {
            console.log(`Session ${s.id}: No duration or dates.`);
        }
        totalCalculatedMinutes += mins;
    }

    const hours = Math.floor(totalCalculatedMinutes / 60);
    const minutes = totalCalculatedMinutes % 60;
    const formattedHours = `${hours}h ${minutes}m`;

    console.log('--- Result ---');
    console.log(`Total Minutes: ${totalCalculatedMinutes}`);
    console.log(`Formatted Output: ${formattedHours}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
