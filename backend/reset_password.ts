
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Resetting passwords...');

    const adminHash = await bcrypt.hash('admin123', 10);
    await prisma.user.update({
        where: { email: 'admin@psycoai.com' },
        data: { passwordHash: adminHash }
    });
    console.log('✅ Admin password set to: admin123');

    const demoHash = await bcrypt.hash('demo123', 10);
    await prisma.user.updateMany({
        where: {
            email: { in: ['dr.martinez@ejemplo.com', 'dr.garcia@ejemplo.com', 'estudiante@ejemplo.com'] }
        },
        data: { passwordHash: demoHash }
    });
    console.log('✅ Other users password set to: demo123');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
