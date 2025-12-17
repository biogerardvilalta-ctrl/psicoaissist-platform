import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.subscription.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});

  // Create users with hashed passwords
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@psychoai.com',
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      verified: true,
      firstName: 'Admin',
      lastName: 'PsychoAI',
      country: 'España',
      lastLogin: new Date(),
    },
  });

  const psychologist1 = await prisma.user.create({
    data: {
      email: 'dr.martinez@ejemplo.com',
      passwordHash: hashedPassword,
      role: UserRole.PSYCHOLOGIST,
      status: UserStatus.ACTIVE,
      verified: true,
      firstName: 'Ana',
      lastName: 'Martínez',
      phone: '+34600123456',
      country: 'España',
      professionalNumber: 'M-12345',
      speciality: 'Psicología Clínica',
      stripeCustomerId: 'cus_demo_ana_martinez',
      lastLogin: new Date(),
    },
  });

  const psychologist2 = await prisma.user.create({
    data: {
      email: 'dr.garcia@ejemplo.com',
      passwordHash: hashedPassword,
      role: UserRole.PSYCHOLOGIST,
      status: UserStatus.ACTIVE,
      verified: true,
      firstName: 'Carlos',
      lastName: 'García',
      phone: '+34600789012',
      country: 'España',
      professionalNumber: 'M-67890',
      speciality: 'Psicología Infantil',
      stripeCustomerId: 'cus_demo_carlos_garcia',
      lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    },
  });

  const student1 = await prisma.user.create({
    data: {
      email: 'estudiante@ejemplo.com',
      passwordHash: hashedPassword,
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      verified: true,
      firstName: 'María',
      lastName: 'López',
      phone: '+34600345678',
      country: 'España',
      speciality: 'Estudiante de Psicología',
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  });

  // Create subscriptions
  console.log('💳 Creating subscriptions...');
  await prisma.subscription.create({
    data: {
      userId: psychologist1.id,
      stripeSubscriptionId: 'sub_demo_ana_pro',
      status: 'active',
      planType: 'pro',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  await prisma.subscription.create({
    data: {
      userId: psychologist2.id,
      stripeSubscriptionId: 'sub_demo_carlos_basic',
      status: 'active',
      planType: 'basic',
      currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    },
  });

  // Create clients for psychologists (simplified for seed - using mock encrypted data)
  console.log('🧑‍⚕️ Creating clients...');
  const clients = [];

  // Mock encrypted data (in real app this would be properly encrypted)
  const mockEncryptedData = Buffer.from(JSON.stringify({
    firstName: 'Encrypted First Name',
    lastName: 'Encrypted Last Name',
    dateOfBirth: '1980-01-01',
    email: 'encrypted@example.com',
    phone: '+34600000000',
    address: 'Encrypted Address'
  }));

  // Clients for Ana (psychologist1)
  for (let i = 1; i <= 5; i++) {
    const client = await prisma.client.create({
      data: {
        userId: psychologist1.id,
        encryptedPersonalData: mockEncryptedData,
        tags: ['ansiedad', 'adulto'],
        riskLevel: 'LOW',
        isActive: true,
        encryptionKeyId: 'mock_key_id',
        dataVersion: 1,
        lastModifiedBy: psychologist1.id,
        firstSessionAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
      },
    });
    clients.push(client);
  }

  // Create some sessions
  console.log('📝 Creating sessions...');
  for (let i = 0; i < 3; i++) {
    await prisma.session.create({
      data: {
        userId: psychologist1.id,
        clientId: clients[i].id,
        startTime: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000), // Weekly sessions
        endTime: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000), // 50 minutes later
        duration: 50,
        sessionType: 'INDIVIDUAL',
        status: 'COMPLETED',
        encryptedNotes: Buffer.from(JSON.stringify({ notes: `Sesión ${i + 1} - Progreso notable` })),
        recordingConsent: true,
        audioQuality: 'HIGH',
      },
    });
  }

  // Create audit logs
  console.log('📊 Creating audit logs...');
  await prisma.auditLog.create({
    data: {
      userId: psychologist1.id,
      action: 'LOGIN',
      resourceType: 'User',
      resourceId: psychologist1.id,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      method: 'POST',
      url: '/auth/login',
      isSuccess: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: psychologist1.id,
      action: 'CREATE',
      resourceType: 'Client',
      resourceId: clients[0].id,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      method: 'POST',
      url: '/clients',
      newValues: { clientName: 'Demo Client 1' },
      isSuccess: true,
    },
  });

  console.log('✅ Database seed completed successfully!');
  console.log(`Created:`);
  console.log(`- 4 users (1 admin, 2 psychologists, 1 student)`);
  console.log(`- 2 subscriptions (1 pro, 1 basic)`);
  console.log(`- 5 clients for Ana`);
  console.log(`- 3 sessions for Ana`);
  console.log(`- 2 audit log entries`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });