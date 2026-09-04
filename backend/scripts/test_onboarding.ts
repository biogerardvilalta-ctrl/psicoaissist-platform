import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No users found");
    return;
  }
  console.log("Testing with user:", user.email);

  try {
    const userId = user.id;
    const clientsCount = await prisma.client.count({ where: { userId, isActive: true } });
    const sessionsCount = await prisma.session.count({ where: { userId } });
    
    // Check if session started (IN_PROGRESS or COMPLETED)
    const hasStartedSession = await prisma.session.count({ 
      where: { 
        userId, 
        status: { in: ['IN_PROGRESS', 'COMPLETED'] as any } 
      } 
    }) > 0;
    
    // Check if recorded
    const hasRecording = await prisma.session.count({ 
      where: { 
        userId, 
        encryptedAudioPath: { not: null } 
      } 
    }) > 0;
    
    // Check if report generated
    const reportsCount = await prisma.report.count({ 
      where: { session: { userId } } 
    });

    console.log("Steps:");
    console.log("Clients:", clientsCount);
    console.log("Sessions:", sessionsCount);
    console.log("Started:", hasStartedSession);
    console.log("Recording:", hasRecording);
    console.log("Reports:", reportsCount);
  } catch (e) {
    console.error("ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
