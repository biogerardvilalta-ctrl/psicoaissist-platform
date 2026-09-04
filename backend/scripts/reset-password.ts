
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'ger@ger.com';
    const newPassword = 'password123';

    console.log(`Resetting password for: ${email}`);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
        where: { email },
        data: {
            passwordHash: hashedPassword,
            status: 'ACTIVE' // Ensure active
        }
    });

    console.log(`Password reset successfully for user ID: ${user.id}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
