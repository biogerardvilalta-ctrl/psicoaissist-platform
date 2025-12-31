
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ClientsService } from '../src/modules/clients/clients.service';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { RiskLevel } from '@prisma/client';
import { CreateClientDto } from '../src/modules/clients/dto/clients.dto';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const clientsService = app.get(ClientsService);
    const prismaService = app.get(PrismaService);

    const targetEmail = 'basic@plan.com';
    console.log(`Finding user with email: ${targetEmail}`);

    const user = await prismaService.user.findUnique({
        where: { email: targetEmail },
    });

    if (!user) {
        console.error(`User ${targetEmail} not found!`);
        await app.close();
        process.exit(1);
    }

    console.log(`User found: ${user.id} (${user.firstName} ${user.lastName})`);

    const firstNames = ['Ana', 'Carlos', 'Maria', 'Jose', 'Laura', 'David', 'Sofia', 'Daniel', 'Elena', 'Miguel', 'Lucia', 'Pablo'];
    const lastNames = ['Garcia', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres'];
    const diagnoses = ['Ansiedad Leve', 'Depresión Moderada', 'Estrés Laboral', 'Problemas de Pareja', 'TDAH', 'Insomnio', 'Duelo'];

    console.log('Starting seeding of 24 patients...');

    for (let i = 0; i < 24; i++) {
        const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
        const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
        const diagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];
        const risk = Object.values(RiskLevel)[Math.floor(Math.random() * Object.values(RiskLevel).length)];

        const dto: CreateClientDto = {
            firstName: fn,
            lastName: ln,
            email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
            phone: `+346000000${i.toString().padStart(2, '0')}`,
            diagnosis: diagnosis,
            riskLevel: risk,
            notes: `Paciente generado automáticamente número ${i + 1}`,
            tags: ['demo', 'auto-generated'],
            sendEmailReminders: true,
            sendWhatsappReminders: false,
        };

        try {
            const client = await clientsService.create(user.id, dto);
            console.log(`[${i + 1}/24] Created patient: ${client.firstName} ${client.lastName} (ID: ${client.id})`);
        } catch (error) {
            console.error(`Failed to create patient ${i + 1}:`, error.message);
        }
    }

    console.log('Seeding complete!');
    await app.close();
}

bootstrap();
