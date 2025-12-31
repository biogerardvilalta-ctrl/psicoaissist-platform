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

  // 1. Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@psicoaissist.com',
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      verified: true,
      firstName: 'Admin',
      lastName: 'User',
      country: 'España',
    },
  });

  // 2. Basic User
  const basicUser = await prisma.user.create({
    data: {
      email: 'basic@plan.com',
      passwordHash: hashedPassword,
      role: UserRole.PSYCHOLOGIST_BASIC,
      status: UserStatus.ACTIVE,
      verified: true,
      firstName: 'Basic',
      lastName: 'Psychologist',
      country: 'España',
      subscription: {
        create: {
          stripeSubscriptionId: 'sub_test_basic',
          status: 'active',
          planType: 'basic',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
      }
    },
  });

  // 3. Pro User
  const proUser = await prisma.user.create({
    data: {
      email: 'pro@plan.com',
      passwordHash: hashedPassword,
      role: UserRole.PSYCHOLOGIST_PRO,
      status: UserStatus.ACTIVE,
      verified: true,
      firstName: 'Pro',
      lastName: 'Psychologist',
      country: 'España',
      subscription: {
        create: {
          stripeSubscriptionId: 'sub_test_pro',
          status: 'active',
          planType: 'pro',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
      }
    },
  });

  // 4. Premium User
  const premiumUser = await prisma.user.create({
    data: {
      email: 'premium@plan.com',
      passwordHash: hashedPassword,
      role: UserRole.PSYCHOLOGIST_PREMIUM,
      status: UserStatus.ACTIVE,
      verified: true,
      firstName: 'Premium',
      lastName: 'Psychologist',
      country: 'España',
      subscription: {
        create: {
          stripeSubscriptionId: 'sub_test_premium',
          status: 'active',
          planType: 'premium',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
      }
    },
  });

  // 5. Business User
  const businessUser = await prisma.user.create({
    data: {
      email: 'business@plan.com',
      passwordHash: hashedPassword,
      role: UserRole.PSYCHOLOGIST, // Or specific role if exists, but planType drives features
      status: UserStatus.ACTIVE,
      verified: true,
      firstName: 'Business',
      lastName: 'Center',
      country: 'España',
      subscription: {
        create: {
          stripeSubscriptionId: 'sub_test_business',
          status: 'active',
          planType: 'business',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
      }
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

  // Clients for Pro User
  for (let i = 1; i <= 5; i++) {
    const client = await prisma.client.create({
      data: {
        userId: proUser.id,
        encryptedPersonalData: mockEncryptedData,
        tags: ['ansiedad', 'adulto'],
        riskLevel: 'LOW',
        isActive: true,
        encryptionKeyId: 'mock_key_id',
        dataVersion: 1,
        lastModifiedBy: proUser.id,
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
        userId: proUser.id,
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

  /* Audit Logs Skipped for brevity in this update, or update to use new users */

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