
import { PrismaService } from '../common/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'pro@plan.com';
    console.log(`Simulating Monthly Renewal for ${email}...`);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.error('User not found');
        return;
    }

    // Reset Usage to 0. 
    // Keep extraTranscriptionMinutes as is (currently 0 from previous test).

    await prisma.user.update({
        where: { id: user.id },
        data: {
            transcriptionMinutesUsed: 0,
            // We do NOT reset extraTranscriptionMinutes here, assuming packs generally rollover or simply are consumed.
            // If they are consumed (0), they stay 0.
        }
    });

    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    console.log(`Renewal Complete.`);
    console.log(`Usage: ${updated?.transcriptionMinutesUsed}`);
    console.log(`Extra Balance: ${updated?.extraTranscriptionMinutes}`);

    // Check if bar would show
    const baseLimit = 900;
    const extra = updated?.extraTranscriptionMinutes || 0;
    const used = updated?.transcriptionMinutesUsed || 0;

    const showBar = (extra > 0) || (used > (baseLimit - extra));
    console.log(`Bar Should be Visible? ${showBar}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
