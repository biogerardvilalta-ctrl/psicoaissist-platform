/**
 * Cleanup Test Users Script
 * Executa des del directori del servidor:
 *   cd /ruta-app/psicoaissist-platform/backend && node ../scripts/cleanup-test-users.js
 */

const path = require('path');
// Always load @prisma/client from backend/node_modules
const { PrismaClient } = require(path.join(__dirname, '../backend/node_modules/@prisma/client'));

const prisma = new PrismaClient();

const TEST_EMAIL_PATTERNS = [
  '@test.com',
  'testonboarding',
  'plan-demo@',
  'plan-basic@',
  'plan-pro@',
  'plan-trial',
  'plan-pro-referral',
  'stripe-',
];

async function main() {
  console.log('🔍 Buscant usuaris de test...');

  const orConditions = TEST_EMAIL_PATTERNS.map((pattern) => ({
    email: { contains: pattern },
  }));

  const testUsers = await prisma.user.findMany({
    where: { OR: orConditions },
    select: { id: true, email: true, createdAt: true },
  });

  if (testUsers.length === 0) {
    console.log('✅ Cap usuari de test trobat. La BD està neta!');
    return;
  }

  console.log(`⚠️  Trobats ${testUsers.length} usuaris de test:`);
  testUsers.forEach((u) => console.log(`   - ${u.email} (creat: ${u.createdAt.toISOString().slice(0, 10)})`));

  const ids = testUsers.map((u) => u.id);

  console.log('\n🗑️  Eliminant en cascada...');
  const audit    = await prisma.auditLog.deleteMany({ where: { userId: { in: ids } } });
  const notifs   = await prisma.notification.deleteMany({ where: { userId: { in: ids } } });
  const reports  = await prisma.report.deleteMany({ where: { userId: { in: ids } } });
  const sessions = await prisma.session.deleteMany({ where: { userId: { in: ids } } });
  const clients  = await prisma.client.deleteMany({ where: { userId: { in: ids } } });
  const subs     = await prisma.subscription.deleteMany({ where: { userId: { in: ids } } });
  const users    = await prisma.user.deleteMany({ where: { id: { in: ids } } });

  console.log(`✅ Eliminats:`);
  console.log(`   - ${users.count} usuaris`);
  console.log(`   - ${clients.count} clients`);
  console.log(`   - ${sessions.count} sessions`);
  console.log(`   - ${reports.count} informes`);
  console.log(`   - ${subs.count} subscripcions`);
  console.log(`   - ${notifs.count} notificacions`);
  console.log(`   - ${audit.count} logs d'auditoria`);
  console.log('\n🎉 BD neta!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
