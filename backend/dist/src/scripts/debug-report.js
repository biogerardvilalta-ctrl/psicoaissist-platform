"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const reports_service_1 = require("../modules/reports/reports.service");
const prisma_service_1 = require("../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const reportsService = app.get(reports_service_1.ReportsService);
    const prisma = app.get(prisma_service_1.PrismaService);
    const userId = "cmj936enn00007m2jt8rvxmqb";
    console.log(`--- DEBUGGING REPORT GENERATION FOR USER ${userId} ---`);
    const client = await prisma.client.findFirst({
        where: { userId }
    });
    if (!client) {
        console.error("No client found for user.");
        await app.close();
        return;
    }
    console.log(`Found Client: ${client.id}`);
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
    console.log("\n--- TESTING GENERATE DRAFT ---");
    try {
        const result = await reportsService.generateDraft(userId, {
            clientId: client.id,
            reportType: client_1.ReportType.PROGRESS,
            sessionIds: [session.id],
            additionalInstructions: "Debug run"
        });
        console.log("Draft Generated Successfully!");
        console.log("Content Length:", result.content.length);
        console.log("Snippet:", result.content.substring(0, 200));
    }
    catch (e) {
        console.error("Generate Draft FAILED:", e);
    }
    console.log("\n--- TESTING CREATE REPORT ---");
    try {
        const report = await reportsService.create(userId, {
            clientId: client.id,
            title: "Debug Report " + new Date().toISOString(),
            reportType: client_1.ReportType.PROGRESS,
            content: "Debug Content",
            status: "DRAFT"
        });
        console.log("Report Created Successfully! ID:", report.id);
        console.log("\n--- TESTING FIND ALL ---");
        const reports = await reportsService.findAll(userId);
        console.log(`Found ${reports.length} reports.`);
        const found = reports.find(r => r.id === report.id);
        if (found) {
            console.log(">> Created report WAS found in list.");
        }
        else {
            console.error(">> Created report WAS NOT found in list.");
        }
    }
    catch (e) {
        console.error("Create Report FAILED:", e);
    }
    await app.close();
}
bootstrap();
//# sourceMappingURL=debug-report.js.map