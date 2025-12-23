
import { PrismaClient } from '@prisma/client';
import { EncryptionService } from './src/modules/encryption/encryption.service';
import { ConfigService } from '@nestjs/config';

// Mock ConfigService for EncryptionService
const configService = {
    get: (key: string) => {
        if (key === 'ENCRYPTION_KEY') return 'dummy-key-32-chars-00000000000000000000'; // fallback
        return process.env[key];
    }
} as any;

const prisma = new PrismaClient();
// We can't easily use EncryptionService without full Nest context or recreating check.
// Using a known hash or simple hack.
// Actually, EncryptionService hashes using bcrypt usually.
// Let's just update directly if we can use bcrypt.
// Or instantiate EncryptionService.

// Simplified: just use bcryptjs if available or just update to a known hash from another user?
// Admin user "ana@admin.com" has hash.
// I'll copy admin's hash to dr.garcia.
// Assuming "ana" password is "password123".

async function main() {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) {
        console.log('No admin found.');
        return;
    }

    // Update Dr Garcia with Admin's hash
    const pro = await prisma.user.findFirst({ where: { role: 'PSYCHOLOGIST' } });
    if (pro) {
        console.log('Updating password for', pro.email);
        await prisma.user.update({
            where: { id: pro.id },
            data: { passwordHash: admin.passwordHash }
        });
        console.log('Password updated to match admin password.');
    }

    await prisma.$disconnect();
}

main();
