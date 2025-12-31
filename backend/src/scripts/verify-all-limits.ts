
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../common/prisma/prisma.service';
import { ClientsService } from '../modules/clients/clients.service';
import { ReportsService } from '../modules/reports/reports.service';
import { SessionsService } from '../modules/sessions/sessions.service';
import { UsageLimitsService } from '../modules/payments/usage-limits.service';
import { EncryptionService } from '../modules/encryption/encryption.service';
import { AuditService } from '../modules/audit/audit.service';
import { AiService } from '../modules/ai/ai.service';
import { PdfService } from '../modules/reports/pdf.service';
import { GoogleService } from '../modules/google/google.service';
import { SessionsGateway } from '../modules/sessions/sessions.gateway';
import { ConfigModule } from '@nestjs/config';
import { PLAN_FEATURES, PlanLimits } from '../modules/payments/plan-features'; // REMOVED .ts
import { UserRole, ReportStatus, SessionStatus, SessionType } from '@prisma/client';
import { CreateClientDto } from '../modules/clients/dto/clients.dto';
import { CreateReportDto } from '../modules/reports/dto/reports.dto';
import { CreateSessionDto } from '../modules/sessions/dto/sessions.dto';

// Mocks
const mockAiService = {
    generateReportDraft: async () => "Draft Content",
    generateSessionAnalysis: async () => ({})
};
const mockPdfService = { generateReportPdf: async () => Buffer.from('pdf') };
const mockGoogleService = {
    insertEvent: async () => ({ id: 'g_event_id' }),
    updateEvent: async () => { },
    deleteEvent: async () => { }
};
const mockSessionsGateway = { emit: () => { } };

async function run() {
    console.log('--- STARTING COMPREHENSIVE LIMIT VERIFICATION ---');

    const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [ConfigModule.forRoot({ isGlobal: true })],
        providers: [
            PrismaService,
            ClientsService,
            ReportsService,
            SessionsService,
            UsageLimitsService,
            EncryptionService,
            AuditService,
            { provide: AiService, useValue: mockAiService },
            { provide: PdfService, useValue: mockPdfService },
            { provide: GoogleService, useValue: mockGoogleService },
            { provide: SessionsGateway, useValue: mockSessionsGateway },
        ],
    }).compile();

    const prisma = moduleRef.get<PrismaService>(PrismaService);
    const clientsService = moduleRef.get<ClientsService>(ClientsService);
    const reportsService = moduleRef.get<ReportsService>(ReportsService);
    const sessionsService = moduleRef.get<SessionsService>(SessionsService);

    const plans = Object.keys(PLAN_FEATURES);
    // Filter to standard plans if needed, or test all.
    // keys: demo, basic, pro, business, premium, premium_plus, clinics

    for (const plan of plans) {
        console.log(`\n\nTesting Plan: [${plan.toUpperCase()}]`);
        const limits = PLAN_FEATURES[plan];

        // 1. Create User
        const email = `verify_${plan}_${Date.now()}@test.com`;
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: 'dummy',
                firstName: 'Test',
                lastName: 'Plan',
                role: UserRole.PSYCHOLOGIST,
                subscription: {
                    create: {
                        planType: plan,
                        status: 'active',
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        stripeSubscriptionId: `sub_${plan}_${Date.now()}`
                    }
                },
                // For simulator limits relying on user fields
                simulatorUsageCount: 0,
                simulatorMinutesUsed: 0
            },
            include: { subscription: true }
        });

        // --- TEST CLIENT LIMIT ---
        console.log(`  > Clients Limit: ${limits.maxClients === -1 ? 'UNLIMITED' : limits.maxClients}`);
        if (limits.maxClients !== -1) {
            // Seed max clients
            if (limits.maxClients > 0) {
                const clientsData = Array.from({ length: limits.maxClients }).map((_, i) => ({
                    userId: user.id,
                    isActive: true,
                    encryptedPersonalData: Buffer.from('dummy'),
                    encryptionKeyId: 'dummy',
                    lastModifiedBy: user.id
                }));
                await prisma.client.createMany({ data: clientsData as any });
                console.log(`    Seeded ${limits.maxClients} clients.`);
            }

            // Attempt to create one more via Service
            try {
                await clientsService.create(user.id, { firstName: 'Over', lastName: 'Limit', riskLevel: 'LOW' } as any);
                console.error(`    ❌ FAILED: Allowed creating client > limit!`);
            } catch (e: any) {
                if (e.message?.includes('limit')) console.log(`    ✅ BLOCKED: ${e.message}`);
                else console.error(`    ❓ ERROR: ${e.message}`);
            }
        } else {
            console.log(`    Skipping check (Unlimited).`);
        }


        // --- TEST REPORT LIMIT ---
        console.log(`  > Reports Limit: ${limits.reportsPerMonth === -1 ? 'UNLIMITED' : limits.reportsPerMonth}`);
        if (limits.reportsPerMonth !== -1) {
            // Create a dummy client for relation
            const client = await prisma.client.create({
                data: {
                    userId: user.id,
                    encryptedPersonalData: Buffer.from(''),
                    encryptionKeyId: '',
                    lastModifiedBy: user.id
                } as any
            });

            if (limits.reportsPerMonth > 0) {
                const reportsData = Array.from({ length: limits.reportsPerMonth }).map((_, i) => ({
                    userId: user.id,
                    title: `Report ${i}`,
                    clientId: client.id,
                    reportType: 'INITIAL_EVALUATION' as const,
                    status: ReportStatus.COMPLETED,
                    createdAt: new Date(), // Current month
                    encryptedContent: Buffer.from(''),
                    encryptionKeyId: 'dummy'
                }));
                await prisma.report.createMany({ data: reportsData as any });
                console.log(`    Seeded ${limits.reportsPerMonth} reports.`);
            }

            // Attempt to create one more via Service
            try {
                await reportsService.create(user.id, { title: 'Over Limit', clientId: client.id, reportType: 'INITIAL_EVALUATION' } as any);
                console.error(`    ❌ FAILED: Allowed creating report > limit!`);
            } catch (e: any) {
                if (e.message?.includes('limit') || e.message?.includes('informes')) console.log(`    ✅ BLOCKED: ${e.message}`);
                else console.error(`    ❓ ERROR: ${e.message}`);
            }
        } else {
            console.log(`    Skipping check (Unlimited).`);
        }


        // --- TEST TRANSCRIPTION LIMIT ---
        console.log(`  > Transcription Limit: ${limits.transcriptionMinutes}`);
        if (limits.transcriptionMinutes !== -1) { // Assuming -1 is unlimited
            // Seed sessions to hit limit
            // Insert ONE session with duration = limit
            const client = await prisma.client.findFirst({ where: { userId: user.id } }) || await prisma.client.create({
                data: {
                    userId: user.id,
                    encryptedPersonalData: Buffer.from(''),
                    encryptionKeyId: 'dummy',
                    lastModifiedBy: user.id
                } as any
            });

            await prisma.session.create({
                data: {
                    userId: user.id,
                    clientId: client.id,
                    startTime: new Date(),
                    status: SessionStatus.COMPLETED,
                    duration: limits.transcriptionMinutes * 60, // seconds
                    sessionType: SessionType.INDIVIDUAL
                } as any
            });
            console.log(`    Seeded 1 session of ${limits.transcriptionMinutes} minutes.`);

            // Attempt to create one more via Service (Standard 60 min session)
            try {
                // Pass mock DTO
                await sessionsService.create(user.id, {
                    clientId: client.id,
                    startTime: new Date().toISOString(),
                    sessionType: SessionType.INDIVIDUAL
                } as any);
                console.error(`    ❌ FAILED: Allowed creating session > limit!`);
            } catch (e: any) {
                if (e.message?.includes('limit') || e.message?.includes('transcripción')) console.log(`    ✅ BLOCKED: ${e.message}`);
                else console.error(`    ❓ ERROR: ${e.message}`);
            }
        }


        // Cleanup User
        await prisma.client.deleteMany({ where: { userId: user.id } });
        await prisma.report.deleteMany({ where: { userId: user.id } });
        await prisma.session.deleteMany({ where: { userId: user.id } });
        await prisma.subscription.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
    }

    await prisma.$disconnect();
}

run().catch(console.error);
