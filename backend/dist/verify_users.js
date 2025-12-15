"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const users = await prisma.user.findMany();
    console.log('--- USERS IN DB ---');
    users.forEach(u => {
        console.log(`ID: ${u.id}`);
        console.log(`Email: ${u.email}`);
        console.log(`Role: ${u.role}`);
        console.log(`Status: ${u.status}`);
        console.log(`Hash (start): ${u.passwordHash.substring(0, 10)}...`);
        console.log('-------------------');
    });
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=verify_users.js.map