"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    console.log('🧹 Cleaning existing data...');
    await prisma.subscription.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@psycoai.com',
            passwordHash: hashedPassword,
            role: client_1.UserRole.ADMIN,
            status: client_1.UserStatus.ACTIVE,
            verified: true,
            firstName: 'Admin',
            lastName: 'PsycoAI',
            country: 'España',
            lastLogin: new Date(),
        },
    });
    const psychologist1 = await prisma.user.create({
        data: {
            email: 'dr.martinez@ejemplo.com',
            passwordHash: hashedPassword,
            role: client_1.UserRole.PSYCHOLOGIST,
            status: client_1.UserStatus.ACTIVE,
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
            role: client_1.UserRole.PSYCHOLOGIST,
            status: client_1.UserStatus.ACTIVE,
            verified: true,
            firstName: 'Carlos',
            lastName: 'García',
            phone: '+34600789012',
            country: 'España',
            professionalNumber: 'M-67890',
            speciality: 'Psicología Infantil',
            stripeCustomerId: 'cus_demo_carlos_garcia',
            lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
    });
    const student1 = await prisma.user.create({
        data: {
            email: 'estudiante@ejemplo.com',
            passwordHash: hashedPassword,
            role: client_1.UserRole.STUDENT,
            status: client_1.UserStatus.ACTIVE,
            verified: true,
            firstName: 'María',
            lastName: 'López',
            phone: '+34600345678',
            country: 'España',
            speciality: 'Estudiante de Psicología',
            lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
    });
    console.log('💳 Creating subscriptions...');
    await prisma.subscription.create({
        data: {
            userId: psychologist1.id,
            stripeSubscriptionId: 'sub_demo_ana_pro',
            status: 'active',
            planType: 'pro',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    });
    await prisma.subscription.create({
        data: {
            userId: psychologist2.id,
            stripeSubscriptionId: 'sub_demo_carlos_basic',
            status: 'active',
            planType: 'basic',
            currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        },
    });
    console.log('🧑‍⚕️ Creating clients...');
    const clients = [];
    const mockEncryptedData = Buffer.from(JSON.stringify({
        firstName: 'Encrypted First Name',
        lastName: 'Encrypted Last Name',
        dateOfBirth: '1980-01-01',
        email: 'encrypted@example.com',
        phone: '+34600000000',
        address: 'Encrypted Address'
    }));
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
    console.log('📝 Creating sessions...');
    for (let i = 0; i < 3; i++) {
        await prisma.session.create({
            data: {
                userId: psychologist1.id,
                clientId: clients[i].id,
                startTime: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
                endTime: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000),
                duration: 50,
                sessionType: 'INDIVIDUAL',
                status: 'COMPLETED',
                encryptedNotes: Buffer.from(JSON.stringify({ notes: `Sesión ${i + 1} - Progreso notable` })),
                recordingConsent: true,
                audioQuality: 'HIGH',
            },
        });
    }
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
//# sourceMappingURL=seed.js.map