"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🔄 Resetting passwords...');
    const adminHash = await bcrypt.hash('admin123', 10);
    await prisma.user.update({
        where: { email: 'admin@psychoai.com' },
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
//# sourceMappingURL=reset_password.js.map