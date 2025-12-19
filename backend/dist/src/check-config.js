"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const user = await prisma.user.findFirst();
    if (user) {
        console.log('User ID:', user.id);
        console.log('Schedule Config:', JSON.stringify(user.scheduleConfig, null, 2));
    }
    else {
        console.log('No user found');
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=check-config.js.map