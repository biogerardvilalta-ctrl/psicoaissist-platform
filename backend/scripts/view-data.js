const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function viewData() {
  console.log('📊 DATOS EN LA BASE DE DATOS\n');

  // Users
  console.log('👥 USUARIOS:');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
  console.table(users);

  // Subscriptions
  console.log('\n💳 SUSCRIPCIONES:');
  const subscriptions = await prisma.subscription.findMany({
    select: {
      id: true,
      planType: true,
      status: true,
      currentPeriodStart: true,
      currentPeriodEnd: true,
      user: {
        select: {
          email: true,
          firstName: true,
        },
      },
    },
  });
  console.table(subscriptions);

  // Clients
  console.log('\n🧑‍⚕️ CLIENTES:');
  const clients = await prisma.client.findMany({
    select: {
      id: true,
      tags: true,
      riskLevel: true,
      isActive: true,
      createdAt: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });
  console.table(clients);

  // Sessions
  console.log('\n📝 SESIONES:');
  const sessions = await prisma.session.findMany({
    select: {
      id: true,
      startTime: true,
      endTime: true,
      duration: true,
      sessionType: true,
      status: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });
  console.table(sessions);

  await prisma.$disconnect();
}

viewData().catch(console.error);