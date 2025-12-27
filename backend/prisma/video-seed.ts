import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🎥 Starting DEMO VIDEO database seed...');

    // 1. Create a "Demo Psychologist" User
    const hashedPassword = await bcrypt.hash('password123', 10);
    const demoUserEmail = 'video.demo@psicoaissist.com';

    // Check if user exists, if not create
    let user = await prisma.user.findUnique({ where: { email: demoUserEmail } });

    if (!user) {
        user = await prisma.user.create({
            data: {
                email: demoUserEmail,
                passwordHash: hashedPassword,
                role: UserRole.PSYCHOLOGIST,
                status: UserStatus.ACTIVE,
                verified: true,
                firstName: 'Dra. Andrea',
                lastName: 'VideoDemo',
                country: 'España',
                professionalNumber: 'VID-001',
                speciality: 'Psicología Clínica',
                lastLogin: new Date(),
            },
        });
        console.log(`✅ Created Demo User: ${user.email}`);
    } else {
        console.log(`ℹ️ User ${demoUserEmail} already exists. Using existing ID.`);
    }

    // 2. Clear previous demo data for this user to ensure a clean state
    console.log('🧹 Cleaning previous demo data for this user...');
    await prisma.client.deleteMany({ where: { userId: user.id } });
    // Sessions cascade delete usually, but let's be safe if relationships allow
    // (In this schema, we might need to find clients first if no cascade is set up, 
    // but assuming standard relation delete)

    // 3. Create "Demo Patients" (Visual Data for Dashboard)
    const patientsData = [
        { name: 'Marta Ejemplo', tags: ['Ansiedad', 'Trabajo'], risk: 'LOW', sessions: 5 },
        { name: 'Juan Prueba', tags: ['Depresión', 'Duelo'], risk: 'MEDIUM', sessions: 12 },
        { name: 'Sofía Demo', tags: ['Autoestima', 'Joven'], risk: 'LOW', sessions: 3 },
        { name: 'Alejandro Test', tags: ['Estrés', 'Familia'], risk: 'HIGH', sessions: 8 },
    ];

    console.log('👥 Creating Demo Patients...');

    const createdClients = [];

    // Mock encryption key (in real app this is managed securely)
    const mockKeyId = 'demo-video-key-id';

    for (const p of patientsData) {
        const [firstName, lastName] = p.name.split(' ');

        // Create realistic recent date
        const lastSessionDate = new Date();
        lastSessionDate.setDate(lastSessionDate.getDate() - Math.floor(Math.random() * 10));

        const client = await prisma.client.create({
            data: {
                userId: user.id,
                // Mock encrypted data
                encryptedPersonalData: Buffer.from(JSON.stringify({
                    firstName,
                    lastName,
                    email: `${firstName.toLowerCase()}@demo.com`,
                    phone: '+34600111222'
                })),
                tags: p.tags,
                riskLevel: p.risk as any,
                isActive: true,
                encryptionKeyId: mockKeyId,
                dataVersion: 1,
                lastModifiedBy: user.id,
                firstSessionAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
            }
        });
        createdClients.push(client);
    }

    // 4. Create Sessions with "Fake" AI Analysis data
    console.log('📝 Creating Sessions with AI Data...');

    const topics = ['Trabajo', 'Familia', 'Ansiedad Social', 'Sueño', 'Autoexigencia'];
    const interventions = ['Reestructuración Cognitiva', 'Mindfulness', 'Validación Emocional'];

    for (const client of createdClients) {
        // Create 3 past sessions for each
        for (let i = 1; i <= 3; i++) {
            await prisma.session.create({
                data: {
                    userId: user.id,
                    clientId: client.id,
                    startTime: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
                    endTime: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000),
                    duration: 50,
                    sessionType: 'INDIVIDUAL',
                    status: 'COMPLETED',
                    encryptedNotes: Buffer.from(JSON.stringify({ notes: `Sesión de demo ${i} para video.` })),
                    // In a real scenario, AI analysis would be stored in a related table or JSON field.
                    // Assuming basic session creation is enough for the "Calendar" and "Patient List" widgets.
                }
            });
        }
    }

    console.log('✅ DEMO VIDEO SEED COMPLETE');
    console.log(`\n👉 LOGIN CREDENTIALS FOR VIDEO:\nEmail: ${demoUserEmail}\nPassword: password123`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
