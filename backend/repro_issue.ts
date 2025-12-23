
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

function mapToResponseDto(user: any) {
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        enableReminders: user.enableReminders,
        defaultDuration: user.defaultDuration,
        bufferTime: user.bufferTime,
        workStartHour: user.workStartHour,
        workEndHour: user.workEndHour,
        scheduleConfig: user.scheduleConfig,
        preferredLanguage: user.preferredLanguage,
        dashboardLayout: user.dashboardLayout,
        hourlyRate: user.hourlyRate,
    };
}

async function main() {
    console.log('Connecting...');

    const pro = await prisma.user.findFirst({
        where: { role: 'PSYCHOLOGIST' }
    });

    if (!pro) {
        console.log('No psychologist found.');
        return;
    }

    // Create a dummy Agenda Manager
    const email = `test.manager.${Date.now()}@test.com`;
    console.log('Creating dummy manager:', email);

    const manager = await prisma.user.create({
        data: {
            email: email,
            passwordHash: 'dummy',
            firstName: 'Test',
            lastName: 'Manager',
            role: 'AGENDA_MANAGER',
            status: 'ACTIVE',
            managedProfessionals: {
                connect: { id: pro.id }
            }
        }
    });

    console.log('Manager created with ID:', manager.id);

    try {
        const managers = await prisma.user.findMany({
            where: {
                role: 'AGENDA_MANAGER',
                managedProfessionals: {
                    some: { id: pro.id }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        console.log('Query successful. Managers found:', managers.length);

        const mapped = managers.map(mapToResponseDto);
        console.log('Mapping successful:', JSON.stringify(mapped, null, 2));

    } catch (e) {
        console.error('Error:', e);
    } finally {
        // Clean up
        await prisma.user.delete({ where: { id: manager.id } });
        await prisma.$disconnect();
    }
}

main();
