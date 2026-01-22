import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetAdmin() {
    const email = 'admin@psicoaissist.com';
    const newPassword = 'password123';

    console.log(`Resetting password for ${email}...`);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.log('Admin user not found! Creating one...');
            await prisma.user.create({
                data: {
                    email,
                    passwordHash: hashedPassword,
                    firstName: 'Admin',
                    lastName: 'User',
                    role: 'ADMIN',
                    status: 'ACTIVE',
                    verified: true,
                    country: 'Spain'
                }
            });
            console.log('Admin user created.');
        } else {
            await prisma.user.update({
                where: { email },
                data: { passwordHash: hashedPassword, status: 'ACTIVE', verified: true }
            });
            console.log('Admin password updated.');
        }

    } catch (error) {
        console.error('Error resetting admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdmin();
