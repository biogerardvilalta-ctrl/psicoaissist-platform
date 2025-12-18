
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ReportsService } from '../modules/reports/reports.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { AiService } from '../modules/ai/ai.service';
import { ReportType } from '@prisma/client';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const reportsService = app.get(ReportsService);
    const prisma = app.get(PrismaService);

    // Hardcoded User ID from previous logs
    const userId = "cmj936enn00007m2jt8rvxmqb";

    console.log(`--- DEBUGGING REPORT GENERATION FOR USER ${userId} ---`);

    // 1. Find a Client
    const client = await prisma.client.findFirst({
        where: { userId }
    });

    if (!client) {
        console.error("No client found for user.");
        await app.close();
        return;
    }
    console.log(`Found Client: ${client.id}`);

    // 2. Find a Session
    const session = await prisma.session.findFirst({
        where: { userId, clientId: client.id },
        orderBy: { startTime: 'desc' }
    });

    if (!session) {
        console.error("No session found for client.");
        await app.close();
        return;
    }
    console.log(`Found Session: ${session.id} (Date: ${session.startTime})`);

    // 3. Test Generate Draft
    console.log("\n--- TESTING GENERATE DRAFT ---");
    try {
        const result = await reportsService.generateDraft(userId, {
            clientId: client.id,
            reportType: ReportType.PROGRESS,
            sessionIds: [session.id],
            additionalInstructions: "Debug run"
        });
        console.log("Draft Generated Successfully!");
        console.log("Content Length:", result.content.length);
        console.log("Snippet:", result.content.substring(0, 200));
    } catch (e) {
        console.error("Generate Draft FAILED:", e);
    }

    // 4. Test Create Report
    console.log("\n--- TESTING CREATE REPORT ---");
    try {
        const report = await reportsService.create(userId, {
            clientId: client.id,
            title: "Debug Report " + new Date().toISOString(),
            reportType: ReportType.PROGRESS,
            content: "Debug Content",
            status: "DRAFT"
        } as any);
        console.log("Report Created Successfully! ID:", report.id);

        // 5. Test Find All
        console.log("\n--- TESTING FIND ALL ---");
        const reports = await reportsService.findAll(userId);
        console.log(`Found ${reports.length} reports.`);
        const found = reports.find(r => r.id === report.id);
        if (found) {
            console.log(">> Created report WAS found in list.");
        } else {
            console.error(">> Created report WAS NOT found in list.");
        }

    } catch (e) {
        console.error("Create Report FAILED:", e);
    }

    await app.close();
}

bootstrap();
