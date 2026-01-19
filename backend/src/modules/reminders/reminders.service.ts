
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { EncryptionService } from '../encryption/encryption.service';
import { SessionStatus } from '@prisma/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DecryptedClientData {
    firstName: string;
    lastName: string;
}

@Injectable()
export class RemindersService {
    private readonly logger = new Logger(RemindersService.name);

    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
        private encryption: EncryptionService,
    ) { }

    @Cron(CronExpression.EVERY_HOUR)
    async handleCron() {
        this.logger.debug('Checking for upcoming sessions to remind...');
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

        // Find sessions starting in the next 24 hours that haven't been reminded
        // We look for anything up to "tomorrow", so if the cron runs every hour, 
        // it picks up sessions appearing in the 23h-24h window (or closer if missed).
        // To avoid spamming "immediate" sessions if system restarts, we might want a lower bound,
        // but "reminderSent: false" + "status: SCHEDULED" protects us mostly.
        const sessions = await this.prisma.session.findMany({
            where: {
                status: SessionStatus.SCHEDULED,
                reminderSent: false,
                startTime: {
                    gte: now,
                    lte: tomorrow
                }
            },
            include: {
                user: true,
                client: true
            }
        });

        this.logger.debug(`Found ${sessions.length} sessions to remind.`);

        for (const session of sessions) {
            try {
                // 0. Check if user has enabled reminders
                if (!session.user.enableReminders) {
                    continue;
                }

                // 1. Decrypt client name and contact info
                let clientName = 'Paciente';
                let clientEmail = '';
                let clientPhone = '';

                if (session.client.encryptedPersonalData && session.client.encryptionKeyId) {
                    try {
                        const unpacked = this.unpackClientData(
                            session.client.encryptedPersonalData,
                            session.client.encryptionKeyId
                        );
                        // Using 'any' as interface temporary to avoid redefining DecryptedClientData with phone/email fields strictly
                        const result = await this.encryption.decryptData<any>(unpacked);
                        if (result.success && result.data) {
                            clientName = `${result.data.firstName} ${result.data.lastName}`;
                            clientEmail = result.data.email;
                            clientPhone = result.data.phone;
                        }
                    } catch (e) {
                        this.logger.error(`Failed to decrypt client for session ${session.id}`, e);
                    }
                }

                // 2. Send email to Professional (User)
                const dateStr = format(session.startTime, "EEEE d 'de' MMMM", { locale: es });
                const timeStr = format(session.startTime, "HH:mm");

                // Notify Professional
                await this.emailService.sendSessionReminder(session.user.email, {
                    clientName,
                    date: dateStr,
                    time: timeStr,
                    type: session.sessionType
                });

                // 2b. Notify Client by Email
                if (session.client.sendEmailReminders && clientEmail) {
                    this.logger.log(`📧 Sending Reminder Email to Client ${clientName} (${clientEmail})`);
                    // Reuse/adapt sendSessionReminder or create specific method. For now reusing template but sending to client.
                    // Ideally we need a separate template 'sendClientSessionReminder'.
                    // Simulating send:
                    // await this.emailService.sendClientSessionReminder(clientEmail, { ... });
                }

                // 2c. Notify Client by WhatsApp
                if (session.client.sendWhatsappReminders && clientPhone) {
                    this.logger.log(`📱 Sending Whatsapp Reminder to Client ${clientName} (${clientPhone})`);
                    // Mock WhatsApp Service
                }

                // 3. Mark as sent
                await this.prisma.session.update({
                    where: { id: session.id },
                    data: { reminderSent: true }
                });

                this.logger.log(`Reminder processed for session ${session.id}`);

            } catch (error) {
                this.logger.error(`Failed to process reminder for session ${session.id}`, error);
            }
        }
    }

    // Helper reused from SessionsService (ideally moved to EncryptionService or shared util)
    private unpackClientData(buffer: Buffer, keyId: string) {
        const iv = buffer.subarray(0, 16).toString('base64');
        const tag = buffer.subarray(16, 32).toString('base64');
        const encryptedData = buffer.subarray(32);
        return { iv, tag, encryptedData, keyId };
    }

    // Cron: At 20:00 every day
    // Sends a summary email to the psychologist with tomorrow's sessions
    @Cron('0 20 * * *')
    async handleDailyAgendaSummary() {
        this.logger.debug('Running Daily Agenda Summary Cron...');
        const now = new Date();

        // Define "Tomorrow" range (00:00 to 23:59 of next day)
        const tomorrowStart = new Date(now);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);
        tomorrowStart.setHours(0, 0, 0, 0);

        const tomorrowEnd = new Date(tomorrowStart);
        tomorrowEnd.setHours(23, 59, 59, 999);

        // 1. Find users who have reminders enabled
        const users = await this.prisma.user.findMany({
            where: {
                enableReminders: true,
                status: 'ACTIVE'
            },
            select: { id: true, email: true }
        });

        this.logger.log(`Found ${users.length} users with reminders enabled for daily summary.`);

        for (const user of users) {
            try {
                // 2. Find sessions for this user tomorrow
                const sessions = await this.prisma.session.findMany({
                    where: {
                        userId: user.id,
                        status: SessionStatus.SCHEDULED,
                        startTime: {
                            gte: tomorrowStart,
                            lte: tomorrowEnd
                        }
                    },
                    orderBy: { startTime: 'asc' },
                    include: {
                        client: true
                    }
                });

                if (sessions.length === 0) {
                    continue; // No sessions, no email needed
                }

                // 3. Prepare data for email
                const sessionSummaries = [];

                for (const session of sessions) {
                    let clientName = 'Paciente';

                    // Decrypt patient name if needed
                    if (session.client.encryptedPersonalData && session.client.encryptionKeyId) {
                        try {
                            const unpacked = this.unpackClientData(
                                session.client.encryptedPersonalData,
                                session.client.encryptionKeyId
                            );
                            // Using 'any' as interface temporary
                            const result = await this.encryption.decryptData<any>(unpacked);
                            if (result.success && result.data) {
                                clientName = `${result.data.firstName} ${result.data.lastName}`;
                            }
                        } catch (e) {
                            // Keep default name
                        }
                    }

                    sessionSummaries.push({
                        time: format(session.startTime, 'HH:mm'),
                        patient: clientName,
                        type: session.sessionType
                    });
                }

                // 4. Send Email
                await this.emailService.sendDailyUpcomingSessions(user.email, sessionSummaries);
                this.logger.log(`Sent daily agenda summary to ${user.email} (${sessions.length} sessions)`);

            } catch (error) {
                this.logger.error(`Failed to send daily summary to user ${user.id}`, error);
            }
        }
    }
}
